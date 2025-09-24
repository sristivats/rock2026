from django.shortcuts import render, redirect
from django.db import transaction
from django.urls import reverse
from django.contrib import messages
from django.utils import timezone
from django.db.models import Count

from .models import Team, Member, ROLE_CHOICES


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
