import express from 'express';
import { getCases, getCase, createCase, updateCaseStatus, getDashboardStats } from '../controllers/casesController.js';

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/', getCases);
router.get('/:id', getCase);
router.post('/', createCase);
router.patch('/:id', updateCaseStatus);

export default router;
