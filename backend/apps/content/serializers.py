"""
Serializers for content app.
"""
from rest_framework import serializers
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
)


class SustainableGiftingItemSerializer(serializers.ModelSerializer):
    """Serializer for sustainable gifting items."""
    
    class Meta:
        model = SustainableGiftingItem
        fields = [
            'id',
            'title',
            'description',
            'image_url',
            'order',
            'is_active',
        ]


class TextTestimonialSerializer(serializers.ModelSerializer):
    """Serializer for text testimonials."""
    
    class Meta:
        model = TextTestimonial
        fields = [
            'id',
            'name',
            'text',
            'rating',
            'location',
            'image_url',
            'order',
        ]


class VideoTestimonialSerializer(serializers.ModelSerializer):
    """Serializer for video testimonials."""
    
    class Meta:
        model = VideoTestimonial
        fields = [
            'id',
            'name',
            'text',
            'video_url',
            'rating',
            'location',
            'image_url',
            'order',
        ]


class AboutUsSectionSerializer(serializers.ModelSerializer):
    """Serializer for About Us sections."""
    
    class Meta:
        model = AboutUsSection
        fields = [
            'id',
            'title',
            'content',
            'order',
            'is_active',
        ]


class OurStorySectionSerializer(serializers.ModelSerializer):
    """Serializer for Our Story sections."""
    
    class Meta:
        model = OurStorySection
        fields = [
            'id',
            'title',
            'content',
            'order',
            'is_active',
        ]


class OurCommitmentSectionSerializer(serializers.ModelSerializer):
    """Serializer for Our Commitment sections."""
    
    class Meta:
        model = OurCommitmentSection
        fields = [
            'id',
            'title',
            'content',
            'order',
            'is_active',
        ]


class PhotoGalleryItemSerializer(serializers.ModelSerializer):
    """Serializer for Photo Gallery items."""
    
    class Meta:
        model = PhotoGalleryItem
        fields = [
            'id',
            'title',
            'image_url',
            'order',
            'is_active',
        ]


class BlogPostSerializer(serializers.ModelSerializer):
    """Serializer for Blog posts."""
    
    class Meta:
        model = BlogPost
        fields = [
            'id',
            'title',
            'content',
            'image_url',
            'published_date',
            'order',
            'is_active',
        ]


class ContactSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for contact form submissions."""
    
    class Meta:
        model = ContactSubmission
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'subject',
            'message',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_message(self, value):
        """Validate message length."""
        if len(value) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        if len(value) > 2000:
            raise serializers.ValidationError("Message must be at most 2000 characters long.")
        return value


class ContactSubmissionReadSerializer(serializers.ModelSerializer):
    """Serializer for reading contact submissions (admin use)."""
    
    subject_display = serializers.CharField(source='get_subject_display', read_only=True)
    
    class Meta:
        model = ContactSubmission
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'subject',
            'subject_display',
            'message',
            'is_read',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

