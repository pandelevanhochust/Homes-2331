import cors from "cors";
import dotenv from 'dotenv';
import express from "express";
import morgan from "morgan";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}));

if (process.env.NODE_ENV === "development" ){
    app.use(morgan("dev"));
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
}

app.use(express.json());
app.use("/api/staff",staffRoutes);
app.use("/api/admin",adminRoutes);
// app.use("api/drive").post((req,res) => {
    
// })


app.use(notFound);
app.use(errorHandler);



app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`,PORT);
})
