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

// POST /api/staff/audit/:id
export const auditService = AsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { service, revenue, percentage} = req.body;

    const folderID = await accessAuditFolder();
    if (!folderID) return res.status(500).json({ message: "Failed to access audit folder" });

    const sheetName = `income_${getCurrentWeekTimeframe()}`;
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

    const staffIndex = staff_rows.findIndex((row) => parseInt(row._rawData[1]) === parseInt(id));
    if (staffIndex === -1) return res.status(404).json({ message: "Staff not found" });

    const name = staff_rows[staffIndex]._rawData[0];
    const rate = parseFloat(parseInt(percentage)/100);
    console.log("Here the rate:", rate);

    const equipmentDebt = parseInt(staff_rows[staffIndex]._rawData[5]);

    service_rows[serviceIndex]._rawData[6] = formatUSD(revenue);

    const staffAuditRowIndex = audit_rows.findIndex(row => row._rawData[0] === name);

    const usdAmount = revenue * rate;
    const vndAmount = usdAmount * EXCHANGE_RATE;
    
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

      const serviceColIndex = header.findIndex(h => h.toLowerCase() === service.service.toLowerCase());
      if (serviceColIndex !== -1) newRaw[serviceColIndex] = formattedRevenue;

      // Calculate total
      ['SM', 'Chat', 'Sakura', 'Imlive'].forEach((svc) => {
        const colIdx = header.findIndex(h => h.toLowerCase() === svc.toLowerCase());
        const val = parseCurrency(newRaw[colIdx]);
        if (!isNaN(val)) incomeTotal += val;
      });

      const totalVal = incomeTotal * rate;
      newRaw[header.findIndex(h => h.toLowerCase() === 'percentage')] = `${percentage}%`;
      newRaw[header.findIndex(h => h.toLowerCase() === 'total')] = formatUSD(totalVal);
      newRaw[header.findIndex(h => h.toLowerCase() === 'note')] = formatVND(totalVal);

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
        Percentage: percentage,
        Total: formattedTotal,
        Note: formattedNote,
      };

      ['SM', 'Chat', 'Sakura', 'Imlive'].forEach(svc => {
        newRow[svc] = service.service.toLowerCase() === svc.toLowerCase() ? formattedRevenue : '';
      });

      header.forEach((col, idx) => {
        auditRow._rawData[idx] = newRow[col] ?? '\u200B';
      });

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

// GET /api/staff/audit/:id 
export const getAuditService = AsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { offset = 0 } = req.query;

    const sheetName = `income_${getCurrentWeekTimeframe(parseInt(offset))}`;
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
    const staff = staff_rows.find((row) => parseInt(row._rawData[1]) === parseInt(id));
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
