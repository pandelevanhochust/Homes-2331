import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { errorHandler, notFound } from "./midddleware/errorMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();
console.log(process.env);

if (process.env.NODE_ENV === "development" ){
    app.use(morgan("dev"));
}

app.use(express.json());
app.use("/api/staff",staffRoutes);
app.use("/api/admin",adminRoutes);


app.use(notFound);
app.use(errorHandler);



app.listen(PORT, ()=>{
    console.log('Server is running on port ${PORT}',PORT);
})
