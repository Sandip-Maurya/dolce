"""
Views for user authentication.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import login, logout
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .serializers import (
    UserResponseSerializer,
    SignupSerializer,
    LoginSerializer,
    LogoutResponseSerializer,
    ProfileSerializer,
    UpdateProfileSerializer,
)


@extend_schema(
    tags=['Authentication'],
    summary='User Login',
    request=LoginSerializer,
    responses={200: UserResponseSerializer},
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login endpoint."""
    serializer = LoginSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    
    user = serializer.validated_data['user']
    login(request, user)
    
    return Response(UserResponseSerializer(user).data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Authentication'],
    summary='User Signup',
    request=SignupSerializer,
    responses={201: UserResponseSerializer},
)
@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """User registration endpoint."""
    serializer = SignupSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    
    login(request, user)
    
    return Response(UserResponseSerializer(user).data, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=['Authentication'],
    summary='User Logout',
    responses={200: LogoutResponseSerializer},
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout endpoint."""
    logout(request)
    return Response({'success': True}, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Authentication'],
    summary='Get Current User',
    responses={200: UserResponseSerializer},
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """Get current authenticated user endpoint."""
    return Response(UserResponseSerializer(request.user).data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Authentication'],
    summary='Get User Profile',
    responses={200: ProfileSerializer},
)
@extend_schema(
    tags=['Authentication'],
    summary='Update User Profile',
    request=UpdateProfileSerializer,
    responses={200: ProfileSerializer},
    methods=['PUT'],
)
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Get or update current user's profile."""
    from .models import Profile
    profile, created = Profile.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        # Update profile using ProfileSerializer's update method
        profile_serializer = ProfileSerializer(profile, data=request.data, partial=True)
        profile_serializer.is_valid(raise_exception=True)
        updated_profile = profile_serializer.save()
        return Response(ProfileSerializer(updated_profile).data, status=status.HTTP_200_OK)

