import dotenv from 'dotenv';
import AsyncHandler from 'express-async-handler';
import connectGoogleSheet from '../db/sheet.js';

dotenv.config();

// Replace escaped newlines in the private key
const STAFF_SHEET = process.env.STAFF_SHEET;
const ADMIN_SHEET = process.env.ADMIN_SHEET;
const SERVICE_SHEET = process.env.SERVICE_SHEET;

// let doc;

// GET api/staff/
export const listStaff = AsyncHandler(async (req, res) => {
    try {
        const doc = await connectGoogleSheet();
        // connect two sheets
        const staffSheet = doc.sheetsByTitle[STAFF_SHEET];
        const serviceSheet = doc.sheetsByTitle[SERVICE_SHEET];

        const staff_rows = await staffSheet.getRows();
        const service_rows = await serviceSheet.getRows();

        if (!staff_rows|| staff_rows.length === 0) {
            return res.status(404).json({ message: 'No staff found' });
        };

        const mapService = {};
        service_rows.forEach((row) => {
            const name = row._rawData[0];
            if (!mapService[name]){
                mapService[name] = [];
            }
            mapService[name].push({
                service: row._rawData[1],
                type: row._rawData[2] || "N/A",
                username: row._rawData[3] || "N/A",
                password: row._rawData[4] || "N/A",
            });
        });

        console.log(service_rows); 

        const staff = staff_rows.map((row) => ({
            _id: row._rowNumber,
            name: row._rawData[0] || 'Unknown',
            image: row._rawData[1] || 'none',
            service: mapService[row._rawData[0]] || "none",
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
 
        const doc = await connectGoogleSheet();
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

//GET api/staff/id

//DELETE 
