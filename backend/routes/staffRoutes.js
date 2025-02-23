import express from "express";
import { createStaff, listStaff } from "../controller/staffController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(listStaff)
    .post(checkAuth,createStaff);

router.route("/edit").
    put()

// router.route("/:id")
//     .get(getStaff)
//     .put(updateStaff)
//     .delete(deleteStaff);

export default router;