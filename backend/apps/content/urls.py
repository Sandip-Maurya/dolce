"""
URL configuration for content app.
"""
from django.urls import path
from .views import (
    sustainable_gifting_list_view,
    text_testimonials_list_view,
    video_testimonials_list_view,
    about_us_view,
    our_story_view,
    our_commitment_view,
    photo_gallery_view,
    blogs_view,
    contact_form_submission_view,
    contact_info_view,
)

app_name = 'content'

urlpatterns = [
    path('sustainable-gifting/', sustainable_gifting_list_view, name='sustainable-gifting-list'),
    path('testimonials/text/', text_testimonials_list_view, name='text-testimonials-list'),
    path('testimonials/video/', video_testimonials_list_view, name='video-testimonials-list'),
    path('about-us/', about_us_view, name='about-us'),
    path('our-story/', our_story_view, name='our-story'),
    path('our-commitment/', our_commitment_view, name='our-commitment'),
    path('photo-gallery/', photo_gallery_view, name='photo-gallery'),
    path('blogs/', blogs_view, name='blogs'),
    path('contact/', contact_form_submission_view, name='contact-submission'),
    path('contact-info/', contact_info_view, name='contact-info'),
]

