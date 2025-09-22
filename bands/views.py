from django.shortcuts import render, redirect
from django.db import transaction
from django.urls import reverse
from django.contrib import messages
from .models import Team, Member, ROLE_CHOICES

def registration_view(request):
    if request.method == "POST":
        # Extract team-level fields (names match suggested template below)
        team_name = request.POST.get('team_name', '').strip()
        city = request.POST.get('city', '').strip()
        performance_link = request.POST.get('performance_link', '').strip()

        leader_name = request.POST.get('leader_name', '').strip()
        leader_gender = request.POST.get('leader_gender', 'O')
        leader_phone = request.POST.get('leader_phone', '').strip()
        leader_email = request.POST.get('leader_email', '').strip()

        # Basic server-side validation (expand as needed)
        if not team_name or not leader_name or not leader_phone or not leader_email:
            messages.error(request, "Please fill team name and leader contact fields.")
            return render(request, 'bands/registration.html')

        # Member arrays (client uses name="member_name[]" etc.)
        member_names = request.POST.getlist('member_name[]')
        member_genders = request.POST.getlist('member_gender[]')
        member_phones = request.POST.getlist('member_phone[]')     # recommend adding these in template
        member_emails = request.POST.getlist('member_email[]')
        member_roles = request.POST.getlist('member_role[]')      # recommend adding role select in template

        # Ensure arrays line up
        n_members = len(member_names)
        # if n_members == 0: optionally enforce at least 1 member
        try:
            with transaction.atomic():
                # optional duplicate check by leader_email + year
                if Team.objects.filter(leader_email=leader_email, year=Team._meta.get_field('year').default).exists():
                    messages.error(request, "A registration with this leader email already exists for this year.")
                    return render(request, 'bands/registration.html')

                team = Team.objects.create(
                    name=team_name,
                    city=city,
                    performance_link=performance_link or None,
                    leader_name=leader_name,
                    leader_gender=leader_gender,
                    leader_phone=leader_phone,
                    leader_email=leader_email,
                )

                # create members
                created_members = []
                for i in range(n_members):
                    nm = member_names[i].strip()
                    if not nm:
                        continue
                    gen = member_genders[i] if i < len(member_genders) else 'O'
                    ph = member_phones[i] if i < len(member_phones) else ''
                    em = member_emails[i] if i < len(member_emails) else ''
                    rl = member_roles[i] if i < len(member_roles) else 'Other'
                    # Normalize role to known choice
                    if rl not in dict(ROLE_CHOICES):
                        rl = 'Other'

                    is_leader = (nm == leader_name) or (em and em == leader_email)

                    m = Member.objects.create(
                        team=team,
                        name=nm,
                        gender=gen if gen in dict(Member._meta.get_field('gender').choices) else 'O',
                        phone=ph,
                        email=em or None,
                        role=rl,
                        is_leader=is_leader
                    )
                    created_members.append(m)

                # Recompute role counts from members and save
                counts = {'Drummer':0,'Guitarist':0,'Bassist':0,'Vocalist':0}
                for m in team.members.all():
                    if m.role in counts:
                        counts[m.role] += 1
                team.drummers = counts['Drummer']
                team.guitarists = counts['Guitarist']
                team.bassists = counts['Bassist']
                team.vocalists = counts['Vocalist']
                team.save()

                messages.success(request, "Registration successful!")
                return redirect(reverse('bands:home'))
        except Exception as e:
            # log error in real app
            messages.error(request, f"Error processing registration: {e}")
            return render(request, 'bands/registration.html')

    # GET
    return render(request, 'bands/registration.html')

def home(request):
    teams = Team.objects.order_by('-created_at')[:20]
    return render(request, 'bands/home.html', {'teams': teams})