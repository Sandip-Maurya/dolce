"""
Django settings module that loads based on environment.
Defaults to development settings if DJANGO_SETTINGS_MODULE is not set.
"""
import os

# Determine which settings to load based on environment
# Set DJANGO_ENV environment variable to 'production' for production settings
# Defaults to 'development' for safety
env = os.getenv('DJANGO_ENV', 'development')

if env == 'production':
    from .production import *
else:
    from .development import *

