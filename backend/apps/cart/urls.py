"""
URL configuration for cart app.
"""
from django.urls import path
from .views import (
    cart_view,
    update_cart_item_view,
    remove_from_cart_view,
)

app_name = 'cart'

urlpatterns = [
    path('', cart_view, name='cart'),
    path('<uuid:id>/', update_cart_item_view, name='update'),
    path('<uuid:id>/delete/', remove_from_cart_view, name='remove'),
]

