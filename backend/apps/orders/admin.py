"""
Admin configuration for orders app.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    """Inline admin for order items."""
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'quantity', 'price_at_purchase', 'line_total']
    fields = ['product', 'quantity', 'price_at_purchase', 'line_total']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """User-friendly order admin."""
    inlines = [OrderItemInline]
    list_display = [
        'order_number',
        'customer_name',
        'customer_email',
        'status_badge',
        'total_display',
        'created_at',
        'shipping_info',
    ]
    list_filter = ['status', 'created_at', 'shipping_state', 'shipping_city']
    search_fields = ['order_number', 'customer_name', 'customer_email', 'customer_phone']
    readonly_fields = [
        'id',
        'order_number',
        'total_display',
        'created_at',
        'updated_at',
        'shipping_address_display',
    ]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('id', 'order_number', 'status', 'total_display', 'user')
        }),
        ('Customer Details', {
            'fields': ('customer_name', 'customer_email', 'customer_phone')
        }),
        ('Shipping Address', {
            'fields': (
                'shipping_street',
                'shipping_city',
                'shipping_state',
                'shipping_zip_code',
                'shipping_country',
                'shipping_address_display',
            )
        }),
        ('Delivery Preferences', {
            'fields': ('gift_note', 'delivery_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_shipped', 'mark_as_delivered', 'mark_as_processing']
    
    def status_badge(self, obj):
        """Display status with color coding."""
        colors = {
            'PLACED': '#007bff',
            'PAID': '#28a745',
            'PROCESSING': '#ffc107',
            'SHIPPED': '#17a2b8',
            'DELIVERED': '#6c757d',
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def total_display(self, obj):
        """Display order total."""
        return f"₹{obj.get_total():.2f}"
    total_display.short_description = 'Total'
    
    def shipping_info(self, obj):
        """Display concise shipping info."""
        return f"{obj.shipping_city}, {obj.shipping_state}"
    shipping_info.short_description = 'Shipping'
    
    def shipping_address_display(self, obj):
        """Display formatted shipping address."""
        address = f"{obj.shipping_street}\n{obj.shipping_city}, {obj.shipping_state} {obj.shipping_zip_code}\n{obj.shipping_country}"
        return format_html('<pre>{}</pre>', address)
    shipping_address_display.short_description = 'Shipping Address'
    
    def mark_as_shipped(self, request, queryset):
        """Bulk action to mark orders as shipped."""
        queryset.update(status=Order.Status.SHIPPED)
        self.message_user(request, f'{queryset.count()} order(s) marked as shipped.')
    mark_as_shipped.short_description = 'Mark selected orders as shipped'
    
    def mark_as_delivered(self, request, queryset):
        """Bulk action to mark orders as delivered."""
        queryset.update(status=Order.Status.DELIVERED)
        self.message_user(request, f'{queryset.count()} order(s) marked as delivered.')
    mark_as_delivered.short_description = 'Mark selected orders as delivered'
    
    def mark_as_processing(self, request, queryset):
        """Bulk action to mark orders as processing."""
        queryset.update(status=Order.Status.PROCESSING)
        self.message_user(request, f'{queryset.count()} order(s) marked as processing.')
    mark_as_processing.short_description = 'Mark selected orders as processing'


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """Admin for order items."""
    list_display = ['order', 'product', 'quantity', 'price_at_purchase', 'line_total', 'created_at']
    list_filter = ['created_at']
    search_fields = ['order__order_number', 'product__name']
    readonly_fields = ['line_total']

