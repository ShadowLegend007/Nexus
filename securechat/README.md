# SecureChat 🛡️

A next-generation web-based real-time global chat application featuring AI-powered file/text security scanning, pseudonymous 12-digit hex-based identities, and contact additions via camera QR code scanning.

---

## Technical Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Zustand, Socket.io-client, React Router Dom v6, html5-qrcode, qrcode.react
- **Backend**: Node.js, Express, Socket.io, MongoDB, Mongoose, JWT, bcryptjs, Multer, Cloudinary
- **Security Engine**: Automated 2-Tier classification pipeline (stubbed for ML integration)

---

## Folder Structure

```
/securechat
  /client         ← React frontend (Vite scaffolded)
    /src
      /api        ← Axios REST calls
      /components ← Modular UI, scan shields, contact scan and chat widgets
      /constants  ← Mime registries and state enums
      /hooks      ← Custom Socket, file upload and message state hook wrappers
      /pages      ← Main landing, auth and split chat panels
      /store      ← Zustand global states
      /utils      ← Hex string formatters & check functions
  /server         ← Express backend server API
    /config       ← MongoDB and Cloudinary boot keys
    /controllers  ← Endpoint request processors
    /middleware   ← Authorization gates and file fallback engines
    /models       ← Mongoose data schemas
    /routes       ← REST path registries
    /services     ← ML scanning stub and messaging socket brokers
    /socket       ← Socket rooms and active connection gateways
    /utils        ← Security enums and Hex validators
```

---

## Environment Variables

### Backend Server (`/server/.env`)

```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/securechat
JWT_SECRET=securechat_jwt_secret_key_2026_xyz
CLOUDINARY_CLOUD_NAME=                  # Optional: Fallback to local uploads if omitted
CLOUDINARY_API_KEY=                     # Optional: Fallback to local uploads if omitted
CLOUDINARY_API_SECRET=                  # Optional: Fallback to local uploads if omitted
ML_CALLBACK_URL=http://localhost:5000
ML_TIER1_ENDPOINT=                      # Ignored by stub
ML_TIER2_ENDPOINT=                      # Ignored by stub
CLIENT_URL=http://localhost:5173
```

### Frontend Client (`/client/.env`)

```ini
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## Setup & Running Guide

### Prerequisite

- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port 27017.

### Running Backend Server

1. Navigate to `/server` directory:
   ```bash
   cd server
   ```
2. Run standard local setup:
   ```bash
   npm run dev
   ```
   *The server defaults to port `5000`.*

### Running Frontend Client

1. Navigate to `/client` directory:
   ```bash
   cd client
   ```
2. Run Vite dev server:
   ```bash
   npm run dev
   ```
   *The client dev panel boots at `http://localhost:5173`.*

---

## Integrating the ML Security Layer

The ML team can seamlessly integrate their real-time classification pipeline by updating the `/server/services/mlService.js` file.

### Current Heuristics Stub Workflow

The stubbed function simulates scanning verdicts using randomized delays and weights, triggering callbacks via `handleVerdict()` locally.

### Production Pipeline Workflow

To integrate the production machine learning modules, complete the following changes inside `mlService.js`:

1. **Trigger Tier 1 Model**:
   Configure `submitForScan(message)` to make an HTTP POST query to the fast local classification gateway (`ML_TIER1_ENDPOINT`):
   ```javascript
   const payload = {
     messageId: message._id,
     contentType: message.contentType,
     textContent: message.textContent || null,
     fileUrl: message.fileUrl || null,
     callbackUrl: process.env.ML_CALLBACK_URL + '/api/ml/verdict'
   };
   
   await axios.post(process.env.ML_TIER1_ENDPOINT, payload);
   ```

2. **Trigger Tier 2 Escalation (Cloud Models)**:
   If the fast local inspection returns a suspicious score exceeding `0.4` threshold, escalate processing by forwarding the payload to the heavier cloud-based VM (`ML_TIER2_ENDPOINT`):
   ```javascript
   if (tier1Response.suspiciousScore > 0.4) {
     await axios.post(process.env.ML_TIER2_ENDPOINT, payload);
   }
   ```

3. **Webhook Verification Callbacks**:
   Both Tier 1 and Tier 2 instances must POST back classification payloads to the server's webhook controller (`/api/ml/verdict`):
   ```json
   {
     "messageId": "658abcde1234567890f12345",
     "tier": 1,
     "verdict": "MALWARE",
     "confidence": 0.98,
     "threatType": "TROJAN",
     "details": "Identified base64 reverse shell script block."
   }
   ```

4. **Unified Processing State**:
   The webhook router triggers `handleVerdict()` which updates the database records (marking `isQuarantined: true` for `MALWARE` verdicts) and fires immediate WebSocket events `message:status` to active clients, bypassing page refreshes.
