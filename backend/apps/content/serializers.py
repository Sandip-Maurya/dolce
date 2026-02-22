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
    ContactInfo,
    StoreCenter,
    HeroSection,
    TrustBarItem,
    FAQ,
    CorporateGiftingSection,
    SeasonalSection,
    BrandStorySection,
)


class SustainableGiftingItemSerializer(serializers.ModelSerializer):
    """Serializer for sustainable gifting items."""
    image_url = serializers.SerializerMethodField()

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

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return ''


class TextTestimonialSerializer(serializers.ModelSerializer):
    """Serializer for text testimonials."""
    image_url = serializers.SerializerMethodField()

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

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return ''


class VideoTestimonialSerializer(serializers.ModelSerializer):
    """Serializer for video testimonials."""
    image_url = serializers.SerializerMethodField()

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

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return ''


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
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PhotoGalleryItem
        fields = [
            'id',
            'title',
            'image_url',
            'order',
            'is_active',
        ]

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return ''


class BlogPostSerializer(serializers.ModelSerializer):
    """Serializer for Blog posts."""
    image_url = serializers.SerializerMethodField()

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

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return ''


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


class StoreCenterSerializer(serializers.ModelSerializer):
    """Serializer for store centers."""
    
    class Meta:
        model = StoreCenter
        fields = [
            'id',
            'name',
            'address',
            'google_map_link',
            'order',
            'is_active',
        ]


class ContactInfoSerializer(serializers.ModelSerializer):
    """Serializer for contact information."""
    
    class Meta:
        model = ContactInfo
        fields = [
            'id',
            'email',
            'phone',
            'additional_info',
            'opening_hours_monday',
            'opening_hours_tuesday',
            'opening_hours_wednesday',
            'opening_hours_thursday',
            'opening_hours_friday',
            'opening_hours_saturday',
            'opening_hours_sunday',
        ]
        read_only_fields = ['id']


class HeroSectionSerializer(serializers.ModelSerializer):
    """Serializer for homepage hero section."""
    background_image_url = serializers.SerializerMethodField()
    background_image_urls = serializers.SerializerMethodField()

    class Meta:
        model = HeroSection
        fields = [
            'id',
            'headline',
            'highlight_text',
            'subheadline',
            'primary_cta_text',
            'primary_cta_link',
            'secondary_cta_text',
            'secondary_cta_link',
            'background_image_url',
            'background_image_urls',
            'is_active',
        ]

    def get_background_image_urls(self, obj):
        images = obj.images.all()
        if images.exists():
            return [img.image.url for img in images]
        if obj.background_image:
            return [obj.background_image.url]
        return []

    def get_background_image_url(self, obj):
        urls = self.get_background_image_urls(obj)
        return urls[0] if urls else ''


class TrustBarItemSerializer(serializers.ModelSerializer):
    """Serializer for trust bar items."""
    
    class Meta:
        model = TrustBarItem
        fields = ['id', 'icon_name', 'text', 'order', 'is_active']


class FAQSerializer(serializers.ModelSerializer):
    """Serializer for FAQ items."""
    
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'order', 'is_active']


class CorporateGiftingSectionSerializer(serializers.ModelSerializer):
    """Serializer for corporate gifting section."""
    background_image_url = serializers.SerializerMethodField()

    class Meta:
        model = CorporateGiftingSection
        fields = [
            'id',
            'title',
            'description',
            'features',
            'primary_cta_text',
            'primary_cta_link',
            'secondary_cta_text',
            'secondary_cta_link',
            'background_image_url',
            'is_active',
        ]

    def get_background_image_url(self, obj):
        if obj.background_image:
            return obj.background_image.url
        return ''


class SeasonalSectionSerializer(serializers.ModelSerializer):
    """Serializer for seasonal/occasion section."""
    
    class Meta:
        model = SeasonalSection
        fields = [
            'id',
            'title',
            'subtitle',
            'start_date',
            'end_date',
            'badge_text',
            'cta_text',
            'cta_link',
            'background_color',
            'featured_product_ids',
            'is_active',
        ]


class BrandStorySectionSerializer(serializers.ModelSerializer):
    """Serializer for 'Why Dolce Fiore' brand story section."""
    
    class Meta:
        model = BrandStorySection
        fields = [
            'id',
            'title',
            'subtitle',
            'features',
            'cta_text',
            'cta_link',
            'is_active',
        ]

