# NISHPaksh AI | Digital Companion for Field Drug Testing

NISHPaksh AI is a forensic digital platform built for narcotics law enforcement officers (Narcotics Control Bureau / State Police) and forensic science laboratories (FSL). It provides an untampered, verifiable field drug testing pipeline with live camera capture, optical color calibration, SHA-256 cryptographic sealing, and chain of custody tracking under Section 52A of the NDPS Act.

---

## Key Features & Compliance

1. **Working Live Camera Pipeline (`navigator.mediaDevices.getUserMedia`)**:
   - Live camera stream with responsive viewport, alignment guide brackets, front/back camera switching, and torch/flash controls.
   - Graceful permission handling: descriptive error banners if access is denied, with instant retry and fallback device upload options.
2. **6-Image Forensic Evidence Standard**:
   - **5 Evidence / Sample Images**: Captures reagent reaction progression, chemical precipitate, and sample vial details.
   - **1 Separate Color Reference Card**: Captures an optical calibration chart independently to normalize ambient daylight/indoor lighting without contaminating the chemical reaction pixels.
3. **Gallery & Controls**:
   - Numbered thumbnail grid for the 5 sample frames + dedicated gold/blue badge card for the reference card.
   - Retake individual frames, delete individual frames, zoom/preview modal on full-size images, and retake all.
4. **Validation Guard**:
   - Progression to forensic analysis and backend submission is strictly guarded until all 5 sample frames AND 1 reference card are captured.
5. **Real Optical Color Calibration (No Fabricated AI Numbers)**:
   - Evaluates luminance, RGB channel reflectance, and neutral balance from the reference card.
   - Samples reaction epicenter RGB and matches against standard reagent colorimetric charts (Scott, Marquis, Mandelin, Mecke).
   - Complies with forensic legal requirements: does **not** hallucinate synthetic confidence percentages.
6. **Backend Storage & Cryptographic Sealing**:
   - Uploads the 6 images and metadata to Express REST backend (`/api/evidence/upload`).
   - Computes an immutable SHA-256 digital seal hash for court admissibility.
   - Serves evidence files statically and indexes them in the Evidence Vault and Cases Registry.
7. **Complete 12-Page Navigation Layout**:
   - Preserves all pages, colors (`#0B3C8C`), typography (Inter & Devanagari), Government of India branding, and responsive mobile drawers.

---

## Project Structure

```
nishpaksh-ai/
├── frontend/                     # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/           # Header, Sidebar, Layout, EvidenceCapture
│   │   ├── pages/                # Dashboard, NewTestWizard, Cases, Vault, etc.
│   │   ├── context/              # AuthContext (Gov roles), CasesContext
│   │   ├── services/             # api.js client
│   │   ├── utils/                # colorCalibration.js
│   │   ├── App.jsx               # Routes and guards
│   │   ├── index.css             # Theme tokens & styling
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json               # SPA routing configuration
│   └── package.json
├── backend/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── controllers/          # casesController.js, evidenceController.js
│   │   ├── routes/               # casesRoutes.js, evidenceRoutes.js
│   │   ├── middleware/           # uploadMiddleware.js (Multer)
│   │   ├── data/                 # casesStore.js
│   │   └── server.js             # Express app entrypoint
│   ├── uploads/                  # Saved evidence images
│   ├── test_api.js               # Integration test script
│   └── package.json
├── vercel.json                   # Monorepo fullstack deployment configuration
├── package.json                  # Root runner scripts
├── .env.example
└── README.md
```

---

## Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 1. Installation
Install dependencies for both frontend and backend from the root directory:
```bash
npm run install:all
```
*(Or navigate to `backend` and `frontend` folders individually and run `npm install`)*

### 2. Start the Backend API Server
```bash
npm run dev:backend
```
The backend server runs on `http://localhost:5000`.

### 3. Start the Frontend Application
In a separate terminal:
```bash
npm run dev:frontend
```
The frontend application opens on `http://localhost:5173`.

Vite automatically proxies all `/api` requests to `http://localhost:5000`.

---

## Running Integration Tests

To test all backend endpoints, upload validation (rejecting incomplete images, accepting 5 samples + 1 reference card), and SHA-256 seal computation:
```bash
cd backend
node test_api.js
```

---

## Deploying to Vercel

### Option A: Deploy Monorepo via Vercel CLI or GitHub
1. Connect your repository to Vercel.
2. The root `vercel.json` automatically configures:
   - Static build for `frontend/`
   - Serverless Node function for `backend/src/server.js`
   - Route rewrites for `/api/(.*)`

### Option B: Deploy Frontend Standalone
1. Set the root directory in Vercel to `frontend`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Set Environment Variable: `VITE_API_BASE_URL` pointing to your deployed backend URL.

---

## Pushing to Your Own GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit of NISHPaksh AI with working 6-image forensic camera pipeline"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

## Items Requiring Manual Setup
1. **Camera Permissions**: When opening the app in a web browser for the first time, click **Allow** when prompted for camera access.
2. **HTTPS for Production**: Modern browsers restrict camera access (`getUserMedia`) to `localhost` or secure origins (`https://`). Ensure your production deployment is served over HTTPS.
