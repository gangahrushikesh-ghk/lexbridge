# LexBridge v2.1
Run: `npm install && npm start` then open http://localhost:3000

## Demo accounts (password `demo123`)
- Clients: client@demo.in (Hyderabad), client2@demo.in (Chennai)
- 24 demo advocates across all 12 cities and 4 bands. The lawyer login page lists them as one-tap buttons, sorted by band (Essential, Standard, Premier, Elite).

## Deploy (Render / Railway)
Build `npm install`, start `npm start`. Set `DATA_DIR` to a persistent disk path.
Optional `TURN_URL`, `TURN_USER`, `TURN_PASS` for video across strict networks.
Video needs HTTPS (localhost is exempt). Health check: `/api/health`.
Existing deployments upgrade automatically: missing demo advocates are added on boot without touching existing data.

See DEMO_GUIDE.md for the presentation script and the camera explanation.
