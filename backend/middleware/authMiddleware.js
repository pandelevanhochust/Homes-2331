import dotenv from 'dotenv';
import AsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import connectGoogleSheet from "../db/sheet.js";

dotenv.config();

const SHEET_ID = process.env.SHEET_ID;

const checkAuth = AsyncHandler(async (req, res, next) => {
  const headerAuth = req.headers.authorization;
  console.log(headerAuth);

  if (!headerAuth || !headerAuth.startsWith("Bearer")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const ADMIN_SHEET = process.env.ADMIN_SHEET;
    const doc = await connectGoogleSheet(SHEET_ID);
    const admin_sheet = doc.sheetsByTitle[ADMIN_SHEET];

    const token = headerAuth.split(" ")[1];
    console.log(`create toke ${token}`);

    const decoded = jwt.verify(token, process.env.secret_key);
    console.log("key decrypted",decoded);

    const rows = await admin_sheet.getRows();
    const rowData = rows.map(row => ({
      _id: row._rowNumber,
      name: row._rawData[0] || "anonymous",
      username: row._rawData[1],
      password: row._rawData[2], 
      image: row._rawData[3] || "none",
    }));

    const userExists = rowData.find(row => row.username === decoded.id);

    if (!userExists) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
    console.log("admin verified");

    req.user = userExists;
    next(); 
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

export { checkAuth };
