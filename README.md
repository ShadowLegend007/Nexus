# Nexus Platform

Nexus is a full-stack real-time messaging platform prioritizing security and privacy. Built with React (Vite), Node.js, and Socket.io, it allows users to connect anonymously via 12-digit hex IDs and QR codes. 

All communications, including text, media, documents, and links, pass through a sophisticated two-tier ML security pipeline that scans for malware, viruses, and threats before delivery to the recipient.

## Project Structure

This is a monorepo containing both the frontend client and the backend server.

- **[Client](./client/)**: The React frontend application. See the [Client README](./client/README.md) for details on running the UI.
- **[Server](./server/)**: The Node.js/Express backend API and WebSocket server. See the [Server README](./server/README.md) for details on setting up the database and environment variables.

## Key Features

1. **Hex ID Connectivity**: No phone numbers required. Users add each other via unique cryptographic hex IDs.
2. **Real-time Messaging**: Instant delivery with WebSockets (Socket.io).
3. **Dual Cloudinary Uploads**: Media and documents are intelligently routed to separate Cloudinary buckets based on file type, while every file is simultaneously uploaded to a dedicated Backup Cloudinary instance.
4. **ML Security Pipeline**: Automatic virus and threat scanning for all uploaded media and text links.

## Getting Started

To get the full application running, you will need to open two terminal windows:

### Terminal 1: Backend
```bash
cd server
npm install
npm run dev
```

### Terminal 2: Frontend
```bash
cd client
npm install
npm run dev
```
