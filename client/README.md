# Nexus Client (Frontend)

The frontend for the Nexus messaging platform, built for speed and security.

## Tech Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Real-time:** Socket.io-client
- **State Management:** React Context / Hooks

## Features
- Dynamic real-time chat interface
- Drag-and-drop file uploading
- File preview for images, videos, and PDFs
- QR Code generation and scanning for adding contacts
- Live threat-detection UI indicators for scanned messages

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   Ensure you have a `.env` or `.env.local` pointing to the backend API.
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

## Folder Structure
- `src/components`: Reusable UI components (buttons, modals, message bubbles).
- `src/pages`: Main application views (Chat, Login, Contacts).
- `src/api`: Axios instances and API helper functions.
- `src/socket`: WebSocket event listeners and emitters.
