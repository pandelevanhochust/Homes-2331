import dotenv from 'dotenv';
import AsyncHandler from 'express-async-handler';
import { formatUSD, formatVND, parseCurrency } from '../db/Currency.js';
import { getCurrentWeekTimeframe } from '../db/dateConfig.js';
import { accessAuditFolder, createSheetinFolder, findSheetinFolder } from '../db/GDrive.js';
import connectGoogleSheet from '../db/sheet.js';

dotenv.config();

const folderName = process.env.FOLDER_NAME;
const STAFF_SHEET = process.env.STAFF_SHEET;
const ADMIN_SHEET = process.env.ADMIN_SHEET;
const SERVICE_SHEET = process.env.SERVICE_SHEET;
const SHEET_ID = process.env.SHEET_ID;
const DEBT_RATE  = process.env.DEBT_RATE;
const EXCHANGE_RATE = process.env.EXCHANGE_RATE;
const SERVICES = process.env.SERVICES?.split(",") || [];


// POST /api/staff/audit/service_id?admin_id
export const auditService = AsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { service, revenue, percentage} = req.body;
    const {admin_id} = req.query;
    console.log("Reach Audit Service",id, admin_id);

    const folderID = await accessAuditFolder();
    if (!folderID) return res.status(500).json({ message: "Failed to access audit folder" });

    const sheetName = `income_${getCurrentWeekTimeframe()}_ADMIN_${admin_id}`;
    let sheetID = await findSheetinFolder(folderID, sheetName);

    if (!sheetID) {
      console.log("CREATE SHEET HERE");
      sheetID = await createSheetinFolder(folderID, sheetName);
    }

    const doc = await connectGoogleSheet(sheetID);
    const auditSheet = doc.sheetsByIndex[0];
    await auditSheet.loadHeaderRow();
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
    if (serviceIndex === -1) return res.status(404).json({ message: "Service not found" });

    const staffIndex = staff_rows.findIndex((row) => parseInt(row._rawData[1]) === parseInt(id) && parseInt(row._rawData[8]) === parseInt(admin_id));
    if (staffIndex === -1) return res.status(404).json({ message: "Staff not found" });

    const name = staff_rows[staffIndex]._rawData[0];
    const rate = parseFloat(parseInt(percentage)/100);
    console.log("Here the rate:", rate);

    const equipmentDebt = parseInt(staff_rows[staffIndex]._rawData[5]) ?? 0;

    service_rows[serviceIndex]._rawData[6] = formatUSD(revenue);

    const staffAuditRowIndex = audit_rows.findIndex(row => row._rawData[0] === name);

    const usdAmount = revenue * rate;
    const vndAmount = usdAmount * 24500;
    
    const formattedRevenue = formatUSD(revenue);
    const formattedTotal = formatUSD(usdAmount);
    const formattedNote = formatVND(vndAmount);
    

    if (staffAuditRowIndex >= 0) {

      let incomeTotal = 0;

      if (equipmentDebt > 0) {
        const deduction = DEBT_RATE * revenue * 24500;
        const remainingDebt = equipmentDebt - deduction;
      
        let updatedDebt;
        if (remainingDebt >= 0) {
          updatedDebt = remainingDebt;
        } else {
          const remainder = Math.abs(remainingDebt);
          updatedDebt = 0;
          incomeTotal += remainder;      
        }
        staff_rows[staffIndex]._rawData[5] = updatedDebt.toFixed(2);
        await staff_rows[staffIndex].save();
      } else {
        console.log("✅ No deduction applied. Equipment debt is already 0.");
      }

      const auditRow = audit_rows[staffAuditRowIndex];
      const newRaw = [...auditRow._rawData];

      const serviceColIndex = header.findIndex(h => h.trim().toLowerCase() === service.service.trim().toLowerCase());
      if (serviceColIndex !== -1) newRaw[serviceColIndex] = formattedRevenue;

      SERVICES.forEach((svc) => {
        const colIdx = header.findIndex(h => h.toLowerCase() === svc.toLowerCase());
        const val = parseCurrency(newRaw[colIdx]);
        if (!isNaN(val)) incomeTotal += val;
      });

      const totalVal = incomeTotal * rate;
      newRaw[header.findIndex(h => h.toLowerCase() === 'percentage')] = `${percentage}%`;
      newRaw[header.findIndex(h => h.toLowerCase() === 'total')] = formatUSD(totalVal);
      newRaw[header.findIndex(h => h.toLowerCase() === 'note')] = formatVND(totalVal);

      staff_rows[staffIndex]._rawData[9] = formatUSD(totalVal);
      await staff_rows[staffIndex].save();

      auditRow._rawData = newRaw;
      await auditRow.save();

    } else {
      const dumpIndex = audit_rows.findIndex(row => row._rawData[0] === '__DUMP__');
      if (dumpIndex === -1) throw new Error("Cannot find placeholder dump row");

      const insertIndex = audit_rows.findIndex((row, idx) =>
        idx < dumpIndex &&
        (!row._rawData[0] || row._rawData[0] === '\u200B')
      );

      if (insertIndex === -1) {
        return res.status(400).json({ message: "No empty row available to insert audit data." });
      }

      const auditRow = audit_rows[insertIndex];
      const newRow = {
        Name: name,
        Percentage: `${percentage}%`,
        Total: formattedTotal,
        Note: formattedNote,
      };

      SERVICES.forEach(svc => {
        newRow[svc] = service.service.toLowerCase() === svc.toLowerCase() ? formattedRevenue : '';
      });

      header.forEach((col, idx) => {
        auditRow._rawData[idx] = newRow[col] ?? '\u200B';
      });

      staff_rows[staffIndex]._rawData[9] = formattedTotal;
      await staff_rows[staffIndex].save();

      await auditRow.save();
    }

    await service_rows[serviceIndex].save();
    res.status(200).json({
      message: "Audit folder accessed successfully",
      auditData: { Name: name, Service: service.service, Revenue: formattedRevenue },
    });
  } catch (error) {
    console.error("Erro: ", error);
    res.status(500).json({ message: "Failed to update data" });
  }
});

// GET /api/staff/audit/:id?offset=0?admin_id
export const getAuditService = AsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {  admin_id, offset=0 } = req.query;

    console.log("here the adminid in AuditService",admin_id);

    const sheetName = `income_${getCurrentWeekTimeframe(parseInt(offset))}_ADMIN_${admin_id}`;
    const folderID = await accessAuditFolder();
    if (!folderID) return res.status(500).json({ message: "Failed to access audit folder" });

    let sheetID = await findSheetinFolder(folderID, sheetName);
    if (!sheetID) sheetID = await createSheetinFolder(folderID, sheetName);

    const doc = await connectGoogleSheet(sheetID);
    const sheet = doc.sheetsByIndex[0];
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    const main_doc = await connectGoogleSheet(SHEET_ID);
    const staffSheet = main_doc.sheetsByTitle[STAFF_SHEET];
    const staff_rows = await staffSheet.getRows();
    const staff = staff_rows.find((row) => parseInt(row._rawData[1]) === parseInt(id) && parseInt(row._rawData[8]) === parseInt(admin_id));
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const staffName = staff._rawData[0].trim();
    const data = rows.find(row => row._rawData[0]?.trim() === staffName);
    const auditData = {};

    if (data){
      sheet.headerValues.forEach((header, index) => {
        auditData[header] = parseCurrency(data._rawData[index]);
      });
    } 
    res.status(200).json(auditData);
  } catch (error) {
    console.error("Error getting audit data:", error);
    res.status(500).json({ message: "Failed to fetch audit data" });
  }
});

//GET /api/staff/audit?admin_id
export const getAudit = AsyncHandler(async (req,res) => {
  const {staff} = req.body;
  const {admin_id} = req.query;

  const sheetName = `income_${getCurrentWeekTimeframe(parseInt(offset))}_ADMIN_${admin_id}`;
  const folderID = await accessAuditFolder();
  if (!folderID) return res.status(500).json({ message: "Failed to access audit folder" });

  let sheetID = await findSheetinFolder(folderID, sheetName);
  if (!sheetID) sheetID = await createSheetinFolder(folderID, sheetName);

})

// POST /api/audit/percentage/:id?admin_id=xxx
export const updatePercentage = AsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id } = req.query;
    const { newPercentage } = req.body;

    if (!newPercentage) {
      return res.status(400).json({ message: "New percentage is required" });
    }

    console.log(`Updating percentage to ${newPercentage}% for staff ${id} (admin ${admin_id})`);

    const main_doc = await connectGoogleSheet(SHEET_ID);
    const staffSheet = main_doc.sheetsByTitle[STAFF_SHEET];
    const serviceSheet = main_doc.sheetsByTitle[SERVICE_SHEET];

    const staff_rows = await staffSheet.getRows();
    const service_rows = await serviceSheet.getRows();

    const staffIndex = staff_rows.findIndex(row => 
      parseInt(row._rawData[1]) === parseInt(id) && parseInt(row._rawData[8]) === parseInt(admin_id)
    );
    if (staffIndex === -1) return res.status(404).json({ message: "Staff not found" });

    // Update staff percentage
    staff_rows[staffIndex]._rawData[7] = parseFloat(newPercentage).toString();
    await staff_rows[staffIndex].save();

    // Access Audit Folder
    const folderID = await accessAuditFolder();
    if (!folderID) return res.status(500).json({ message: "Failed to access audit folder" });

    const sheetName = `income_${getCurrentWeekTimeframe()}_ADMIN_${admin_id}`;
    let sheetID = await findSheetinFolder(folderID, sheetName);

    if (!sheetID) {
      console.log("Creating new audit sheet...");
      sheetID = await createSheetinFolder(folderID, sheetName);
    }

    const audit_doc = await connectGoogleSheet(sheetID);
    const auditSheet = audit_doc.sheetsByIndex[0];
    await auditSheet.loadHeaderRow();
    const audit_rows = await auditSheet.getRows();

    const name = staff_rows[staffIndex]._rawData[0];
    const staffAuditRowIndex = audit_rows.findIndex(row => row._rawData[0]?.trim() === name.trim());

    if (staffAuditRowIndex === -1) {
      return res.status(404).json({ message: "Audit row for staff not found" });
    }

    const auditRow = audit_rows[staffAuditRowIndex];
    const header = auditSheet.headerValues;
    const newRaw = [...auditRow._rawData];

    // Recalculate income and update
    let incomeTotal = 0;
    SERVICES.forEach((svc) => {
      const colIdx = header.findIndex(h => h.toLowerCase() === svc.toLowerCase());
      const val = parseCurrency(newRaw[colIdx]);
      if (!isNaN(val)) incomeTotal += val;
    });

    const rate = parseFloat(newPercentage) / 100;
    const usdAmount = incomeTotal * rate;
    const vndAmount = usdAmount * 24500;

    newRaw[header.findIndex(h => h.toLowerCase() === 'percentage')] = `${newPercentage}%`;
    newRaw[header.findIndex(h => h.toLowerCase() === 'total')] = formatUSD(usdAmount);
    newRaw[header.findIndex(h => h.toLowerCase() === 'note')] = formatVND(vndAmount);

    auditRow._rawData = newRaw;
    await auditRow.save();

    // Also update staff income column if you store income
    staff_rows[staffIndex]._rawData[9] = formatUSD(usdAmount);
    await staff_rows[staffIndex].save();

    res.status(200).json({ message: "✅ Percentage and audit recalculated successfully" });

  } catch (error) {
    console.error("Error in updateStaffPercentageAndAudit:", error);
    res.status(500).json({ message: "Failed to update percentage and recalculate audit" });
  }
});
