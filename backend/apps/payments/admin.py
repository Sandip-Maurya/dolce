"""
Admin configuration for payments app.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin for payments."""
    list_display = [
        'payment_order_id',
        'order',
        'provider',
        'status_badge',
        'amount_display',
        'currency',
        'created_at',
    ]
    list_filter = ['provider', 'status', 'created_at']
    search_fields = ['payment_order_id', 'order__order_number']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Payment Information', {
            'fields': ('id', 'payment_order_id', 'order', 'provider', 'status')
        }),
        ('Amount Details', {
            'fields': ('amount', 'currency')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def status_badge(self, obj):
        """Display status with color coding."""
        colors = {
            'PENDING': '#ffc107',
            'SUCCESS': '#28a745',
            'FAILED': '#dc3545',
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def amount_display(self, obj):
        """Display payment amount."""
        return f"{obj.currency} {obj.amount:.2f}"
    amount_display.short_description = 'Amount'

