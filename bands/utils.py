# bands/utils.py
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import threading
import logging

logger = logging.getLogger(__name__)

def _send_message(message: EmailMultiAlternatives):
    try:
        message.send(fail_silently=False)
    except Exception as exc:
        logger.exception("Failed to send email: %s", exc)

def send_registration_email(team, async_send: bool = True, bcc_admin: bool = True):
    """
    Send registration confirmation email to the team's leader.
    - team: Team instance (must have leader_email, leader_name, name, city)
    - async_send: if True, send in a background thread (good for low-volume apps)
    """
    to_email = team.leader_email
    if not to_email:
        logger.warning("Team %s has no leader_email; skipping registration email", team.pk)
        return

    context = {
        'leader_name': team.leader_name,
        'leader_email': team.leader_email,
        'team_name': team.name,
        'team_city': team.city or '',
        'year': getattr(team, 'year', None) or '',
    }

    subject = f"Registration Confirmed — {team.name}"
    html_body = render_to_string('bands/emails/registration_welcome.html', context)
    text_body = render_to_string('bands/emails/registration_welcome.txt', context)
    text_body = strip_tags(text_body)  # ensure text

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', settings.EMAIL_HOST_USER),
        to=[to_email],
    )
    msg.attach_alternative(html_body, "text/html")

    # optional BCC to admin(s)
    if bcc_admin and getattr(settings, 'DEFAULT_FROM_EMAIL', None):
        admin_bcc = [getattr(settings, 'DEFAULT_FROM_EMAIL')]
        msg.bcc = (msg.bcc or []) + admin_bcc

    if async_send:
        # small-scale background sending using threading
        thread = threading.Thread(target=_send_message, args=(msg,), daemon=True)
        thread.start()
    else:
        _send_message(msg)
