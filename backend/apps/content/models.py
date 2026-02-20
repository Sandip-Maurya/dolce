"""
Content models for Dolce Fiore.
"""
import uuid
from django.db import models


class SustainableGiftingItem(models.Model):
    """Model for Sustainable Gifting section items on home page."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='sustainable_gifting/', blank=True, null=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sustainable_gifting_items'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['order']),
        ]
    
    def __str__(self):
        return self.title


class TextTestimonial(models.Model):
    """Model for text-based testimonials on home page."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    text = models.TextField()
    rating = models.IntegerField(default=5, help_text='Rating from 1 to 5')
    location = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'text_testimonials'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['order']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.rating} stars"


class VideoTestimonial(models.Model):
    """Model for video-based testimonials on home page."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    text = models.TextField(blank=True, help_text='Optional description or quote')
    video_url = models.URLField(help_text='YouTube/Vimeo embed URL')
    rating = models.IntegerField(default=5, help_text='Rating from 1 to 5')
    location = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'video_testimonials'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['order']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.rating} stars"


class AboutUsSection(models.Model):
    """Model for About Us section on About Us page."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    content = models.TextField()
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'about_us_sections'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['order']),
        ]
    
    def __str__(self):
        return self.title


class OurStorySection(models.Model):
    """Model for Our Story section on About Us page."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    content = models.TextField()
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'our_story_sections'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['order']),
        ]
    
    def __str__(self):
        return self.title


class OurCommitmentSection(models.Model):
    """Model for Our Commitment section on About Us page."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    content = models.TextField()
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'our_commitment_sections'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['order']),
        ]
    
    def __str__(self):
        return self.title


class PhotoGalleryItem(models.Model):
    """Model for Photo Gallery items on About Us page."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, blank=True, help_text='Optional title for the photo')
    image = models.ImageField(upload_to='photo_gallery/', blank=True, null=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'photo_gallery_items'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['order']),
        ]
    
    def __str__(self):
        return self.title if self.title else f"Photo {self.id}"


class BlogPost(models.Model):
    """Model for Blog posts on About Us page."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='blogs/', blank=True, null=True, help_text='Optional image for the blog post')
    published_date = models.DateField()
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'blog_posts'
        ordering = ['-published_date', 'order', 'created_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['published_date']),
            models.Index(fields=['order']),
        ]
    
    def __str__(self):
        return self.title


class ContactSubmission(models.Model):
    """Model for contact form submissions."""
    SUBJECT_CHOICES = [
        ('general', 'General Inquiry'),
        ('product', 'Product Question'),
        ('order', 'Order Support'),
        ('partnership', 'Partnership'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    subject = models.CharField(max_length=100, choices=SUBJECT_CHOICES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'contact_submissions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_read']),
            models.Index(fields=['created_at']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.get_subject_display()} ({self.created_at.strftime('%Y-%m-%d')})"


class StoreCenter(models.Model):
    """Model for store/center locations."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, help_text='Name of the store/center')
    address = models.TextField(help_text='Full address of the store/center')
    google_map_link = models.URLField(help_text='Google Maps link to the location')
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'store_centers'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['order']),
        ]
    
    def __str__(self):
        return self.name


class ContactInfo(models.Model):
    """Model for contact information displayed on Contact Us section."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(help_text='Contact email address')
    phone = models.CharField(max_length=20, help_text='Contact phone number')
    additional_info = models.TextField(
        max_length=1000,
        help_text='Additional comments or remarks for contact information',
        blank=True
    )
    opening_hours_monday = models.CharField(
        max_length=100,
        default='6:00 AM - 8:00 PM',
        help_text='Opening hours for Monday (e.g., "6:00 AM - 8:00 PM")',
        blank=True
    )
    opening_hours_tuesday = models.CharField(
        max_length=100,
        default='6:00 AM - 8:00 PM',
        help_text='Opening hours for Tuesday (e.g., "6:00 AM - 8:00 PM")',
        blank=True
    )
    opening_hours_wednesday = models.CharField(
        max_length=100,
        default='6:00 AM - 8:00 PM',
        help_text='Opening hours for Wednesday (e.g., "6:00 AM - 8:00 PM")',
        blank=True
    )
    opening_hours_thursday = models.CharField(
        max_length=100,
        default='6:00 AM - 8:00 PM',
        help_text='Opening hours for Thursday (e.g., "6:00 AM - 8:00 PM")',
        blank=True
    )
    opening_hours_friday = models.CharField(
        max_length=100,
        default='6:00 AM - 8:00 PM',
        help_text='Opening hours for Friday (e.g., "6:00 AM - 8:00 PM")',
        blank=True
    )
    opening_hours_saturday = models.CharField(
        max_length=100,
        default='6:00 AM - 8:00 PM',
        help_text='Opening hours for Saturday (e.g., "6:00 AM - 8:00 PM")',
        blank=True
    )
    opening_hours_sunday = models.CharField(
        max_length=100,
        default='6:00 AM - 8:00 PM',
        help_text='Opening hours for Sunday (e.g., "6:00 AM - 8:00 PM")',
        blank=True
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'contact_info'
        verbose_name = 'Contact Information'
        verbose_name_plural = 'Contact Information'
    
    def __str__(self):
        return f"Contact Info - {self.email}"
    
    def save(self, *args, **kwargs):
        """Ensure only one active contact info exists."""
        if self.is_active:
            # Deactivate all other contact info records
            ContactInfo.objects.filter(is_active=True).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)


class HeroSection(models.Model):
    """Model for homepage hero section (singleton-like: only one active)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    headline = models.CharField(max_length=200)
    highlight_text = models.CharField(max_length=100, help_text='Gold-colored portion of headline')
    subheadline = models.TextField()
    primary_cta_text = models.CharField(max_length=50)
    primary_cta_link = models.CharField(max_length=255)
    secondary_cta_text = models.CharField(max_length=50)
    secondary_cta_link = models.CharField(max_length=255)
    background_image = models.ImageField(upload_to='hero/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hero_sections'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['is_active'])]

    def __str__(self):
        return self.headline


class TrustBarItem(models.Model):
    """Model for trust bar items below hero (e.g. Ships in 24h, Gift note)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    icon_name = models.CharField(max_length=50, help_text='Icon identifier: truck, gift, leaf, etc.')
    text = models.CharField(max_length=100)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trust_bar_items'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['order']),
        ]

    def __str__(self):
        return self.text


class FAQ(models.Model):
    """Model for FAQ section on homepage."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.CharField(max_length=300)
    answer = models.TextField()
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'faqs'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['order']),
        ]

    def __str__(self):
        return self.question[:50]


class CorporateGiftingSection(models.Model):
    """Model for corporate gifting band on homepage (singleton-like)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    features = models.JSONField(
        default=list,
        help_text='List of feature strings (e.g. Bulk orders, Custom branding)'
    )
    primary_cta_text = models.CharField(max_length=50)
    primary_cta_link = models.CharField(max_length=255)
    secondary_cta_text = models.CharField(max_length=50)
    secondary_cta_link = models.CharField(max_length=255)
    background_image = models.ImageField(upload_to='corporate_gifting/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'corporate_gifting_sections'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['is_active'])]

    def __str__(self):
        return self.title


class SeasonalSection(models.Model):
    """Model for seasonal/occasion section (e.g. Diwali Gifting)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    badge_text = models.CharField(max_length=100, blank=True)
    cta_text = models.CharField(max_length=50)
    cta_link = models.CharField(max_length=255)
    background_color = models.CharField(max_length=50, blank=True)
    featured_product_ids = models.JSONField(
        default=list,
        help_text='List of product UUIDs to feature'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'seasonal_sections'
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['start_date', 'end_date']),
        ]

    def __str__(self):
        return self.title


class BrandStorySection(models.Model):
    """Model for 'Why Dolce Fiore' section on homepage (singleton-like: only one active)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, default='Why Dolce Fiore')
    subtitle = models.CharField(
        max_length=300,
        default='Health-first indulgence, artisan-made, and packaging that becomes part of the gift.'
    )
    features = models.JSONField(
        default=list,
        help_text='List of feature bullet points (e.g. ["Health-first indulgence", "Artisan-made"])'
    )
    cta_text = models.CharField(max_length=50, default='Read the full story')
    cta_link = models.CharField(max_length=255, default='/about')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'brand_story_sections'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['is_active'])]
        verbose_name = 'Brand Story Section'
        verbose_name_plural = 'Brand Story Sections'

    def __str__(self):
        return self.title