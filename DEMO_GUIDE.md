# LexBridge - Demo and Viva Guide

## 1. Setup for the live demo (2 minutes)
1. Open the deployed HTTPS link in **two separate windows**: one normal, one Incognito (or laptop + phone).
2. Window A: Client login -> `client@demo.in`. Window B: Lawyer login -> pick any advocate button, e.g. "Standard · Imran Sheikh".
3. Allow camera and microphone when the browser asks, in both windows.

## 2. Demo flow (5 minutes)
1. Client registers a case: area, city, band, consent to location, mock payment.
2. Lawyer list shows only eligible lawyers: same band plus geo-fence.
   - Essential: within 100 km (Haversine distance between city coordinates)
   - Standard: same state; Premier and Elite: all India
   - Try client2@demo.in (Chennai) vs client@demo.in (Hyderabad) to show different results.
3. Client books a 15-20 min consultation (max 3 lawyers per fee). Lawyer confirms.
4. **Video call** (see section 3).
5. Lawyer completes the call with advice and next steps, then accepts or rejects the case.
6. Client e-signs the agreement, pays the advance token (10%, escrow) and the workspace opens.
7. Lawyer adds a hearing, an update and closes the case; the client leaves a verified review and the lawyer's rating and band update live.

## 3. How to explain the camera
- **What it is:** WebRTC, a browser technology for peer-to-peer audio and video. No third-party video service is used.
- **Step 1 - permission:** `navigator.mediaDevices.getUserMedia()` asks the user for camera and microphone. If the camera is denied, the app falls back to audio only and says so.
- **Step 2 - signalling:** Both people join a private Socket.IO room for that consultation. The server only lets the client and the booked lawyer into it, and only while the consultation is "scheduled". The server passes three messages between them: *offer*, *answer* and *ICE candidates*. It never touches the video itself.
- **Step 3 - connection:** `RTCPeerConnection` uses the ICE candidates to find a network path. STUN (Google's public server) discovers each side's public address. If a strict firewall blocks a direct path, a TURN relay (set via `TURN_URL`) forwards the media.
- **Step 4 - media flows directly** between the two browsers, encrypted by default (DTLS-SRTP). The in-call chat uses the same Socket.IO room.
- **Why HTTPS:** browsers only allow camera access on secure origins; localhost is the only exception. Render and Railway provide HTTPS automatically.

One-line answer: "The server introduces the two browsers to each other, then the video goes directly between them, encrypted."

## 4. Questions to expect
- Is the summary real AI? No. It is template-based from the client's input and the lawyer's notes, labelled with a disclaimer. An LLM can replace it later.
- Are payments real? No, they are simulated with a DEMO- reference. A gateway such as Razorpay is the next step.
- Why a JSON file? Zero-setup storage for the demo; the data layer is small enough to swap for PostgreSQL or MongoDB.
- Security in place: scrypt password hashing with salt, random session tokens, role-based route protection, file access checks, login rate limiting, security headers, camera permission policy.
