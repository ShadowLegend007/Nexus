# Nexus Server (Backend)

The Node.js backend powering the Nexus messaging platform. Handles REST API requests, real-time WebSocket communication, machine learning webhook integrations, and multi-cloud file uploads.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Real-time:** Socket.io
- **File Uploads:** Multer & Cloudinary SDK

## Multi-Cloudinary Architecture
Nexus uses a triple-Cloudinary setup to organize and backup user data:
1. **Media API**: Dedicated to images, videos, and audio.
2. **Docs API**: Dedicated to raw documents (PDFs, Word, Excel, text).
3. **Backup API**: Every file (media or doc) is simultaneously uploaded to this instance for disaster recovery.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in your MongoDB URI and the 3 distinct Cloudinary credentials:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/nexus
   JWT_SECRET=your_jwt_secret
   
   CLOUDINARY_MEDIA_CLOUD_NAME=
   CLOUDINARY_MEDIA_API_KEY=
   CLOUDINARY_MEDIA_API_SECRET=
   
   CLOUDINARY_DOCS_CLOUD_NAME=
   CLOUDINARY_DOCS_API_KEY=
   CLOUDINARY_DOCS_API_SECRET=
   
   CLOUDINARY_BACKUP_CLOUD_NAME=
   CLOUDINARY_BACKUP_API_KEY=
   CLOUDINARY_BACKUP_API_SECRET=
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```
