from django.db import models
from django.core.validators import RegexValidator, MinValueValidator
from django.utils import timezone

GENDER_CHOICES = [
    ('M', 'Male'),
    ('F', 'Female'),
    ('O', 'Other'),
]

ROLE_CHOICES = [
    ('Drummer', 'Drummer'),
    ('Guitarist', 'Guitarist'),
    ('Bassist', 'Bassist'),
    ('Vocalist', 'Vocalist'),
    ('Other', 'Other'),
]

phone_validator = RegexValidator(
    regex=r'^\+?\d{7,15}$',
    message='Enter a valid phone number'
)


class Team(models.Model):
    name = models.CharField(max_length=120)
    city = models.CharField(max_length=80)
    performance_link = models.URLField(blank=True, null=True)   # or FileField if uploads

    # denormalized counts, kept in sync with members
    drummers = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    guitarists = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    bassists = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    vocalists = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])

    # leader quick fields (for contact & deduplication)
    leader_name = models.CharField(max_length=120)
    leader_gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    leader_phone = models.CharField(max_length=20, validators=[phone_validator])
    leader_email = models.EmailField()

    created_at = models.DateTimeField(auto_now_add=True)
    year = models.PositiveIntegerField(default=timezone.now().year)

    class Meta:
        # avoid same team name registering twice in the same year
        unique_together = ('name', 'year')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.city})"


class Member(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    name = models.CharField(max_length=120)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    phone = models.CharField(max_length=20, validators=[phone_validator])
    email = models.EmailField(blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Other')
    is_leader = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.role})"
