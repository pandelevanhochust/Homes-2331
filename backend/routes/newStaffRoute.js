import { registerUser,loginUser, listUsers, getMe,getUserById, updateUser,updateStatus, patchEquipment,deleteUser } from "../controller/newStaffController.js";
import { Router } from "express";
import express from "express";

const router = express.Router();

router.post('/', registerUser);        // Register
router.post('/login', loginUser);      // Login

router.get('/', listUsers);   // List users (simple query/filter support)
router.get('/me', getMe);     // Current user profile
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id/status', updateStatus);
router.patch('/:id/equipment', patchEquipment);
router.delete('/:id', deleteUser);

export default router;
