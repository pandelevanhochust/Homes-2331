import AsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const checkAuth = AsyncHandler(async (req, res, next) => {
  const headerAuth = req.headers.authorization;
  // Check if the Authorization header exists and starts with "Bearer"
  if (!headerAuth || !headerAuth.startsWith("Bearer")) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
  try {
    // Extract the token from the header
    const token = headerAuth.split(" ")[1];

    // Verify the token using the JWT secret (use environment variable for security)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the database and exclude the password field
    req.user = await User.findById(decoded.id).select("-password");

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

const checkAdmin = (req,res,next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as admin");
  }
};

export { checkAdmin, checkAuth };
