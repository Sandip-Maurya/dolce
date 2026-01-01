"""
Simple health check view for Docker healthchecks.
"""
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db import connection


@require_http_methods(["GET"])
def health_check(request):
    """
    Simple health check endpoint that verifies:
    - Django is running
    - Database connection is available
    """
    try:
        # Quick database connectivity check
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        
        return JsonResponse({
            'status': 'healthy',
            'service': 'dolce-backend'
        }, status=200)
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e)
        }, status=503)

