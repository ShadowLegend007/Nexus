# Nexus Client (Frontend)

The frontend for the Nexus secure messaging platform, built with React 18, Vite, Tailwind CSS, Zustand, and Socket.io.

## Tech Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Lucide Icons
- **Real-time WebSockets:** Socket.io-client
- **State Management:** Zustand (`authStore`, `chatStore`, `uiStore`)
- **Routing:** React Router v6
- **Encryption:** Web Crypto API (ECDH + AES-GCM)

---

## Detailed Directory & File Breakdown

```
src/
├── api/                         # Axios HTTP service layer
│   ├── api.js                   # Base Axios instance with JWT interceptor
│   ├── auth.js                  # Authentication endpoints (login, register, OTP)
│   ├── contacts.js              # Contact management endpoints
│   ├── conversations.js         # Conversation endpoints
│   ├── messages.js              # Encrypted message endpoints
│   └── upload.js                # Media & file upload endpoints
├── components/                  # Reusable UI component modules
│   ├── auth/                    # Auth-specific UI elements
│   ├── background/              # Animated canvas / background effects
│   ├── chat/                    # Chat workspace, message list, media modals
│   │   ├── AudioRecorderModal.jsx   # Voice recorder modal with wave visualization
│   │   ├── ChatWindow.jsx           # Main message timeline & chat header
│   │   ├── DocsPanel.jsx            # Shared media/docs drawer
│   │   ├── FilePreview.jsx          # File attachment preview drawer
│   │   ├── InputBar.jsx             # Text input, emoji picker, attachment triggers
│   │   ├── MediaCaptureModal.jsx    # Webcam photo & video recorder modal
│   │   ├── MediaEditorModal.jsx     # Image cropping & caption editing modal
│   │   ├── MessageBubble.jsx        # Message container, audio player & safety badges
│   │   └── StarredMessagesPanel.jsx # Starred messages drawer
│   ├── contacts/                # Contact components
│   │   ├── AddContact.jsx           # Hex ID add contact modal
│   │   ├── ContactList.jsx          # Active contact list & presence status
│   │   ├── QRDisplay.jsx            # Cryptographic Hex ID & QR Code card
│   │   └── QRScanner.jsx            # Live QR code camera scanner (html5-qrcode)
│   ├── landing/                 # Marketing landing page components
│   ├── profile/                 # User profile settings & cryptographic identity
│   │   ├── HexCodeCard.jsx          # One-click copyable Hex ID card
│   │   └── ProfileSettings.jsx      # Profile editor & key inspector
│   ├── reactbits/               # Special UI animation widgets
│   ├── scan/                    # Virus/Safety scan status badges
│   └── ui/                      # Base UI design system controls
│       ├── Avatar.jsx               # User avatar renderer
│       ├── AvatarRing.jsx           # Online/Offline status ring indicator
│       ├── Button.jsx               # Reusable styled button
│       ├── Modal.jsx                # Accessible backdrop modal dialog
│       ├── NexusLogo.jsx            # SVG Brand logo
│       ├── UICustomizerPanel.jsx    # Theme & chat customizer drawer
│       └── VerifiedBadge.jsx        # Verified checkmark badge
├── pages/                       # Top-level route views
│   ├── AddContactPage.jsx       # Mobile page for adding contacts by Hex/QR
│   ├── ChatPage.jsx             # Secure chat application main view
│   ├── LandingPage.jsx          # Homepage showcasing security & features
│   ├── LoginPage.jsx            # Multi-step login, inline errors & password reset
│   ├── ProfilePage.jsx          # User settings & identity dashboard
│   └── RegisterPage.jsx         # Identity generation & QR code reveal
├── store/                       # Zustand global state management
│   ├── authStore.js             # User identity, JWT token, and OTP state
│   ├── chatStore.js             # Active conversation, message list & Socket events
│   └── uiStore.js               # Theme configuration & panel toggles
├── utils/                       # Frontend helper utilities
│   ├── crypto.js                # Web Crypto E2EE encryption/decryption
│   ├── fileValidator.js         # File type & size safety checks
│   ├── hexGenerator.js          # Hex ID formatting (`NX-XXXX-XXXX`)
│   └── scanStatus.js            # Safety scan status formatters
├── App.jsx                      # App router & auth checker initialization
├── App.css                      # Application level CSS rules
├── index.css                    # Tailwind CSS directives & theme rules
└── main.jsx                     # Vite DOM entry point
```

---

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   Ensure you have a `.env` file pointing to your backend API:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```
