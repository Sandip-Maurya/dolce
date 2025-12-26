"""
URL configuration for users app.
"""
from django.urls import path
from .views import login_view, signup_view, logout_view, profile_view, me_view

app_name = 'users'

urlpatterns = [
    path('login/', login_view, name='login'),
    path('signup/', signup_view, name='signup'),
    path('logout/', logout_view, name='logout'),
    path('me/', me_view, name='me'),
    path('profile/', profile_view, name='profile'),
]

