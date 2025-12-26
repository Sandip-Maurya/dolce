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
    image_url = models.URLField()
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
    image_url = models.URLField(blank=True)
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
    image_url = models.URLField(blank=True)
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
    image_url = models.URLField()
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
    image_url = models.URLField(blank=True, help_text='Optional image for the blog post')
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