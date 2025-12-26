"""
Custom middleware for handling trailing slashes in URLs.
This ensures that both /url and /url/ point to the same view.
"""


class TrailingSlashMiddleware:
    """
    Middleware that normalizes URLs to always include a trailing slash
    (except for root path) so that /url and /url/ both work the same way.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Normalize the path to always have a trailing slash
        # (except for root path and static/media files)
        path = request.path_info
        
        # Skip normalization for:
        # - Root path (/)
        # - Paths that already end with a slash
        # - Paths that look like files (common file extensions)
        if path != '/' and not path.endswith('/'):
            last_segment = path.split('/')[-1]
            # Common file extensions to skip
            common_extensions = ('.css', '.js', '.jpg', '.jpeg', '.png', '.gif', 
                               '.svg', '.ico', '.pdf', '.zip', '.json', '.xml',
                               '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm')
            # Only add trailing slash if it doesn't look like a file
            if not last_segment.lower().endswith(common_extensions):
                # Add trailing slash
                request.path_info = path + '/'
                # Also update PATH_INFO in META for consistency
                if 'PATH_INFO' in request.META:
                    request.META['PATH_INFO'] = request.path_info
        
        response = self.get_response(request)
        return response

