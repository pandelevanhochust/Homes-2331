import express from "express";
import { createStaff, listStaff } from "../controller/staffController.js";

const router = express.Router();

router.route("/")
    .get(listStaff)
    .post(createStaff)

// router.route("/:id")
//     .get(getStaff)
//     .put(updateStaff)
//     .delete(deleteStaff);

export default router;