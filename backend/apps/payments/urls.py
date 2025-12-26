"""
URL configuration for payments app.
"""
from django.urls import path
from .views import create_payment_order_view

app_name = 'payments'

urlpatterns = [
    path('create-order/', create_payment_order_view, name='create-order'),
]

