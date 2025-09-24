from django.urls import path
from . import views

app_name = 'bands'

urlpatterns = [
    path('register/', views.registration, name='register'),
    path('', views.home, name='home'),
]
