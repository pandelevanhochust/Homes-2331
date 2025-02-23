import dotenv from 'dotenv';
import AsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import connectGoogleSheet from "../db/sheet.js";

dotenv.config();
const checkAuth = AsyncHandler(async (req, res, next) => {
  const headerAuth = req.headers.authorization;
  console.log(headerAuth);

  // Check if the Authorization header exists and starts with "Bearer"
  if (!headerAuth || !headerAuth.startsWith("Bearer")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const ADMIN_SHEET = process.env.ADMIN_SHEET;
    const doc = await connectGoogleSheet();
    const admin_sheet = doc.sheetsByTitle[ADMIN_SHEET];

    // Extract the token from the header
    const token = headerAuth.split(" ")[1];
    console.log(`create toke ${token}`);

    // Verify the token using the JWT secret
    const decoded = jwt.verify(token, process.env.secret_key);
    console.log("key decrypted",decoded);

    // Fetch data from Google Sheets
    const rows = await admin_sheet.getRows();
    const rowData = rows.map(row => ({
      _id: row._rowNumber,
      name: row._rawData[0] || "anonymous",
      username: row._rawData[1],
      password: row._rawData[2], // Stored hashed password
      image: row._rawData[3] || "none",
    }));

    // Check if the user exists
    const userExists = rowData.find(row => row.username === decoded.id);

    if (!userExists) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
    console.log("admin verified");

    req.user = userExists; // Attach user data to request
    next(); // Proceed to the next middleware
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

export { checkAuth };
