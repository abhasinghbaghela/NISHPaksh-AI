import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import casesRoutes from './routes/casesRoutes.js';
import evidenceRoutes from './routes/evidenceRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with 50mb limit for high-resolution base64 camera frames
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static route to serve uploaded evidence images
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/api/evidence/images', express.static(uploadsPath));

// API Routes
app.use('/api/cases', casesRoutes);
app.use('/api/evidence', evidenceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'NISHPaksh AI Forensic Evidence Engine',
    version: '1.0.0',
    system: {
      device: 'Ready',
      cameraPipeline: 'Active',
      secureVault: 'Operational',
      fslChannel: 'Encrypted'
    }
  });
});

// Root endpoint info
app.get('/', (req, res) => {
  res.json({
    message: 'NISHPaksh AI API Server is running.',
    endpoints: {
      health: '/api/health',
      cases: '/api/cases',
      caseStats: '/api/cases/stats',
      evidenceUpload: 'POST /api/evidence/upload',
      evidenceGet: 'GET /api/evidence/:caseId'
    }
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`[NISHPaksh AI] Backend server listening on http://localhost:${PORT}`);
  console.log(`[NISHPaksh AI] Serving uploads from: ${uploadsPath}`);
});
