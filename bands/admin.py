from django.contrib import admin
from .models import Team, Member

class MemberInline(admin.TabularInline):
    model = Member
    extra = 0
    fields = ('name','gender','phone','email')
    # fields = ('name','role','gender','phone','email','is_leader')

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name','city','leader_name','leader_email','created_at')
    search_fields = ('name','city','leader_name','leader_email')
    inlines = [MemberInline]
