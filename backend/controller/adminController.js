import dotenv from 'dotenv';
import AsyncHandler from "express-async-handler";
import connectGoogleSheet from '../db/sheet.js';
import token from '../Token.js';

dotenv.config();

const ADMIN_SHEET = process.env.ADMIN_SHEET;

// let doc

//POST /api/admin/login

export const loginAdmin = AsyncHandler( async(req,res) => {
    try{
        console.log("Recieved body:",req.body);

        const doc = await connectGoogleSheet();
        const admin_sheet = doc.sheetsByTitle[ADMIN_SHEET];

        const {username, password} = req.body;
        const rows = await admin_sheet.getRows();
        
        const rowData = rows.map(row => ({
            _id: row._rowNumber,
            name: row._rawData[0] || 'anonymous',
            username: row._rawData[1],
            password: row._rawData[2],
            image: row._rawData[3] || 'none',
        }));

        const admin = rowData.find(row => row.username === username);

        if (!admin) {
            return res.status(401).json({ message: "Invalid username" });
        }
        if (!(password === admin.password)){
            return res.status(401).json({ message: "Invalid password" });
        } 

        res.status(201).json({
            _id: admin._id,
            name: admin.name,
            username: admin.username,
            password: admin.password,
            image: admin.image,
            token: token(admin._id),
        });

    }catch(error){
        console.error('Error log in:', error);
        res.status(500).json({ message: 'Login failed'});
    }
})