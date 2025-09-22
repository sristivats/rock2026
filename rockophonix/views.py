from django.shortcuts import render

def homepage(request):
    return render(request, 'rockophonix/home.html')