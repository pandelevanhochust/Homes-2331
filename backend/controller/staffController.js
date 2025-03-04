import dotenv from 'dotenv';
import AsyncHandler from 'express-async-handler';
import generateID from '../db/ID.js';
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
            const id = row._rawData[1];
            if (!mapService[id]){
                mapService[id] = [];
            }
            mapService[id].push({
                id: id,
                service_ID: row._rawData[2],
                service: row._rawData[3],
                username: row._rawData[4] || "N/A",
                password: row._rawData[5] || "N/A",
                income: row._rawData[6] || "N/A",
            });
        });

        // console.log(mapService); 

        const staff = staff_rows.map((row) => ({
            _id: row._rowNumber,
            name: row._rawData[0] || 'Unknown',
            id :  row._rawData[1],
            image: row._rawData[2] || 'none',
            type: row._rawData[3] || 'N\A',
            equipment: row._rawData[4] || 'none',
            equipmentDebt: row._rawData[5] || 'none',
            note : row._rawData[6] || 'none',
            service: mapService[row._rawData[1]] || [],
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
        const { name, username, password, role, service, image, type} = req.body;

        if (!name || !role) {
            return res.status(400).json({ message: 'Missing required fields: name and role are required' });
        }

        const doc = await connectGoogleSheet();
        const staffSheet = doc.sheetsByTitle[STAFF_SHEET];
        const serviceSheet = doc.sheetsByTitle[SERVICE_SHEET];
        const adminSheet = doc.sheetsByTitle[ADMIN_SHEET];

        if (role === "admin") {
            const id = await generateID(adminSheet);

            await staffSheet.addRow({
                Name: name,
                Username: username,
                Password: password,
                Image: image || 'none',
                ID: id,
            });
        } else {
            const id = await generateID(staffSheet);
            await staffSheet.addRow({
                Name: name,
                ID: id,
                Image: image || 'none',
                Type: type,
            });
            
            const service_id = await generateID(serviceSheet);
            await serviceSheet.addRow({
                Name: name,
                ID: id,
                Service_ID: service_id,
                Service: service || "none",
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

// PUT api/staff/:id
export const updateStaff = AsyncHandler(async (req, res) => {
    try {
        const { _id, name, image, type, equipment, equipmentDebt, note} = req.body;
        const {id} = req.params;

        // Connect to Google Sheet
        const doc = await connectGoogleSheet();
        const staffSheet = doc.sheetsByTitle[STAFF_SHEET];
        const rows = await staffSheet.getRows();
        const staffRowIndex = rows.findIndex(row => parseInt(row._rawData[1]) === parseInt(id));

        if (staffRowIndex === -1) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        const staffRow = rows[staffRowIndex];

        // Update only if values have changed
        if (staffRow._rawData[0] !== name){
            const serviceSheet = doc.sheetsByTitle[SERVICE_SHEET];
            const service_rows = await serviceSheet.getRows();
            
            for (const serviceRow of service_rows) {
                if (serviceRow._rawData[1] === id) {
                    serviceRow._rawData[0] = name; 
                    await serviceRow.save(); 
                }
            }
            staffRow._rawData[0] = name;
        }; 

        if (staffRow._rawData[2] !== image) staffRow._rawData[2] = image;
        if (staffRow._rawData[3] !== type) staffRow._rawData[3] = type;
        if (staffRow._rawData[4] !== equipment) staffRow._rawData[4] = equipment;
        if (staffRow._rawData[5] !== equipmentDebt) staffRow._rawData[5] = equipmentDebt;
        if (staffRow._rawData[6] !== note) staffRow._rawData[6] = note;
        
        // Save changes to Google Sheets
        await staffRow.save(); 

        console.log("Staff updated successfully!");

        res.status(200).json({
            message: "Staff updated successfully",
            updatedData: {
                _id: staffRow._rowNumber,
                name: staffRow._rawData[0],
                image: staffRow._rawData[2],
                type: staffRow._rawData[3],
                equipment: staffRow._rawData[4],
                equipmentDebt: staffRow._rawData[5],
                note: staffRow._rawData[6],
                id: id,
            },
        });

    } catch (error) {
        console.error("Error updating staff:", error);
        res.status(500).json({ message: "Failed to update staff" });
    }
}); 

//GET api/staff/:id
export const getStaffDetail = AsyncHandler(async(req,res) => {
    try{
        const {id} = req.params;

        const doc = await connectGoogleSheet();
        const staffSheet = doc.sheetsByTitle[STAFF_SHEET];
        const serviceSheet = doc.sheetsByTitle[SERVICE_SHEET];

        const staff_rows = await staffSheet.getRows();
        const service_rows = await serviceSheet.getRows();

        if (!staff_rows|| staff_rows.length === 0) {
            return res.status(404).json({ message: 'No staff found' });
        };
        
        console.log(staff_rows);
        const staffRowIndex = staff_rows.findIndex(row => parseInt(row._rawData[1]) === parseInt(id));

        if (staffRowIndex === -1) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        const staffRow = staff_rows[staffRowIndex];
        console.log("here the staffRow", staffRow);

        const mapService = {};
        service_rows.forEach((row) => {
            if (row._rawData[1] === id){
                if (!mapService[id]) mapService[id] = []; 
                mapService[id].push({
                    id: id,
                    service_ID: row._rawData[2],
                    service: row._rawData[3],
                    username: row._rawData[4] || "N/A",
                    password: row._rawData[5] || "N/A",
                    income: row._rawData[6] || "N/A",
                });
        }});

        res.status(200).json({
            _id: staffRow._rowNumber,
            name: staffRow._rawData[0] || 'Unknown',
            image: staffRow._rawData[2] || 'none',
            type: staffRow._rawData[3] || 'N\A',
            equipment: staffRow._rawData[4] || 'none',
            equipmentDebt: staffRow._rawData[5] || 'none',
            note : staffRow._rawData[6] || 'none',
            id :  staffRow._rawData[1],
            service: mapService[staffRow._rawData[1]] || [],
        });

    }catch(error){
        console.error("Error getting staff detail:", error);
        res.status(500).json({ message: "Failed to get staff detail" });
    }
})

//PUT api/staff/:id/service
export const updateService = AsyncHandler(async (req,res) => {
    try {    
        const {id} = req.params;
        const { service_ID,service, username, password, income } = req.body;
        const doc = await connectGoogleSheet();
        const serviceSheet = doc.sheetsByTitle[SERVICE_SHEET];
        const rows = await serviceSheet.getRows();
        
        const rowIndex = rows.findIndex( (row) => parseInt(row._rawData[1]) === parseInt(id) && parseInt(row._rawData[2]) === parseInt(service_ID));

        if (rowIndex === -1) {
            return res.status(404).json({ message: "Service not found for the given staff member." });
        }

        const serviceRow = rows[rowIndex];

        serviceRow._rawData[3] = service;
        serviceRow._rawData[4] = username;
        serviceRow._rawData[5] = password;
        serviceRow._rawData[6] = income;

        await serviceRow.save();

        console.log("Service successfully updated");
        res.status(200).json({
            id: id,
            service_ID: service_ID,
            service: service,
            username: username,
            password: password,
            income: income,});
    }catch(error){
        console.error("Error updating service:", error);
        res.status(500).json({ message: "Failed to update service" });
    }    
});

//DELETE api/staff/service
export const deleteService = AsyncHandler(async(req,res ) => {
    try{
        const {id} = req.params;
        const { service_ID,service, username, password, income } = req.body;
        const doc = await connectGoogleSheet();
        const serviceSheet = doc.sheetsByTitle[SERVICE_SHEET];
        const rows = await serviceSheet.getRows();

        const rowIndex = rows.findIndex( (row) => parseInt(row._rawData[1]) === parseInt(id) && parseInt(row._rawData[2]) === parseInt(service_ID));

        if (rowIndex === -1) {
            return res.status(404).json({ message: "Service not found for the given staff member." });
        }

        await rows[rowIndex].delete();

        console.log("Service successfully deleted");
        res.status(200).json({
            message: "Service deleted successfully!",
            deletedRow: {service_ID,service, username, password, income},
        });

    }catch(error){
        console.error("Error deleting service:", error);
        res.status(500).json({ message: "Failed to delete service" });
    }
})

//POST api/staff/service
export const createService = AsyncHandler(async(req,res ) => {
    try{
        const {id} = req.params;
        const { service, username, password, income } = req.body;     
        console.log(req.body);
        const doc = await connectGoogleSheet();
        const serviceSheet = doc.sheetsByTitle[SERVICE_SHEET];

        const staffSheet = doc.sheetsByTitle[STAFF_SHEET];
        const rows = await staffSheet.getRows();
        const staffIndex = rows.findIndex((row) => parseInt(row._rawData[1]) === parseInt(id));
        const serviceID = await generateID(serviceSheet);

        await serviceSheet.addRow({
            Name: rows[staffIndex]._rawData[0],
            ID: id,
            Service_ID: serviceID,
            Service: service,
            Username: username,
            Password: password,
            Income: income,
        })

        console.log("Service successfully deleted");
        res.status(200).json({
            message: "Service deleted successfully!",
            Name: rows[staffIndex]._rawData[0],
            ID: id,
            Service_ID: generateID(serviceSheet),
            Service: service,
            Username: username,
            Password: password,
            Income: income,
        });

    }catch(error){
        console.error("Error deleting service:", error);
        res.status(500).json({ message: "Failed to delete service" });
    }
})

