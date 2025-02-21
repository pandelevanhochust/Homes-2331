import AsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

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
    const decoded = jwt.verify(token, process.env.secret_key);
    
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});


export { checkAuth };
