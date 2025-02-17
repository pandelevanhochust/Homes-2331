import dotenv from 'dotenv';
import AsyncHandler from "express-async-handler";
import { GoogleSpreadsheet } from 'google-spreadsheet';


dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL;
const SHEET_ID =  process.env.SHEET_ID;
const STAFF_SHEET = process.env.STAFF_SHEET;
const ADMIN_SHEET = process.env.ADMIN_SHEET;
const SERVICE_SHEET = process.env.SERVICE_SHEET;

let doc;

const connectGoogleSheet  = async() => {
    if  (!doc){
        doc = new GoogleSpreadsheet(SHEET_ID);
        await doc.useServiceAccountAuth({
            client_email: CLIENT_EMAIL,
            private_key: PRIVATE_KEY,
        });
        
        await doc.loadInfo();
    }
}


//GET api/staff/
export const listStaff = AsyncHandler(async(req,res) => {
    try {

        await connectGoogleSheet();
        
        const staff_sheet = doc.sheetsByTitle(STAFF_SHEET);
        const rows = await staff_sheet.getRows();

        if (!rows || rows.length == 0 ){
            return res.status(404).json( {message: "No staff found"});
        }

        const staff = rows.map((row) => ({
            id: row.id || row._rowNumber,
            name: row.Name,
            image: row.Image,
            service: row.Service,
            username: row.StaffUsername, 
            password: row.StaffPassword,
            income: row.Income,
        }));    
        res.status(200).json(staff);

    } catch(error){
        res.status(500).json("Failed to retrieve data");
    }
});

//POST api/staff
export const createStaff = AsyncHandler(async(req,res) => {

});