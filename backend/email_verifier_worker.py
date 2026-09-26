import imaplib
import email
import re
from datetime import datetime
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from backend.models.order import Order
from backend.models.product import Product, Category
from backend.models.user import User
from backend.models.cart import Cart
from backend.core.config import settings
import os

# Configuration (Set these in .env)
IMAP_SERVER = "imap.gmail.com"
EMAIL_ACCOUNT = os.getenv("VERIFY_EMAIL_ACCOUNT")
EMAIL_PASSWORD = os.getenv("VERIFY_EMAIL_PASSWORD") # App Password

async def verify_payments_from_email():
    if not settings.MONGODB_URI:
        print("MongoDB not configured. Exiting worker.")
        return

    # Init DB
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    await init_beanie(database=client.evrevia, document_models=[Product, Category, User, Cart, Order])
    print("Connected to DB. Checking emails...")

    if not EMAIL_ACCOUNT or not EMAIL_PASSWORD:
        print("Email credentials not configured. Please set VERIFY_EMAIL_ACCOUNT and VERIFY_EMAIL_PASSWORD.")
        return

    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL_ACCOUNT, EMAIL_PASSWORD)
        mail.select("inbox")

        # Search for unread emails (you might filter by specific sender e.g., your bank)
        status, messages = mail.search(None, 'UNSEEN')
        email_ids = messages[0].split()

        for e_id in email_ids:
            status, msg_data = mail.fetch(e_id, '(RFC822)')
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    subject = msg["subject"]
                    
                    # Extract body
                    body = ""
                    if msg.is_multipart():
                        for part in msg.walk():
                            if part.get_content_type() == "text/plain":
                                body = part.get_payload(decode=True).decode()
                                break
                    else:
                        body = msg.get_payload(decode=True).decode()
                    
                    # Simple Regex Example: "Received Rs. 2499" or "UPI Ref: Order_xyz"
                    # This needs to be tuned based on the exact bank email format.
                    amount_match = re.search(r'(?:Rs\.|INR)\s*(\d+(?:\.\d{2})?)', body)
                    order_match = re.search(r'Order_([a-zA-Z0-9]+)', body)

                    if amount_match and order_match:
                        amount = float(amount_match.group(1))
                        order_id_prefix = order_match.group(1)

                        # Find pending orders matching this ID prefix
                        pending_orders = await Order.find(
                            Order.paymentStatus == "PENDING_PAYMENT"
                        ).to_list()

                        for order in pending_orders:
                            if str(order.id).startswith(order_id_prefix) and float(order.total) == amount:
                                print(f"Match found! Flagging Order {order.id} for REVIEW.")
                                order.paymentStatus = "REVIEW"
                                await order.save()
                                break

        mail.close()
        mail.logout()
        print("Email check complete.")

    except Exception as e:
        print(f"Error checking emails: {e}")

if __name__ == "__main__":
    asyncio.run(verify_payments_from_email())
