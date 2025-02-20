import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const token = (id) => {
    return jwt.sign({id},process.env.secret_key,{
        expiresIn: "90d",
    });
};

export default token;