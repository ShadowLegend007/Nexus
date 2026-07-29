# Nexus Platform

Nexus is a full-stack real-time messaging platform prioritizing security, end-to-end encryption (E2EE), and privacy. Built with React (Vite), Node.js, Express, Socket.io, and MongoDB, it allows users to connect anonymously via 12-digit Hex Identity Codes and QR codes.

All communications, including text, media, documents, and links, pass through a two-tier ML security pipeline that scans for malware, viruses, and threats before delivery to the recipient.

---

## Technical Stack Overview

- **Frontend:** React 18, Vite, TailwindCSS, Zustand (State Management), Lucide Icons, Axios, React Router v6, React Hot Toast.
- **Backend:** Node.js, Express.js, Socket.io (Real-Time WebSockets), MongoDB + Mongoose (Database), Cloudinary (Encrypted Media Storage), Nodemailer (OTP Mailer).

---

## Repository Directory & File Structure

```
Nexus/
├── client/                      # Frontend Application (React + Vite + Tailwind)
│   ├── public/                  # Static web assets
│   ├── src/
│   │   ├── api/                 # Axios HTTP service layer (auth, contacts, messages, upload)
│   │   ├── components/          # Reusable UI component modules
│   │   │   ├── auth/            # Auth-specific UI elements
│   │   │   ├── background/      # Animated canvas / background effects
│   │   │   ├── chat/            # Chat room UI, message list, media & audio recorder modals
│   │   │   ├── contacts/        # Add contacts, QR code generator & scanner
│   │   │   ├── landing/         # Marketing landing page components
│   │   │   ├── profile/         # User profile settings & cryptographic identity
│   │   │   ├── reactbits/       # Special UI animation widgets
│   │   │   ├── scan/            # Malware/AI safety scan indicators
│   │   │   └── ui/              # Reusable UI design tokens & controls (Button, Modal, Avatar)
│   │   ├── constants/           # Global application constants
│   │   ├── data/                # Sample / preset data
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Top-level route pages (LoginPage, RegisterPage, ChatPage, ProfilePage, LandingPage)
│   │   ├── store/               # Zustand global state management (authStore, chatStore, uiStore)
│   │   ├── utils/               # E2EE Crypto, file validation, Hex code utils
│   │   ├── App.jsx              # Main App router & auth initializer
│   │   ├── App.css              # App specific styles
│   │   ├── index.css            # Tailwind & global design system styles
│   │   └── main.jsx             # Vite entry point
│   ├── .env                     # Client environment variables
│   ├── package.json             # Frontend dependencies & scripts
│   ├── tailwind.config.js       # Tailwind CSS theme configuration
│   └── vite.config.js           # Vite bundler config
│
└── server/                      # Backend Server (Node.js + Express + Socket.io)
    ├── config/                  # Database (db.js) & Cloudinary cloud service configs
    ├── controllers/             # Express HTTP request logic & endpoints (auth, contact, conversation, message, upload)
    ├── middleware/              # Authentication, file upload, & rate-limiting middleware
    ├── models/                  # MongoDB Mongoose data models (User, Contact, Conversation, Message, Otp)
    ├── routes/                  # Express REST API routes
    ├── services/                # External AI/ML virus safety scan integrations
    ├── socket/                  # Real-time WebSockets event handlers (socketHandler.js) & room tracking (roomManager.js)
    ├── utils/                   # Server utilities (hexGenerator.js, mailer.js, messageStatus.js)
    ├── .env                     # Backend environment variables
    ├── package.json             # Server dependencies & scripts
    └── server.js                # Server entry point & Socket.io initialization
```

---

## Detailed File Responsibilities

### Frontend (`client/src/`)

#### Pages (`src/pages/`)
- `LoginPage.jsx`: Multi-step authentication flow with inline error fallback displays for unregistered email, incorrect password, and 4-digit OTP password reset.
- `RegisterPage.jsx`: Identity creation view generating unique cryptographic Hex IDs and shareable QR codes.
- `ChatPage.jsx`: Main messaging view with sidebar navigation, active chat history, attachment bar, and presence indicators.
- `LandingPage.jsx`: Product homepage showcasing security architecture, features, pricing, and live stats.
- `ProfilePage.jsx`: User profile editor, avatar customizer, theme selector, and cryptographic key visualizer.
- `AddContactPage.jsx`: Mobile-friendly page for adding contacts via Hex ID search or live QR camera scan.

#### Components (`src/components/`)
- `chat/`: Chat workspace components including `ChatWindow.jsx`, `MessageBubble.jsx`, `InputBar.jsx`, `AudioRecorderModal.jsx`, `MediaCaptureModal.jsx`, `MediaEditorModal.jsx`, `DocsPanel.jsx`, and `StarredMessagesPanel.jsx`.
- `contacts/`: `AddContact.jsx`, `ContactList.jsx`, `QRDisplay.jsx`, and `QRScanner.jsx` (live camera scanning using `html5-qrcode`).
- `profile/`: `HexCodeCard.jsx` and `ProfileSettings.jsx`.
- `ui/`: Design system controls including `UICustomizerPanel.jsx`, `Button.jsx`, `Modal.jsx`, `Avatar.jsx`, `AvatarRing.jsx`, and `NexusLogo.jsx`.

#### State & API (`src/store/` & `src/api/`)
- `authStore.js`: Zustand store for user auth status, token persistence, and profile state.
- `chatStore.js`: Store managing active conversations, message timeline, typing status, and real-time Socket events.
- `uiStore.js`: Store managing custom dark/light theme, sound toggles, and panel visibility.
- `api/`: Axios HTTP helper functions for auth, contacts, conversations, messages, and uploads.

#### Utilities (`src/utils/`)
- `crypto.js`: Web Crypto API implementing ECDH key generation, shared secret calculation, and AES-GCM message encryption/decryption.
- `hexGenerator.js`: Formatting tools for Hex identity strings (`NX-XXXX-XXXX`).
- `fileValidator.js`: Client-side validation for file types and size limits (max 50MB).

---

### Backend (`server/`)

#### Entry & Config
- `server.js`: Express app setup, MongoDB connection trigger, route mounting, and Socket.io attachment.
- `config/db.js`: Mongoose database connection setup.
- `config/cloudinary.js`: Cloudinary API initialization for file hosting.

#### Controllers & Routes (`controllers/` & `routes/`)
- `auth.controller.js`: User registration, login validation with distinct error messaging, profile update, and OTP password recovery.
- `contact.controller.js`: Contact addition by Hex ID, removal, and contact list retrieval.
- `conversation.controller.js`: 1-on-1 conversation creation and metadata fetching.
- `message.controller.js`: Encrypted message persistence, history retrieval, read receipts, and starring.
- `upload.controller.js`: File attachment upload to Cloudinary and asynchronous dispatch to AI safety scan.
- `mlWebhook.controller.js`: Webhook handler receiving file virus scan results and broadcasting to clients via WebSockets.

#### Models & Socket (`models/` & `socket/`)
- `User.js`, `Contact.js`, `Conversation.js`, `Message.js`, `Otp.js`: MongoDB data schemas.
- `socketHandler.js`: WebSockets event listeners for real-time messaging, presence, and typing indicators.
- `roomManager.js`: Active online user socket connection map.

---

## Key Features

1. **Hex ID & QR Connectivity**: No phone numbers required. Connect anonymously via unique cryptographic hex codes (`NX-XXXX-XXXX`) or QR code camera scans.
2. **Real-time Encrypted Messaging**: Instant delivery via Socket.io with end-to-end AES-GCM encryption.
3. **Multi-Step Password Reset & Error Handling**: Inline fallback error displays for unregistered emails, wrong passwords, and OTP verification.
4. **Cloudinary File Attachments & Audio Recorder**: Support for instant voice recordings, camera clips, and encrypted file attachments.
5. **AI Safety Pipeline**: Automatic virus and malware threat scanning for uploaded files and link payloads.

---

## Getting Started

To run the application locally, start both the backend server and frontend client in separate terminal windows:

### Terminal 1: Backend Server
```bash
cd server
npm install
npm run dev
```

### Terminal 2: Frontend Client
```bash
cd client
npm install
npm run dev
```
