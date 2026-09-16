import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_password_reset_email(to_email: str, reset_link: str) -> bool:
    """Sends a password reset email via SMTP.
    Returns True if sent successfully, False otherwise.
    """
    if not settings.smtp_user or not settings.smtp_password:
        logger.warning("SMTP credentials (smtp_user / smtp_password) not set. Skipping email dispatch.")
        return False

    sender_email = settings.smtp_from_email or settings.smtp_user
    sender_header = f"{settings.smtp_from_name} <{sender_email}>"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset your DO-IT password"
    msg["From"] = sender_header
    msg["To"] = to_email

    text_body = f"""Hello,

We received a request to reset the password for your DO-IT account.

To choose a new password, click the link below (valid for 30 minutes):
{reset_link}

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

Best,
The DO-IT Team
"""

    html_body = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your DO-IT password</title>
  <style>
    body {{
      margin: 0;
      padding: 32px 16px;
      background-color: #0f1117;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f3f4f6;
    }}
    .container {{
      max-width: 480px;
      margin: 0 auto;
      background-color: #1a1d27;
      border: 1px solid #2d3345;
      border-radius: 12px;
      padding: 36px 28px;
    }}
    .logo {{
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #60a5fa;
      margin-bottom: 24px;
    }}
    h1 {{
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 16px;
    }}
    p {{
      font-size: 14px;
      line-height: 1.6;
      color: #9ca3af;
      margin: 0 0 20px;
    }}
    .btn-wrap {{
      text-align: center;
      margin: 32px 0;
    }}
    .btn {{
      display: inline-block;
      background-color: #3b82f6;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
    }}
    .link-fallback {{
      font-size: 12px;
      color: #6b7280;
      word-break: break-all;
      line-height: 1.5;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #2d3345;
    }}
    .footer {{
      font-size: 12px;
      color: #6b7280;
      margin-top: 20px;
      line-height: 1.5;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">DO-IT</div>
    <h1>Reset your password</h1>
    <p>We received a request to reset the password for your DO-IT account. Tap the button below to choose a new password:</p>
    <div class="btn-wrap">
      <a href="{reset_link}" class="btn" target="_blank">Reset Password</a>
    </div>
    <div class="link-fallback">
      If the button above doesn't work, copy and paste this link into your browser:<br>
      <a href="{reset_link}" style="color: #60a5fa;">{reset_link}</a>
    </div>
    <div class="footer">
      This link is valid for 30 minutes. If you did not make this request, you can safely ignore this email.
    </div>
  </div>
</body>
</html>
"""

    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        clean_password = settings.smtp_password.replace(" ", "")
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=12) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.smtp_user, clean_password)
            server.sendmail(sender_email, [to_email], msg.as_string())
        logger.info(f"Password reset email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email via SMTP: {e}", exc_info=True)
        return False
