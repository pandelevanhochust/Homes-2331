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
                name: name,
                service: row._rawData[1],
                username: row._rawData[2] || "N/A",
                password: row._rawData[3] || "N/A",
                income: row._rawData[4] || "N/A",
            });
        });

        console.log(mapService); 

        const staff = staff_rows.map((row) => ({
            _id: row._rowNumber,
            name: row._rawData[0] || 'Unknown',
            image: row._rawData[1] || 'none',
            type: row._rawData[2] || 'N\A',
            equipment: row._rawData[3] || 'none',
            equipmentDebt: row._rawData[4] || 'none',
            note : row._rawData[5] || 'none',
            service: mapService[row._rawData[0]] || [],
        }));

        console.log(staff)

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

        if (!name || !role) {
            return res.status(400).json({ message: 'Missing required fields: name and role are required' });
        }

        // Chỉ chấp nhận "online" hoặc "offline" cho staff type
        if (role === "staff" && type !== "online" && type !== "offline") {
            return res.status(400).json({ message: "Invalid type. Staff type must be either 'online' or 'offline'." });
        }

        const sheet = role === "admin" ? ADMIN_SHEET : STAFF_SHEET;
        const doc = await connectGoogleSheet();
        const staffSheet = doc.sheetsByTitle[sheet];

        if (role === "admin") {
            await staffSheet.addRow({
                Name: name,
                Username: username,
                Password: password,
                Image: image || 'none',
            });
        } else {
            await staffSheet.addRow({
                Name: name,
                Image: image || 'none',
                Type: type,
            });

            const serviceSheet = doc.sheetsByTitle[SERVICE_SHEET];
            await serviceSheet.addRow({
                Name: name,
                Service: service || "none",
                Type: type,
                Username: username || "N/A",
                Password: password || "N/A",
            });
        }

        res.status(201).json({ message: 'Staff created successfully' });
    } catch (error) {
        console.error('Error creating staff:', error);
        res.status(500).json({ message: 'Failed to create staff' });
    }
});

// PUT api/staff/update
export const updateStaff = AsyncHandler(async (req, res) => {
    try {
        const { _id, name, image, type, equipment, equipmentDebt, note } = req.body;

        // Connect to Google Sheet
        const doc = await connectGoogleSheet();
        const staffSheet = doc.sheetsByTitle[STAFF_SHEET];
        const rows = await staffSheet.getRows(); // Load all rows

        // Find the row index by _id (which is actually _rowNumber in Sheets)
        const staffRowIndex = rows.findIndex(row => row._rowNumber === parseInt(_id));

        if (staffRowIndex === -1) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        const staffRow = rows[staffRowIndex];
        console.log("here the staffRow", staffRow);

        // Update only if values have changed
        if (staffRow._rawData[0] !== name){

            const serviceSheet = doc.sheetsByTitle[SERVICE_SHEET];
            const service_rows = await serviceSheet.getRows();
            
            for (const serviceRow of service_rows) {
                if (serviceRow._rawData[0] === staffRow._rawData[0]) {
                    serviceRow._rawData[0] = name; 
                    await serviceRow.save(); 
                }
            }

            staffRow._rawData[0] = name;
        }; 

        if (staffRow._rawData[1] !== image) staffRow._rawData[1] = image;
        if (staffRow._rawData[2] !== type) staffRow._rawData[2] = type;
        if (staffRow._rawData[3] !== equipment) staffRow._rawData[3] = equipment;
        if (staffRow._rawData[4] !== equipmentDebt) staffRow._rawData[4] = equipmentDebt;
        if (staffRow._rawData[5] !== note) staffRow._rawData[5] = note;
        
        // Save changes to Google Sheets
        await staffRow.save(); 

        console.log("Staff updated successfully!");

        res.status(200).json({
            message: "Staff updated successfully",
            updatedData: {
                _id: staffRow._rowNumber,
                name: staffRow._rawData[0],
                image: staffRow._rawData[1],
                type: staffRow._rawData[2],
                equipment: staffRow._rawData[3],
                equipmentDebt: staffRow._rawData[4],
                note: staffRow._rawData[5],
            },
        });

    } catch (error) {
        console.error("Error updating staff:", error);
        res.status(500).json({ message: "Failed to update staff" });
    }
}); 

//PUT api/staff/service
export const updateService = AsyncHandler(async (req,res) => {
    try {
        
        const {name,service,username,password,income} = req.body;
        const doc = await connectGoogleSheet();
        const serviceSheet = doc.sheetsByTitle[SERVICE_SHEET];
        const rows = await serviceSheet.getRows();
        
        let serviceUpdated = false;

        for (const serviceRow of rows) {
            if (serviceRow._rawData[0] === name && serviceRow._rawData[1] === service) {
                if(serviceRow._rawData[1] !== service) serviceRow._rawData[1] = service;
                if(serviceRow._rawData[2] !== username) serviceRow._rawData[2] = username;
                if(serviceRow._rawData[3] !== password) serviceRow._rawData[3] = password;
                if(serviceRow._rawData[4] !== income) serviceRow._rawData[4] = income;
                
                await serviceRow.save();
                serviceUpdated = true;
            } 
        }

        if (!serviceUpdated) {
            return res.status(404).json({ message: "Service not found for the given staff member." });
        }

        console.log("Service successfully updated");
        res.status(200).json({
            name: name,
            service: service,
            username: username,
            password: password,
            income: income,});
    }catch(error){
        console.error("Error updating service:", error);
        res.status(500).json({ message: "Failed to update service" });
    }    
});