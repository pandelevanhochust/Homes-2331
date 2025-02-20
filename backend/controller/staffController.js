import dotenv from 'dotenv';
import AsyncHandler from 'express-async-handler';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

dotenv.config();

// Replace escaped newlines in the private key
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL;
const SHEET_ID = process.env.SHEET_ID;
const STAFF_SHEET = process.env.STAFF_SHEET;
const ADMIN_SHEET = process.env.ADMIN_SHEET;
const SERVICE_SHEET = process.env.SERVICE_SHEET;

let doc;

const connectGoogleSheet = async () => {
    if (!doc) {
        const serviceAccountAuth = new JWT({
            email: CLIENT_EMAIL,
            key: PRIVATE_KEY,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        if (!doc.sheetsByTitle[STAFF_SHEET]) {
            throw new Error(`Sheet with title "${STAFF_SHEET}" not found`);
        }
    }
};

// GET api/staff/
export const listStaff = AsyncHandler(async (req, res) => {
    try {
        await connectGoogleSheet();
        const staffSheet = doc.sheetsByTitle[STAFF_SHEET];

        const rows = await staffSheet.getRows();
        console.log('Rows from sheet:', rows); // Debugging

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'No staff found' });
        }

        const staff = rows.map((row) => ({
            id: row.id || row._rowNumber,
            name: row._rawData[0] || 'Unknown',
            image: row._rawData[1] || 'default-image.jpg',
            service: row._rawData[2] || 'Unknown',
            income: row._rawData[3] || 0,
        }));

        res.status(200).json(staff);
    } catch (error) {
        console.error('Error retrieving staff data:', error);
        res.status(500).json({ message: 'Failed to retrieve data' });
    }
});

// POST api/staff
export const createStaff = AsyncHandler(async (req, res) => {
    try {

        console.log("Received body:", req.body);
        const { name, username, password, role, service, image, type } = req.body;

        if (!name || !service || !role) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const sheet =  role === "admin" ?  ADMIN_SHEET : STAFF_SHEET;

        await connectGoogleSheet();
        const staffSheet = doc.sheetsByTitle[sheet];

        if (sheet ===  ADMIN_SHEET){
            await staffSheet.addRow({
                Name: name,
                Username: username,
                Password: password,
                Image: image || 'null',                
            });    
        }else{
            await staffSheet.addRow({
                Name: name,
                Image: image,
                Service: service,
            });

            const serviceSheet = doc.sheetsByTitle[SERVICE_SHEET]; 
            await serviceSheet.addRow({
                Name: name,
                Service: service,
                Type: type,
                Username: username,
                Password: password,
            });
        }
        res.status(201).json({ message: 'Staff created successfully' });
    } catch (error) {
        console.error('Error creating staff:', error);
        res.status(500).json({ message: 'Failed to create staff' });
    }
});
