import express from "express";
import { createStaff, listStaff, updateService, updateStaff } from "../controller/staffController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(listStaff)
    .post(checkAuth,createStaff)

router.route("/update")
    .put(checkAuth,updateStaff)

router.route("/service")
    .put(checkAuth,updateService)
    // .post(checkAuth,addService)

// router.route("/delete/:id")
//     .delete(checkAuth,deleteStaff)

// router.route("/:id")
//     .get(getStaff)
//     .put(updateStaff)
//     .delete(deleteStaff);

export default router;