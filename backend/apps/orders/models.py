"""
Order models for Dolce Fiore.
"""
import uuid
from django.db import models
from django.db.models import Sum
from django.utils import timezone
from apps.users.models import User
from apps.products.models import Product


class Order(models.Model):
    """Order model."""
    
    class Status(models.TextChoices):
        PLACED = 'PLACED', 'Placed'
        PAID = 'PAID', 'Paid'
        PROCESSING = 'PROCESSING', 'Processing'
        SHIPPED = 'SHIPPED', 'Shipped'
        DELIVERED = 'DELIVERED', 'Delivered'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    order_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLACED)
    
    # Customer details
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    
    # Shipping address
    shipping_street = models.TextField()
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100)
    shipping_zip_code = models.CharField(max_length=20)
    shipping_country = models.CharField(max_length=100, default='India')
    
    # Delivery preferences
    gift_note = models.TextField(blank=True, null=True)
    delivery_date = models.DateField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['status']),
            models.Index(fields=['customer_email']),
        ]
    
    def get_total(self):
        """Calculate order total."""
        return self.items.aggregate(total=Sum('line_total'))['total'] or 0
    
    def generate_order_number(self):
        """Generate unique order number."""
        if not self.order_number:
            timestamp = timezone.now().strftime('%Y%m%d')
            unique_id = str(uuid.uuid4())[:8].upper()
            self.order_number = f'ORD-{timestamp}-{unique_id}'
        return self.order_number
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.generate_order_number()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Order {self.order_number} - {self.customer_name}"


class OrderItem(models.Model):
    """Order item model."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'order_items'
    
    def save(self, *args, **kwargs):
        """Calculate line_total on save."""
        if not self.price_at_purchase:
            self.price_at_purchase = self.product.price
        self.line_total = self.price_at_purchase * self.quantity
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

