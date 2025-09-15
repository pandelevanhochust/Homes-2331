import express from 'express';
import {
  upsertWeeklyRevenue,
  recalcUserWeekIncome,
} from '../controller/newServiceController.js';

const router = express.Router();

// If services are private to authenticated users, enforce protect.
// You can add role-based checks if needed.
router.post('/:id/weekly', upsertWeeklyRevenue);

// Utility to force recalculation for a specific user & week
router.post('/recalculate', recalcUserWeekIncome);

export default router;
