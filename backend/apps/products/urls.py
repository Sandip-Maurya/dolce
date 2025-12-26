"""
URL configuration for products app.
"""
from django.urls import path
from .views import product_list_view, product_detail_view

app_name = 'products'

urlpatterns = [
    path('', product_list_view, name='list'),
    path('<slug:slug>/', product_detail_view, name='detail'),
]

