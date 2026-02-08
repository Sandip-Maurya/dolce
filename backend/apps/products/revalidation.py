"""
Frontend revalidation utility for products app.
"""
from apps.content.revalidation import trigger_revalidation


def revalidate_products():
    """Revalidate product-related pages including homepage."""
    return trigger_revalidation(paths=['/', '/products'])
