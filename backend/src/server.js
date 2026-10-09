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

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const uploadsPath = path.join(__dirname, '../uploads');
app.use('/api/evidence/images', express.static(uploadsPath));

app.use('/api/cases', casesRoutes);
app.use('/api/evidence', evidenceRoutes);

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

app.listen(PORT, () => {
  console.log(`[NISHPaksh AI] Backend server listening on http://localhost:${PORT}`);
  console.log(`[NISHPaksh AI] Serving uploads from: ${uploadsPath}`);
});