"""
Admin configuration for content app.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import (
    SustainableGiftingItem,
    TextTestimonial,
    VideoTestimonial,
    AboutUsSection,
    OurStorySection,
    OurCommitmentSection,
    PhotoGalleryItem,
    BlogPost,
    ContactSubmission,
    ContactInfo,
    StoreCenter,
)


@admin.register(SustainableGiftingItem)
class SustainableGiftingItemAdmin(admin.ModelAdmin):
    """Admin for sustainable gifting items."""
    list_display = ['title', 'order', 'is_active', 'image_preview', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['order', 'created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'title', 'description', 'image_url')
        }),
        ('Display Settings', {
            'fields': ('order', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['make_active', 'make_inactive']
    
    def image_preview(self, obj):
        """Display image as thumbnail."""
        if obj.image_url:
            return format_html(
                '<img src="{}" style="max-width: 100px; max-height: 100px; object-fit: cover;" />',
                obj.image_url
            )
        return '-'
    image_preview.short_description = 'Preview'
    
    def make_active(self, request, queryset):
        """Bulk action to mark items as active."""
        queryset.update(is_active=True)
        self.message_user(request, f'{queryset.count()} item(s) marked as active.')
    make_active.short_description = 'Mark selected items as active'
    
    def make_inactive(self, request, queryset):
        """Bulk action to mark items as inactive."""
        queryset.update(is_active=False)
        self.message_user(request, f'{queryset.count()} item(s) marked as inactive.')
    make_inactive.short_description = 'Mark selected items as inactive'


@admin.register(TextTestimonial)
class TextTestimonialAdmin(admin.ModelAdmin):
    """Admin for text testimonials."""
    list_display = ['name', 'rating', 'location', 'order', 'is_active', 'image_preview', 'created_at']
    list_filter = ['is_active', 'rating', 'created_at']
    search_fields = ['name', 'text', 'location']
    ordering = ['order', 'created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'text', 'rating', 'location', 'image_url')
        }),
        ('Display Settings', {
            'fields': ('order', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['make_active', 'make_inactive']
    
    def image_preview(self, obj):
        """Display image as thumbnail."""
        if obj.image_url:
            return format_html(
                '<img src="{}" style="max-width: 100px; max-height: 100px; object-fit: cover; border-radius: 50%;" />',
                obj.image_url
            )
        return '-'
    image_preview.short_description = 'Preview'
    
    def make_active(self, request, queryset):
        """Bulk action to mark items as active."""
        queryset.update(is_active=True)
        self.message_user(request, f'{queryset.count()} testimonial(s) marked as active.')
    make_active.short_description = 'Mark selected testimonials as active'
    
    def make_inactive(self, request, queryset):
        """Bulk action to mark items as inactive."""
        queryset.update(is_active=False)
        self.message_user(request, f'{queryset.count()} testimonial(s) marked as inactive.')
    make_inactive.short_description = 'Mark selected testimonials as inactive'


@admin.register(VideoTestimonial)
class VideoTestimonialAdmin(admin.ModelAdmin):
    """Admin for video testimonials."""
    list_display = ['name', 'rating', 'location', 'order', 'is_active', 'image_preview', 'created_at']
    list_filter = ['is_active', 'rating', 'created_at']
    search_fields = ['name', 'text', 'location']
    ordering = ['order', 'created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'text', 'video_url', 'rating', 'location', 'image_url')
        }),
        ('Display Settings', {
            'fields': ('order', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['make_active', 'make_inactive']
    
    def image_preview(self, obj):
        """Display image as thumbnail."""
        if obj.image_url:
            return format_html(
                '<img src="{}" style="max-width: 100px; max-height: 100px; object-fit: cover; border-radius: 50%;" />',
                obj.image_url
            )
        return '-'
    image_preview.short_description = 'Preview'
    
    def make_active(self, request, queryset):
        """Bulk action to mark items as active."""
        queryset.update(is_active=True)
        self.message_user(request, f'{queryset.count()} testimonial(s) marked as active.')
    make_active.short_description = 'Mark selected testimonials as active'
    
    def make_inactive(self, request, queryset):
        """Bulk action to mark items as inactive."""
        queryset.update(is_active=False)
        self.message_user(request, f'{queryset.count()} testimonial(s) marked as inactive.')
    make_inactive.short_description = 'Mark selected testimonials as inactive'


@admin.register(AboutUsSection)
class AboutUsSectionAdmin(admin.ModelAdmin):
    """Admin for About Us sections."""
    list_display = ['title', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'content']
    ordering = ['order', 'created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'title', 'content')
        }),
        ('Display Settings', {
            'fields': ('order', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['make_active', 'make_inactive']
    
    def make_active(self, request, queryset):
        """Bulk action to mark items as active."""
        queryset.update(is_active=True)
        self.message_user(request, f'{queryset.count()} section(s) marked as active.')
    make_active.short_description = 'Mark selected sections as active'
    
    def make_inactive(self, request, queryset):
        """Bulk action to mark items as inactive."""
        queryset.update(is_active=False)
        self.message_user(request, f'{queryset.count()} section(s) marked as inactive.')
    make_inactive.short_description = 'Mark selected sections as inactive'


@admin.register(OurStorySection)
class OurStorySectionAdmin(admin.ModelAdmin):
    """Admin for Our Story sections."""
    list_display = ['title', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'content']
    ordering = ['order', 'created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'title', 'content')
        }),
        ('Display Settings', {
            'fields': ('order', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['make_active', 'make_inactive']
    
    def make_active(self, request, queryset):
        """Bulk action to mark items as active."""
        queryset.update(is_active=True)
        self.message_user(request, f'{queryset.count()} section(s) marked as active.')
    make_active.short_description = 'Mark selected sections as active'
    
    def make_inactive(self, request, queryset):
        """Bulk action to mark items as inactive."""
        queryset.update(is_active=False)
        self.message_user(request, f'{queryset.count()} section(s) marked as inactive.')
    make_inactive.short_description = 'Mark selected sections as inactive'


@admin.register(OurCommitmentSection)
class OurCommitmentSectionAdmin(admin.ModelAdmin):
    """Admin for Our Commitment sections."""
    list_display = ['title', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'content']
    ordering = ['order', 'created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'title', 'content')
        }),
        ('Display Settings', {
            'fields': ('order', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['make_active', 'make_inactive']
    
    def make_active(self, request, queryset):
        """Bulk action to mark items as active."""
        queryset.update(is_active=True)
        self.message_user(request, f'{queryset.count()} section(s) marked as active.')
    make_active.short_description = 'Mark selected sections as active'
    
    def make_inactive(self, request, queryset):
        """Bulk action to mark items as inactive."""
        queryset.update(is_active=False)
        self.message_user(request, f'{queryset.count()} section(s) marked as inactive.')
    make_inactive.short_description = 'Mark selected sections as inactive'


@admin.register(PhotoGalleryItem)
class PhotoGalleryItemAdmin(admin.ModelAdmin):
    """Admin for Photo Gallery items."""
    list_display = ['title', 'order', 'is_active', 'image_preview', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title']
    ordering = ['order', 'created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'title', 'image_url')
        }),
        ('Display Settings', {
            'fields': ('order', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['make_active', 'make_inactive']
    
    def image_preview(self, obj):
        """Display image as thumbnail."""
        if obj.image_url:
            return format_html(
                '<img src="{}" style="max-width: 100px; max-height: 100px; object-fit: cover;" />',
                obj.image_url
            )
        return '-'
    image_preview.short_description = 'Preview'
    
    def make_active(self, request, queryset):
        """Bulk action to mark items as active."""
        queryset.update(is_active=True)
        self.message_user(request, f'{queryset.count()} item(s) marked as active.')
    make_active.short_description = 'Mark selected items as active'
    
    def make_inactive(self, request, queryset):
        """Bulk action to mark items as inactive."""
        queryset.update(is_active=False)
        self.message_user(request, f'{queryset.count()} item(s) marked as inactive.')
    make_inactive.short_description = 'Mark selected items as inactive'


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    """Admin for Blog posts."""
    list_display = ['title', 'published_date', 'order', 'is_active', 'image_preview', 'created_at']
    list_filter = ['is_active', 'published_date', 'created_at']
    search_fields = ['title', 'content']
    ordering = ['-published_date', 'order', 'created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'title', 'content', 'image_url', 'published_date')
        }),
        ('Display Settings', {
            'fields': ('order', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['make_active', 'make_inactive']
    
    def image_preview(self, obj):
        """Display image as thumbnail."""
        if obj.image_url:
            return format_html(
                '<img src="{}" style="max-width: 100px; max-height: 100px; object-fit: cover;" />',
                obj.image_url
            )
        return '-'
    image_preview.short_description = 'Preview'
    
    def make_active(self, request, queryset):
        """Bulk action to mark items as active."""
        queryset.update(is_active=True)
        self.message_user(request, f'{queryset.count()} post(s) marked as active.')
    make_active.short_description = 'Mark selected posts as active'
    
    def make_inactive(self, request, queryset):
        """Bulk action to mark items as inactive."""
        queryset.update(is_active=False)
        self.message_user(request, f'{queryset.count()} post(s) marked as inactive.')
    make_inactive.short_description = 'Mark selected posts as inactive'


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    """Admin for contact form submissions."""
    list_display = ['name', 'email', 'subject_display', 'is_read', 'created_at']
    list_filter = ['is_read', 'subject', 'created_at']
    search_fields = ['name', 'email', 'message']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Submission Information', {
            'fields': ('id', 'name', 'email', 'phone', 'subject', 'message')
        }),
        ('Status', {
            'fields': ('is_read',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def subject_display(self, obj):
        """Display subject choice label."""
        return obj.get_subject_display()
    subject_display.short_description = 'Subject'
    
    def mark_as_read(self, request, queryset):
        """Bulk action to mark submissions as read."""
        queryset.update(is_read=True)
        self.message_user(request, f'{queryset.count()} submission(s) marked as read.')
    mark_as_read.short_description = 'Mark selected submissions as read'
    
    def mark_as_unread(self, request, queryset):
        """Bulk action to mark submissions as unread."""
        queryset.update(is_read=False)
        self.message_user(request, f'{queryset.count()} submission(s) marked as unread.')
    mark_as_unread.short_description = 'Mark selected submissions as unread'


@admin.register(StoreCenter)
class StoreCenterAdmin(admin.ModelAdmin):
    """Admin for store centers."""
    list_display = ['name', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'address']
    ordering = ['order', 'created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'address', 'google_map_link')
        }),
        ('Display Settings', {
            'fields': ('order', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['make_active', 'make_inactive']
    
    def make_active(self, request, queryset):
        """Bulk action to mark items as active."""
        queryset.update(is_active=True)
        self.message_user(request, f'{queryset.count()} store center(s) marked as active.')
    make_active.short_description = 'Mark selected store centers as active'
    
    def make_inactive(self, request, queryset):
        """Bulk action to mark items as inactive."""
        queryset.update(is_active=False)
        self.message_user(request, f'{queryset.count()} store center(s) marked as inactive.')
    make_inactive.short_description = 'Mark selected store centers as inactive'


@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    """Admin for contact information."""
    list_display = ['email', 'phone', 'is_active', 'updated_at']
    list_filter = ['is_active', 'created_at', 'updated_at']
    search_fields = ['email', 'phone', 'additional_info']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('id', 'email', 'phone', 'additional_info')
        }),
        ('Opening Hours', {
            'fields': (
                'opening_hours_monday',
                'opening_hours_tuesday',
                'opening_hours_wednesday',
                'opening_hours_thursday',
                'opening_hours_friday',
                'opening_hours_saturday',
                'opening_hours_sunday',
            )
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        """Allow adding if no active contact info exists."""
        return True
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion if it's the only active one."""
        if obj and obj.is_active:
            active_count = ContactInfo.objects.filter(is_active=True).count()
            if active_count <= 1:
                return False
        return True

