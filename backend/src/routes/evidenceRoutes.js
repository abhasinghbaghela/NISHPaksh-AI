import express from 'express';
import { uploadEvidencePackage, getEvidenceByCaseId } from '../controllers/evidenceController.js';
import { evidenceUploadFields } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Support both multipart file uploads and JSON Base64 uploads
router.post('/upload', evidenceUploadFields, uploadEvidencePackage);
router.get('/:caseId', getEvidenceByCaseId);

export default router;
