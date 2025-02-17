import express from "express";
import { listStaff } from "../controller/staffController";

const router = express.Router();

router.route("/")
    .get(listStaff)
    // .post(createStaff)

// router.route("/:id")
//     .get(getStaff)
//     .put(updateStaff)
//     .delete(deleteStaff);

export default router;