import express from 'express';
import {
  createService,
  listServices,
  getService,
  updateService,
  upsertWeeklyRevenue,
  deleteService,
  recalcUserWeekIncome,
} from '../controller/newServiceController.js';

const router = express.Router();

// If services are private to authenticated users, enforce protect.
// You can add role-based checks if needed.
router.post('/', createService);
router.get('/', listServices);
router.get('/:id', getService);
router.put('/:id', updateService);
router.post('/:id/weekly', upsertWeeklyRevenue);
router.delete('/:id', deleteService);

// Utility to force recalculation for a specific user & week
router.post('/recalculate', recalcUserWeekIncome);

export default router;
