"""
Frontend revalidation utility.

Triggers on-demand revalidation of Next.js pages when content is updated
in Django admin. This ensures users see fresh content without waiting
for time-based revalidation.
"""
import logging
import os
from typing import Optional
from urllib.parse import urljoin

import requests

logger = logging.getLogger(__name__)

# Configuration from environment
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://frontend:3000')
REVALIDATION_SECRET = os.getenv('REVALIDATION_SECRET', '')
REVALIDATION_TIMEOUT = int(os.getenv('REVALIDATION_TIMEOUT', '5'))  # seconds


def trigger_revalidation(
    paths: Optional[list[str]] = None,
    tags: Optional[list[str]] = None,
    silent: bool = True
) -> bool:
    """
    Trigger on-demand revalidation of Next.js cached pages.
    
    Args:
        paths: List of paths to revalidate (e.g., ['/', '/products'])
        tags: List of cache tags to revalidate
        silent: If True, log errors but don't raise exceptions
        
    Returns:
        True if revalidation was successful, False otherwise
    """
    if not REVALIDATION_SECRET:
        logger.warning(
            'REVALIDATION_SECRET not configured - skipping frontend revalidation. '
            'Set REVALIDATION_SECRET env var to enable on-demand revalidation.'
        )
        return False
    
    revalidation_url = urljoin(FRONTEND_URL, '/_internal/revalidate')
    
    payload = {}
    if paths:
        payload['paths'] = paths
    if tags:
        payload['tags'] = tags
    
    try:
        response = requests.post(
            revalidation_url,
            json=payload,
            headers={
                'Content-Type': 'application/json',
                'x-revalidation-secret': REVALIDATION_SECRET,
            },
            timeout=REVALIDATION_TIMEOUT,
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.info(
                f"Frontend revalidation successful: {result.get('revalidated', {})}"
            )
            return True
        else:
            logger.error(
                f"Frontend revalidation failed with status {response.status_code}: "
                f"{response.text}"
            )
            if not silent:
                raise Exception(f"Revalidation failed: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        logger.warning(
            f"Frontend revalidation timed out after {REVALIDATION_TIMEOUT}s - "
            "page will be revalidated on next request"
        )
        return False
    except requests.exceptions.ConnectionError as e:
        logger.warning(
            f"Could not connect to frontend for revalidation: {e} - "
            "page will be revalidated on next request"
        )
        return False
    except Exception as e:
        logger.error(f"Frontend revalidation error: {e}")
        if not silent:
            raise
        return False


def revalidate_homepage():
    """Revalidate the homepage."""
    return trigger_revalidation(paths=['/'])


def revalidate_products():
    """Revalidate product-related pages."""
    return trigger_revalidation(paths=['/', '/products'])


def revalidate_content():
    """Revalidate content pages (about, contact, etc.)."""
    return trigger_revalidation(paths=['/', '/about', '/contact'])


def revalidate_all():
    """Revalidate all main pages."""
    return trigger_revalidation(paths=['/', '/products', '/about', '/contact'])
