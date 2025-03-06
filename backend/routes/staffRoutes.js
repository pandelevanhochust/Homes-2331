import express from "express";
import { createService, deleteService, updateService } from "../controller/serviceController.js";
import { createStaff, getStaffDetail, listStaff, updateStaff } from "../controller/staffController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(listStaff)
    .post(checkAuth,createStaff)

router.route("/update")
    

router.route("/service/:id")
    .put(checkAuth,updateService)
    .delete(checkAuth,deleteService)
    .post(checkAuth,createService)

// router.route("/equipment/:id")
//     .put(checkAuth,)

// router.route("/delete/:id")
//     .delete(checkAuth,deleteStaff)

router.route("/:id")
    .get(checkAuth,getStaffDetail)
    .put(checkAuth,updateStaff)
//     .put(updateStaff)
//     .delete(deleteStaff);

export default router;