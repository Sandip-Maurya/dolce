"""
URL configuration for orders app.
"""
from django.urls import path
from .views import order_view

app_name = 'orders'

urlpatterns = [
    path('', order_view, name='orders'),
]

