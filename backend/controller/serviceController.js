import dotenv from 'dotenv';
import AsyncHandler from 'express-async-handler';
import generateID from '../db/ID.js';
import connectGoogleSheet from '../db/sheet.js';

dotenv.config();

// Replace escaped newlines in the private key
const STAFF_SHEET = process.env.STAFF_SHEET;
const ADMIN_SHEET = process.env.ADMIN_SHEET;
const SERVICE_SHEET = process.env.SERVICE_SHEET;
const SHEET_ID = process.env.SHEET_ID;


//PUT api/staff/:id/service
export const updateService = AsyncHandler(async (req,res) => {
    try {    
        const {id} = req.params;
        const { service_ID,service, username, password, income } = req.body;
        
        const doc = await connectGoogleSheet(SHEET_ID);
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
        const doc = await connectGoogleSheet(SHEET_ID);
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
// havent check duplicate 
export const createService = AsyncHandler(async(req,res ) => {
    try{
        const {id} = req.params;
        const { service, username, password, income } = req.body;     
        console.log(req.body);
        const doc = await connectGoogleSheet(SHEET_ID);
        const serviceSheet = doc.sheetsByTitle[SERVICE_SHEET];

        const service_rows = await serviceSheet.getRows();

        // for(const row of service_rows){
        //     if(parseInt(row._rawData[1]) === parseInt(id) && row._rawData[3] === service){
        //         res.status(404).json({message: "Services already exists"})
        //     }
        // }

        const serviceExists = service_rows.some(
            (row) => String(row._rawData[1]) === String(id) && row._rawData[3]?.toLowerCase() === service.toLowerCase()
          );
      
          if (serviceExists) {
            return res.status(400).json({ message: "Service already exists" });
          }
      

        const staffSheet = doc.sheetsByTitle[STAFF_SHEET];
        const rows = await staffSheet.getRows();
        const staffIndex = rows.findIndex((row) => parseInt(row._rawData[1]) === parseInt(id));

        if (staffIndex === -1) {
            return res.status(404).json({ message: "Staff member not found" });
          }
      
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

        console.log("Service successfully created");
        res.status(200).json({
            message: "Service created successfully!",
            createdService: {
                Name: rows[staffIndex]._rawData[0],
                ID: id,
                Service_ID: generateID(serviceSheet),
                Service: service,
                Username: username,
                Password: password,
                Income: income,    
            }
        });

    }catch(error){
        console.error("Error creating service:", error);
        res.status(500).json({ message: "Failed to create service" });
    }
})
