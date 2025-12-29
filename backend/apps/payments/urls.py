"""
URL configuration for payments app.
"""
from django.urls import path
from .views import (
    create_payment_order_view,
    verify_payment_view,
    webhook_handler_view,
)

app_name = 'payments'

urlpatterns = [
    path('create-order/', create_payment_order_view, name='create-order'),
    path('verify/', verify_payment_view, name='verify'),
    path('webhook/', webhook_handler_view, name='webhook'),
]

