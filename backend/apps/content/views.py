"""
Views for content app.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from .models import (
    SustainableGiftingItem,
    TextTestimonial,
    VideoTestimonial,
    AboutUsSection,
    OurStorySection,
    OurCommitmentSection,
    PhotoGalleryItem,
    BlogPost,
)
from .serializers import (
    SustainableGiftingItemSerializer,
    TextTestimonialSerializer,
    VideoTestimonialSerializer,
    AboutUsSectionSerializer,
    OurStorySectionSerializer,
    OurCommitmentSectionSerializer,
    PhotoGalleryItemSerializer,
    BlogPostSerializer,
)


@extend_schema(
    tags=['Content'],
    summary='List sustainable gifting items',
    description='Get all active sustainable gifting items ordered by order field',
    responses={200: SustainableGiftingItemSerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([AllowAny])
def sustainable_gifting_list_view(request):
    """Get all active sustainable gifting items."""
    queryset = SustainableGiftingItem.objects.filter(is_active=True).order_by('order')
    serializer = SustainableGiftingItemSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Content'],
    summary='List text testimonials',
    description='Get all active text testimonials ordered by order field',
    responses={200: TextTestimonialSerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([AllowAny])
def text_testimonials_list_view(request):
    """Get all active text testimonials."""
    queryset = TextTestimonial.objects.filter(is_active=True).order_by('order')
    serializer = TextTestimonialSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Content'],
    summary='List video testimonials',
    description='Get all active video testimonials ordered by order field',
    responses={200: VideoTestimonialSerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([AllowAny])
def video_testimonials_list_view(request):
    """Get all active video testimonials."""
    queryset = VideoTestimonial.objects.filter(is_active=True).order_by('order')
    serializer = VideoTestimonialSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Content'],
    summary='Get About Us section',
    description='Get active About Us section content, with default fallback if none exists',
    responses={200: AboutUsSectionSerializer},
)
@api_view(['GET'])
@permission_classes([AllowAny])
def about_us_view(request):
    """Get active About Us section with default fallback."""
    queryset = AboutUsSection.objects.filter(is_active=True).order_by('order').first()
    
    if queryset:
        serializer = AboutUsSectionSerializer(queryset)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # Default fallback content
    default_data = {
        'id': None,
        'title': 'About Us',
        'content': (
            'At Dolce Fiore, we are passionate about creating premium, sustainable gift experiences '
            'that celebrate health, sustainability, and conscious living. Every product is designed '
            'to delight while leaving a positive impact on people and the planet. We believe that '
            'premium gifting can and should be kind to the planet, creating beautiful moments '
            'without leaving a heavy footprint.'
        ),
        'order': 0,
        'is_active': True,
    }
    return Response(default_data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Content'],
    summary='Get Our Story section',
    description='Get active Our Story section content, with default fallback if none exists',
    responses={200: OurStorySectionSerializer},
)
@api_view(['GET'])
@permission_classes([AllowAny])
def our_story_view(request):
    """Get active Our Story section with default fallback."""
    queryset = OurStorySection.objects.filter(is_active=True).order_by('order').first()
    
    if queryset:
        serializer = OurStorySectionSerializer(queryset)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # Default fallback content
    default_data = {
        'id': None,
        'title': 'Our Story',
        'content': (
            'Dolce Fiore began as a homegrown venture with a simple dream — to craft thoughtful, '
            'sustainable gifting experiences. What started four years ago with a passion for healthy '
            'indulgence has grown into a celebration of creativity and conscious living.\n\n'
            'We proudly partner with local artisans across India, bringing tradition and sustainability '
            'into every creation. Every hamper is handcrafted with care, featuring organic ingredients, '
            'air-fried savories, and sugar-free chocolates — all wrapped in eco-friendly, reusable packaging.'
        ),
        'order': 0,
        'is_active': True,
    }
    return Response(default_data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Content'],
    summary='Get Our Commitment section',
    description='Get active Our Commitment section content',
    responses={200: OurCommitmentSectionSerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([AllowAny])
def our_commitment_view(request):
    """Get all active Our Commitment sections."""
    queryset = OurCommitmentSection.objects.filter(is_active=True).order_by('order')
    serializer = OurCommitmentSectionSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Content'],
    summary='List photo gallery items',
    description='Get all active photo gallery items ordered by order field',
    responses={200: PhotoGalleryItemSerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([AllowAny])
def photo_gallery_view(request):
    """Get all active photo gallery items."""
    queryset = PhotoGalleryItem.objects.filter(is_active=True).order_by('order')
    serializer = PhotoGalleryItemSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Content'],
    summary='List blog posts',
    description='Get all active blog posts ordered by published date (newest first)',
    responses={200: BlogPostSerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([AllowAny])
def blogs_view(request):
    """Get all active blog posts ordered by published date."""
    queryset = BlogPost.objects.filter(is_active=True).order_by('-published_date', 'order')
    serializer = BlogPostSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

