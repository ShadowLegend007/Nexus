# Nexus Server (Backend)

The Node.js backend powering the Nexus messaging platform. Handles REST API requests, real-time WebSocket communication, machine learning webhook integrations, Nodemailer OTP recovery, and Cloudinary media uploads.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Real-time:** Socket.io
- **File Uploads:** Multer & Cloudinary SDK
- **Authentication:** JWT (JSON Web Tokens) & Bcrypt password hashing
- **Mail Transporter:** Nodemailer

---

## Detailed Directory & File Breakdown

```
server/
├── config/                      # Infrastructure & service connections
│   ├── db.js                    # MongoDB connection configuration
│   └── cloudinary.js            # Cloudinary API cloud storage setup
├── controllers/                 # REST API Request Handlers
│   ├── auth.controller.js       # Register, Login (distinct errors), OTP & Reset Password
│   ├── contact.controller.js    # Contact search, add by Hex ID, remove, list contacts
│   ├── conversation.controller.js # Create & fetch 1-on-1 conversations
│   ├── message.controller.js    # Save encrypted messages, message history, read receipts
│   ├── upload.controller.js     # Media upload to Cloudinary & AI scan trigger
│   └── mlWebhook.controller.js  # Webhook receiving AI virus scan results
├── middleware/                  # Request Processing Middleware
│   ├── auth.middleware.js       # JWT token authentication verification
│   ├── rateLimiter.js           # API rate limiting & brute-force protection
│   └── upload.middleware.js     # Multer memory storage & file type validation
├── models/                      # MongoDB Mongoose Data Schemas
│   ├── User.js                  # User profile, passwordHash, hexId, E2EE public keys
│   ├── Contact.js               # 1-on-1 contact links between users
│   ├── Conversation.js          # Conversation metadata & unread counters
│   ├── Message.js               # Encrypted message content, attachments & scan status
│   └── Otp.js                   # 4-digit OTP records with 10-min TTL auto-expire
├── routes/                      # Express Route Definitions
│   ├── auth.routes.js           # `/api/auth/*` routes
│   ├── contact.routes.js        # `/api/contacts/*` routes
│   ├── conversation.routes.js   # `/api/conversations/*` routes
│   ├── message.routes.js        # `/api/messages/*` routes
│   ├── mlWebhook.routes.js      # `/api/ml/*` routes
│   └── upload.routes.js         # `/api/upload/*` routes
├── services/                    # External Service Integrations
│   └── mlService.js             # Async client interfacing with AI safety scanner
├── socket/                      # Real-Time WebSocket Handlers
│   ├── roomManager.js           # Active online user socket connection map
│   └── socketHandler.js         # Presence, messaging, typing indicators, read receipts
├── utils/                       # Utility Functions
│   ├── hexGenerator.js          # Generates unique 12-character Hex IDs (`NX-XXXX-XXXX`)
│   ├── mailer.js                # Nodemailer setup for emailing OTPs
│   └── messageStatus.js         # Message delivery receipt helper
└── server.js                    # Express app initialization & Socket.io attachment
```

---

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables Setup:**
   Create a `.env` file in `server/`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/nexus
   JWT_SECRET=your_jwt_secret
   
   # Cloudinary Credentials
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Email Transporter (OTP)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```
