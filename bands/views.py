from django.shortcuts import render, redirect
from django.db import transaction
from django.urls import reverse
from django.contrib import messages
from django.utils import timezone
from django.db.models import Count
from django.db.models import Q
from functools import wraps
from . import dashboard_config
import csv
from django.http import HttpResponse

from .models import Team, Member, ROLE_CHOICES
from .utils import send_registration_email


def registration(request):
    """
    Handles team registration form. Expects dynamic member inputs with names:
      - member_name[]
      - member_gender[]
      - member_phone[]
      - member_email[]
      - member_role[]
    """
    if request.method == "POST":
        # --- Team fields ---
        team_name = request.POST.get('team_name', '').strip()
        team_city = request.POST.get('city', '').strip()
        performance_link = request.POST.get('performance_link', '').strip()

        # --- Leader fields (kept only on Team) ---
        leader_name = request.POST.get('leader_name', '').strip()
        leader_gender = request.POST.get('leader_gender', 'O')
        leader_phone = request.POST.get('leader_phone', '').strip()
        leader_email = request.POST.get('leader_email', '').strip()

        # minimal server-side validation
        if not team_name or not leader_name or not leader_phone or not leader_email:
            messages.error(request, "Please fill team name and leader contact fields.")
            return render(request, 'bands/registration.html')

        # --- Member arrays (from dynamic form) ---
        member_name_list = request.POST.getlist('member_name[]')
        member_gender_list = request.POST.getlist('member_gender[]')
        member_phone_list = request.POST.getlist('member_phone[]')
        member_email_list = request.POST.getlist('member_email[]')
        member_role_list = request.POST.getlist('member_role[]')

        try:
            with transaction.atomic():
                # duplicate-check for current year
                current_year = timezone.now().year
                if Team.objects.filter(leader_email=leader_email, year=current_year).exists():
                    messages.error(request, "A registration with this leader email already exists for this year.")
                    return render(request, 'bands/registration.html')

                # create Team row
                team = Team.objects.create(
                    name=team_name,
                    city=team_city,
                    performance_link=performance_link or None,
                    leader_name=leader_name,
                    leader_gender=leader_gender,
                    leader_phone=leader_phone,
                    leader_email=leader_email,
                )

                # prepare Member instances (do not mark anyone as leader)
                valid_role_keys = {r for r, _ in ROLE_CHOICES}
                member_instances = []
                for idx, mname in enumerate(member_name_list):
                    name = mname.strip()
                    if not name:
                        continue
                    gender = member_gender_list[idx] if idx < len(member_gender_list) else 'O'
                    phone = member_phone_list[idx] if idx < len(member_phone_list) else ''
                    email = member_email_list[idx] if idx < len(member_email_list) else ''
                    role = member_role_list[idx] if idx < len(member_role_list) else 'Other'
                    # normalize role
                    if role not in valid_role_keys:
                        role = 'Other'
                    # normalize gender
                    gender_choices = dict(Member._meta.get_field('gender').choices)
                    if gender not in gender_choices:
                        gender = 'O'

                    member_instances.append(Member(
                        team=team,
                        name=name,
                        gender=gender,
                        phone=phone,
                        email=email or None,
                        role=role,
                        is_leader=False,   # explicit: don't mark any member as leader
                    ))

                # bulk insert members (efficient)
                if member_instances:
                    Member.objects.bulk_create(member_instances)

                # compute role counts from DB (query guarantees correct saved counts)
                role_counts_qs = Member.objects.filter(team=team).values('role').annotate(count=Count('id'))
                counts_map = {'Drummer': 0, 'Guitarist': 0, 'Bassist': 0, 'Vocalist': 0}
                for rc in role_counts_qs:
                    role_key = rc['role']
                    if role_key in counts_map:
                        counts_map[role_key] = rc['count']

                # save denormalized counts on team
                team.drummers = counts_map['Drummer']
                team.guitarists = counts_map['Guitarist']
                team.bassists = counts_map['Bassist']
                team.vocalists = counts_map['Vocalist']
                team.save(update_fields=['drummers', 'guitarists', 'bassists', 'vocalists'])

                messages.success(request, "Registration successful!")

                # send confirmation email to leader (non-blocking)
                try:
                    send_registration_email(team, async_send=True)
                except Exception:
                    # already logged in utils — don't reveal internals to user
                    logger = __import__('logging').getLogger(__name__)
                    logger.exception("send_registration_email raised unexpectedly")

                return redirect(reverse('bands:home'))

        except Exception as exc:
            # In production log the exception; for now show message and let user retry
            messages.error(request, f"Error processing registration: {exc}")
            return render(request, 'bands/registration.html')

    # GET: render form
    return render(request, 'bands/registration.html')


def home(request):
    teams = Team.objects.order_by('-created_at')[:20]
    return render(request, 'bands/home.html', {'teams': teams})

# --- Dashboard Authentication Helper ---

def dashboard_login_required(view_func):
    """
    Custom decorator to check if user is logged in via our hardcoded system.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        # Check if the specific session key is set to True
        if not request.session.get(dashboard_config.SESSION_KEY):
            return redirect(reverse('bands:dashboard_login'))
        return view_func(request, *args, **kwargs)
    return _wrapped_view


# --- Dashboard Views ---

def dashboard_login(request):
    """
    Renders login form and validates against hardcoded dictionary.
    """
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        # Check credentials against dashboard_config.py
        stored_password = dashboard_config.AUTHORIZED_USERS.get(username)

        if stored_password and stored_password == password:
            # Success: Set session variable
            request.session[dashboard_config.SESSION_KEY] = True
            messages.success(request, f"Welcome, {username}!")
            return redirect(reverse('bands:dashboard_home'))
        else:
            messages.error(request, "Invalid username or password.")

    return render(request, 'bands/dashboard/login.html')


def dashboard_logout(request):
    """
    Clears the custom session key.
    """
    if dashboard_config.SESSION_KEY in request.session:
        del request.session[dashboard_config.SESSION_KEY]
    messages.info(request, "Logged out successfully.")
    return redirect(reverse('bands:home'))


@dashboard_login_required
def dashboard_home(request):
    """
    Main Dashboard:
    - Lists Teams and Members
    - Handles Search for both sections
    """
    team_query = request.GET.get('q_team', '')
    member_query = request.GET.get('q_member', '')

    # Fetch Teams (Filtered)
    teams = Team.objects.all().order_by('-created_at')
    if team_query:
        teams = teams.filter(
            Q(name__icontains=team_query) | 
            Q(city__icontains=team_query) |
            Q(leader_name__icontains=team_query)
        )

    # Fetch Members (Filtered)
    members = Member.objects.all().select_related('team').order_by('name')
    if member_query:
        members = members.filter(
            Q(name__icontains=member_query) |
            Q(role__icontains=member_query)
        )

    context = {
        'teams': teams,
        'members': members,
        'q_team': team_query,
        'q_member': member_query,
        'total_teams': teams.count(),
        'total_members': members.count()
    }
    return render(request, 'bands/dashboard/index.html', context)


@dashboard_login_required
def team_detail(request, team_id):
    """
    Detailed view for a specific team.
    """
    try:
        team = Team.objects.get(pk=team_id)
        members = team.members.all()
    except Team.DoesNotExist:
        messages.error(request, "Team not found.")
        return redirect('bands:dashboard_home')

    context = {
        'team': team,
        'members': members
    }
    return render(request, 'bands/dashboard/team_detail.html', context)

@dashboard_login_required
def export_csv(request):
    """
    Generates a CSV file containing all teams, leaders, and members.
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="rockophonix_participants.csv"'

    writer = csv.writer(response)
    
    # CSV Header
    writer.writerow([
        'Team ID', 'Team Name', 'City', 'Performance Link', 'Registration Date',
        'Participant Type', 'Name', 'Role', 'Gender', 'Phone', 'Email', 
        'Is Leader'
    ])

    teams = Team.objects.all().prefetch_related('members').order_by('-created_at')

    for team in teams:
        # 1. Write the Team Leader row
        # Note: Leaders are stored on the Team model, separate from Member table in your current architecture.
        writer.writerow([
            team.id,
            team.name,
            team.city,
            team.performance_link,
            team.created_at.strftime('%Y-%m-%d %H:%M'),
            'Leader',              # Participant Type
            team.leader_name,
            'Team Leader',         # Role
            team.get_leader_gender_display(),
            team.leader_phone,
            team.leader_email,
            'Yes'                  # Is Leader
        ])

        # 2. Write rows for each Team Member
        for member in team.members.all():
            # Check if this member is actually the leader (by email) to avoid duplicates if users entered themselves twice
            is_duplicate_leader = (member.email and member.email == team.leader_email)
            
            writer.writerow([
                team.id,
                team.name,
                team.city,
                team.performance_link,
                team.created_at.strftime('%Y-%m-%d %H:%M'),
                'Member',          # Participant Type
                member.name,
                member.role,
                member.get_gender_display(),
                member.phone,
                member.email,
                'Yes' if is_duplicate_leader else 'No'
            ])

    return response