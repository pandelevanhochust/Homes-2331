import express from "express";
import { loginAdmin } from "../controller/adminController.js";

const router = express.Router();

router.route("/login")
    .post(loginAdmin)

export default router