import dotenv from 'dotenv';
import AsyncHandler from "express-async-handler";
import connectGoogleSheet from '../db/sheet.js';
import token from '../Token.js';

dotenv.config();

const ADMIN_SHEET = process.env.ADMIN_SHEET;
const SHEET_ID = process.env.SHEET_ID;


// let doc

//POST /api/admin/login

export const loginAdmin = AsyncHandler( async(req,res) => {
    try{
        console.log("Recieved body:",req.body);

        const doc = await connectGoogleSheet(SHEET_ID);
        const admin_sheet = doc.sheetsByTitle[ADMIN_SHEET];

        const {username, password} = req.body;
        const rows = await admin_sheet.getRows();
        
        const adminRowIndex = rows.findIndex(row => row._rawData[1].trim() === username.trim());

        if (!adminRowIndex) {
            return res.status(401).json({ message: "Invalid username" });
        }

        const adminRow = rows[adminRowIndex];
        console.log("here the adminRow",adminRow);

        if (!(adminRow._rawData[2].trim() === password.trim())){
            return res.status(401).json({ message: "Invalid password" });
        } 

        res.status(201).json({
            admin_id: adminRow._rawData[4],
            name: adminRow._rawData[0],
            username: adminRow._rawData[1],
            password: adminRow._rawData[2],
            image: adminRow._rawData[3],
            token: token(adminRow._rawData[1]),
        });

    }catch(error){
        console.error('Error log in:', error);
        res.status(500).json({ message: 'Login failed'});
    }
})