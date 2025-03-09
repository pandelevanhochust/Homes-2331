import dotenv from 'dotenv';
import AsyncHandler from 'express-async-handler';
import { accessAuditFolder, createSheetinFolder, findSheetinFolder } from '../db/GDrive.js';
import getCurrentWeekTimeframe from '../db/dateConfig.js';
import connectGoogleSheet from '../db/sheet.js';


dotenv.config();

const folderName = process.env.FOLDER_NAME;
const STAFF_SHEET = process.env.STAFF_SHEET;
const ADMIN_SHEET = process.env.ADMIN_SHEET;
const SERVICE_SHEET = process.env.SERVICE_SHEET;
const SHEET_ID = process.env.SHEET_ID;


//POST /api/staff/service/audit/:id
export const auditService = AsyncHandler(async(req,res) => {
    try {
        const {id} = req.params;
        const{service_ID,service,income,revenue} = req.body;
        console.log(req.body);
        let name;
        let percentage;

        const folderID = await accessAuditFolder();

        if (!folderID) {
            return res.status(500).json({ message: "Failed to access or create audit folder" });
        }

        const sheetName = getCurrentWeekTimeframe();

        const sheetID = await findSheetinFolder(folderID,sheetName);
        console.log(sheetID);

        if(!sheetID){
            sheetID = await createSheetinFolder(folderID,sheetName);
        }
        
        const doc = await connectGoogleSheet(sheetID);
        const auditSheet = doc.sheetsByIndex[0];
        const audit_rows = await auditSheet.getRows();
        
        //connect main sheets
        const main_doc = await connectGoogleSheet(SHEET_ID);
        const staffSheet = main_doc.sheetsByTitle[STAFF_SHEET];
        const serviceSheet = main_doc.sheetsByTitle[SERVICE_SHEET];
        const staff_rows = await staffSheet.getRows();
        const service_rows = await serviceSheet.getRows();

        //fetch data
        const serviceIndex = service_rows.findIndex( (row) => parseInt(row._rawData[1]) === parseInt(id) && parseInt(row._rawData[2]) === parseInt(service_ID));
        const staffIndex = staff_rows.findIndex(row => parseInt(row._rawData[0]) === parseInt(id));
        name = staff_rows[staffIndex]._rawData[0];
        percentage = staff_rows[staffIndex]._rawData[3] === "Online" ? "70%" : "55%";
        const rate = staff_rows[staffIndex]._rawData[3] === "Online" ? 0.7 : 0.55;
        const total = revenue * rate;

        service_rows[serviceIndex]._rawData[6] = parseInt(revenue);
        

        const staffRowIndex = audit_rows.findIndex(row => parseInt(row._rawData[0]) === parseInt(id));

        const auditData = {
            "ID": id,
            "Name": name,
            "Service":service,
            "Percentage": percentage,
            "Income": revenue,
            "Total":total,
        }

        if(staffRowIndex){
            const auditRow = audit_rows[staffRowIndex];
            auditRow._rawData[0] = id;
            auditRow._rawData[1] = name;
            auditRow._rawData[2] = revenue;
            auditRow._rawData[3] = service.service;
            auditRow._rawData[6] = percentage;
            auditRow._rawData[7] = total;
        }else{
            await auditSheet.addRow(auditData);
        }

        res.status(200).json({
            message: "Audit folder accessed successfully",
            auditData: auditData,
        });

    }catch(error){
        console.error("Error connecting", error);
        res.status(500).json({message: "Failed to connect google drive"});
    }
});