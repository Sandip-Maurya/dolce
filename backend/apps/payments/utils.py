"""
Utilities for Razorpay payment integration.
"""
import razorpay
from django.conf import settings


def get_razorpay_client():
    """
    Get Razorpay client instance.
    
    Returns:
        razorpay.Client: Configured Razorpay client instance
    
    Raises:
        ValueError: If credentials are not configured
    """
    key_id = settings.RAZORPAY_KEY_ID
    key_secret = settings.RAZORPAY_KEY_SECRET
    
    if not key_id or not key_secret:
        raise ValueError(
            "Razorpay credentials not configured. "
            "Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables."
        )
    
    # Strip whitespace from keys (common issue)
    key_id = key_id.strip()
    key_secret = key_secret.strip()
    
    # Basic validation - Razorpay keys have specific formats
    if not key_id.startswith('rzp_'):
        raise ValueError(
            f"Invalid RAZORPAY_KEY_ID format. Should start with 'rzp_' (test) or 'rzp_live_' (live). "
            f"Got: {key_id[:10]}..."
        )
    
    return razorpay.Client(auth=(key_id, key_secret))


def verify_payment_signature(payment_id, order_id, signature):
    """
    Verify Razorpay payment signature.
    
    Args:
        payment_id (str): Razorpay payment ID
        order_id (str): Razorpay order ID
        signature (str): Payment signature from Razorpay
    
    Returns:
        bool: True if signature is valid, False otherwise
    """
    try:
        client = get_razorpay_client()
        params = {
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature,
        }
        client.utility.verify_payment_signature(params)
        return True
    except razorpay.errors.SignatureVerificationError:
        return False
    except Exception:
        return False


def verify_webhook_signature(payload, signature):
    """
    Verify Razorpay webhook signature.
    
    Args:
        payload (bytes): Raw webhook payload
        signature (str): Webhook signature from Razorpay
    
    Returns:
        bool: True if signature is valid, False otherwise
    """
    try:
        webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET
        if not webhook_secret:
            return False
        
        client = get_razorpay_client()
        client.utility.verify_webhook_signature(payload, signature, webhook_secret)
        return True
    except razorpay.errors.SignatureVerificationError:
        return False
    except Exception:
        return False

