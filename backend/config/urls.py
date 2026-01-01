"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)
from config.health import health_check

# Customize admin site
admin.site.site_header = 'Dolce Fiore Admin'
admin.site.site_title = 'Dolce Fiore Administration'
admin.site.index_title = 'Welcome to Dolce Fiore Admin'

urlpatterns = [
    # Health check endpoint - must be first for quick access
    path('health/', health_check, name='health'),
    
    # Root redirect to Swagger UI
    path('', RedirectView.as_view(pattern_name='swagger-ui', permanent=False), name='home'),
    
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # API endpoints
    path('api/auth/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/cart/', include('apps.cart.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/content/', include('apps.content.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

