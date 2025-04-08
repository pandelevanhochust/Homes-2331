import dotenv from 'dotenv';
import AsyncHandler from 'express-async-handler';
import { getCurrentWeekTimeframe } from '../db/dateConfig.js';
import { accessAuditFolder, appendSummaryToSheet, createSheetinFolder, findSheetinFolder } from '../db/GDrive.js';
import connectGoogleSheet from '../db/sheet.js';

dotenv.config();

const folderName = process.env.FOLDER_NAME;
const STAFF_SHEET = process.env.STAFF_SHEET;
const ADMIN_SHEET = process.env.ADMIN_SHEET;
const SERVICE_SHEET = process.env.SERVICE_SHEET;
const SHEET_ID = process.env.SHEET_ID;

//POST /api/staff/audit/:id
export const auditService = AsyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { service, revenue } = req.body;
      console.log(service, revenue);
      let name;
      let percentage;
  
      const folderID = await accessAuditFolder();
      if (!folderID) {
        return res.status(500).json({ message: "Failed to access or create audit folder" });
      }
  
      const sheetName = `income_${getCurrentWeekTimeframe()}`;
      let sheetID = await findSheetinFolder(folderID, sheetName);
  
      if (!sheetID) {
        sheetID = await createSheetinFolder(folderID, sheetName);
      }
  
      const doc = await connectGoogleSheet(sheetID);
      const auditSheet = doc.sheetsByIndex[0];
  
      await auditSheet.loadHeaderRow();
      if (!auditSheet.headerValues || auditSheet.headerValues.length === 0) {
        await auditSheet.setHeaderRow(['Name', 'SM', 'Chat', 'Sakura', 'Imlive', 'Percentage', 'Total', 'Note']);
      }
  
      const header = auditSheet.headerValues;
      const audit_rows = await auditSheet.getRows();
  
      const main_doc = await connectGoogleSheet(SHEET_ID);
      const staffSheet = main_doc.sheetsByTitle[STAFF_SHEET];
      const serviceSheet = main_doc.sheetsByTitle[SERVICE_SHEET];
      const staff_rows = await staffSheet.getRows();
      const service_rows = await serviceSheet.getRows();
  
      const serviceIndex = service_rows.findIndex(
        (row) => parseInt(row._rawData[1]) === parseInt(id) && parseInt(row._rawData[2]) === parseInt(service.service_ID)
      );
      if (serviceIndex === -1) {
        return res.status(404).json({ message: "Service not found" });
      }
  
      const staffIndex = staff_rows.findIndex((row) => parseInt(row._rawData[1]) === parseInt(id));
      if (staffIndex === -1) {
        return res.status(404).json({ message: "Staff not found" });
      }
  
      name = staff_rows[staffIndex]._rawData[0];
      percentage = staff_rows[staffIndex]._rawData[3] === "Online" ? "70%" : "55%";
      const rate = staff_rows[staffIndex]._rawData[3] === "Online" ? 0.7 : 0.55;
  
      service_rows[serviceIndex]._rawData[6] = parseInt(revenue);
  
      const staffAuditRowIndex = audit_rows.findIndex(row => row._rawData[0] === name);
  
      if (staffAuditRowIndex >= 0) {
        const auditRow = audit_rows[staffAuditRowIndex];
        const newRaw = [...auditRow._rawData];
  
        // Cập nhật thu nhập theo tên dịch vụ
        const serviceColIndex = header.findIndex(h => h.toLowerCase() === service.service.toLowerCase());
        if (serviceColIndex !== -1) {
          newRaw[serviceColIndex] = revenue;
        }
  
        // Tính tổng
        let incomeTotal = 0;
        ['SM', 'Chat', 'Sakura', 'Imlive'].forEach((svc) => {
          const colIdx = header.findIndex(h => h.toLowerCase() === svc.toLowerCase());
          const val = parseFloat(newRaw[colIdx]);
          if (!isNaN(val)) incomeTotal += val;
        });
  
        const percentageIndex = header.findIndex(h => h.toLowerCase() === 'percentage');
        const totalIndex = header.findIndex(h => h.toLowerCase() === 'total');
  
        newRaw[percentageIndex] = percentage;
        newRaw[totalIndex] = incomeTotal * rate;
  
        auditRow._rawData = newRaw;
        await auditRow.save();
      } else {
        const auditData = {
          Name: name,
          SM: service.service.toLowerCase() === 'sm' ? revenue : '',
          Chat: service.service.toLowerCase() === 'chat' ? revenue : '',
          Sakura: service.service.toLowerCase() === 'sakura' ? revenue : '',
          Imlive: service.service.toLowerCase() === 'imlive' ? revenue : '',
          Percentage: percentage,
          Total: revenue * rate,
          Note: '',
        };
        await auditSheet.addRow(auditData);
      }
  
      await service_rows[serviceIndex].save();

      await appendSummaryToSheet(auditSheet);
      console.log("Adding footer successfully");
  
      res.status(200).json({
        message: "Audit folder accessed successfully",
        auditData: { Name: name, Service: service.service, Revenue: revenue },
      });
    } catch (error) {
      console.error("Erro: ", error);
      res.status(500).json({ message: "Failed to update data" });
    }
  });

//GET /api/staff/audit/:id
export const getAuditService = AsyncHandler(async (req, res) => {
  try {
    console.log(req);
    const { id } = req.params;
    const { offset = 0,serviceID } = req.query;

    const sheetName = `income_${getCurrentWeekTimeframe(parseInt(offset))}`;

    const folderID = await accessAuditFolder();
    if (!folderID) {
      return res.status(500).json({ message: "Failed to access or create audit folder" });
    }

    let sheetID = await findSheetinFolder(folderID, sheetName);
    if (!sheetID) {
      sheetID = await createSheetinFolder(folderID, sheetName);
    }
    
    //Audit Sheet
    const doc = await connectGoogleSheet(sheetID);
    const sheet = doc.sheetsByIndex[0];
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    //StaffSheet
    const main_doc = await connectGoogleSheet(SHEET_ID);
    const staffSheet = main_doc.sheetsByTitle[STAFF_SHEET];
    const staff_rows = await staffSheet.getRows();
    const staff = staff_rows.find((row) => parseInt(row._rawData[1]) === parseInt(id));
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const serviceSheet = main_doc.sheetsByTitle[SERVICE_SHEET];
    const service_rows = await serviceSheet.getRows();
    const serviceRowIndex = service_rows.findIndex( (row) => parseInt(row._rawData[1]) === parseInt(id) && parseInt(row._rawData[2]) === parseInt(serviceID));
    if (serviceRowIndex === -1) {
        return res.status(404).json({ message: "Service not found for the given staff member." });
    }

    const service_name = service_rows[serviceRowIndex]._rawData[3].trim();

    const staffName = staff._rawData[0].trim();

    const data = rows.find(row => row._rawData[0]?.trim() === staffName);

    if (!data) {
      return res.status(404).json({ message: "Audit data not found" });
    }

    // Prepare clean object (avoid circular structure)
    const cleanData = {};
    sheet.headerValues.forEach((header, index) => {
      cleanData[header] = data._rawData[index];
    });

    console.log("Here is the clean data", cleanData);
    res.status(200).json({ auditData: cleanData });
  } catch (error) {
    console.error("Error getting audit data:", error);
    res.status(500).json({ message: "Failed to fetch audit data" });
  }
});

  
