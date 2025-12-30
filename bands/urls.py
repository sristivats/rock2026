from django.urls import path
from . import views

app_name = 'bands'

urlpatterns = [
    # Public URLs
    path('', views.home, name='home'),
    path('register/', views.registration, name='register'),
    
    # Dashboard URLs
    path('dashboard/login/', views.dashboard_login, name='dashboard_login'),
    path('dashboard/logout/', views.dashboard_logout, name='dashboard_logout'),
    path('dashboard/', views.dashboard_home, name='dashboard_home'),
    path('dashboard/team/<int:team_id>/', views.team_detail, name='team_detail'),
]
