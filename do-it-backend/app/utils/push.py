import json
import logging
from pywebpush import webpush, WebPushException

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_web_push(subscription_info: dict, payload: dict):
    """
    Sends a web push notification using pywebpush.
    Returns:
        True: if sent successfully
        "expired": if the endpoint is 404 or 410 (browser unsubscribed or token expired)
        False: if other error occurred
    """
    if not settings.vapid_private_key:
        logger.warning("VAPID_PRIVATE_KEY not set. Cannot send web push.")
        return False

    vapid_claims = {
        "sub": settings.vapid_claim_email
    }

    try:
        webpush(
            subscription_info=subscription_info,
            data=json.dumps(payload),
            vapid_private_key=settings.vapid_private_key,
            vapid_claims=vapid_claims,
            timeout=10,
        )
        logger.info(f"Web push sent successfully to {subscription_info.get('endpoint')[:45]}...")
        return True
    except WebPushException as ex:
        status = getattr(ex.response, "status_code", None) if ex.response else None
        logger.warning(f"WebPushException (status={status}): {ex}")
        if status in (404, 410):
            return "expired"
        return False
    except Exception as e:
        logger.error(f"Error sending web push: {e}", exc_info=True)
        return False
