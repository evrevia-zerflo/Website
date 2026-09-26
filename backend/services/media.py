"""
Media Storage Service
=====================

Currently configured for Zero-Budget MVP (Google Drive).

Architecture:
1. Admin manually uploads images/videos to Google Drive.
2. Admin sets permissions to "Anyone with the link".
3. Admin extracts the File ID and copies the public link into the EVRÉVIA Admin Dashboard.
4. The URL is saved in MongoDB inside the Product model (`images` list).

Future Upgrades (Cloudinary / AWS S3):
When budget permits, this service can be extended to accept image files via FastAPI `UploadFile`,
automatically upload them to an Object Storage provider, and return the optimized URL to be saved in DB.
"""

def upload_media():
    pass
