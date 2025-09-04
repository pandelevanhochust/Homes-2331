import dotenv from 'dotenv';
import { JWT } from "google-auth-library";
import { google } from "googleapis";
import connectGoogleSheet from './sheet.js';


dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL;
const AUDIT_FOLDER = process.env.FOLDER_NAME;
const SERVICES = process.env.SERVICES?.split(",") || [];
const IMAGE_FOLDER = null;

console.log(SERVICES);

const STAFF_ROW_COUNT = 150;
const RETRY_ATTEMPTS = 10;
const RETRY_DELAY_MS = 20000;

//Align Cells
export const centerAlignSheetCells = async (sheet) => {
    const rowCount = 50;
    const colCount = sheet.headerValues.length;
  
    await sheet.updateCells({
      startRowIndex: 0,
      endRowIndex: rowCount,
      startColumnIndex: 0,
      endColumnIndex: colCount,
      fields: '*',
      cellData: Array.from({ length: rowCount }, () => ({
        values: Array.from({ length: colCount }, () => ({
          userEnteredFormat: {
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
          },
        })),
      })),
    });
  };

//Delay Function  
const waitForSheetReady = async (sheetID) => {
    for (let i = 0; i < RETRY_ATTEMPTS; i++) {
      try {
        const doc = await connectGoogleSheet(sheetID);
        await doc.loadInfo();
        return doc;
      } catch (error) {
        if (i === RETRY_ATTEMPTS - 1) {
          throw new Error(`Sheet not ready after ${RETRY_ATTEMPTS} attempts: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  };
  

export const serviceAccountAuth = () =>
    google.drive({
        version: "v3",
        auth: new JWT({
            email: CLIENT_EMAIL,
            key: PRIVATE_KEY,
            scopes: ["https://www.googleapis.com/auth/drive",'https://www.googleapis.com/auth/spreadsheets'],
        }),
    });

// Find Folder
const findFolder = async (folderName) => {
    try {
        const drive =  serviceAccountAuth();

        const response = await drive.files.list({
            q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
            fields: "files(id, name)",
            spaces: "drive",
        });

        if (response.data.files.length > 0) {
            console.log(`Folder "${folderName}" found with ID: ${response.data.files[0].id}`);
            return response.data.files[0].id;
        } else {
            console.log(`Folder "${folderName}" does not exist.`);
            return null;
        }
    } catch (error) {
        console.error("Error finding folder:", error);
    }
};

// Access Folder
const accessFolder = async (folderName) => {
    try {
        const existingFolderId = await findFolder(folderName);

        if (existingFolderId) {
            return existingFolderId;
        }

        console.log(`Creating folder: ${folderName}`);
        const drive = serviceAccountAuth();
        const fileMetadata = {
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
        };

        const response = drive.files.create({
            resource: fileMetadata,
            fields: "id",
        });

        console.log(`Folder created with ID: ${response.data.id}`);
        return response.data.id;
    } catch (error) {
        console.error("Error accessing folder:", error);
    }
};

export const accessAuditFolder = async () => {
    const folderID =  await accessFolder(AUDIT_FOLDER);
    if(!folderID){
        return null;
    }
    return folderID;
}

export const accessImageFolder = async () => {
    const folderID = await accessFolder(IMAGE_FOLDER);
    if(!folderID){
      return null;
    }
    return folderID;
}

//Upload File to Drive
export const uploadImagetoDrive = async (filePath,fileName,folderID) => {
  try {
    const drive = serviceAccountAuth();

    const fileMetadata = {
      name: fileName,
      parents: [folderID],
    }

    const media = {
      mimeType: "image/jpeg",
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id, webViewLink, webContentLink",
    });

    // await drive.permissions.create({
    //   fileId: response.data.id,
    //   requestBody: {
    //   role: "reader",
    //   type: "anyone",
    //   },
    // });
    
    console.log("File uploaded:", response.data);
    return response.data;

  } catch (error) {
    console.error("Error uploading image to Drive:", error);
    return null;
    }
}

//Create googleSheets
export const createSheetinFolder = async (folderId, sheetTitle, rate = '24.5') => {
    const drive = serviceAccountAuth();
    let sheetID = null;
    const zeroWidth = '\u200B'; // zero-width space
  
    try {
      // Step 1: Create the Sheet
      const fileMetadata = {
        name: sheetTitle,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: [folderId],
      };
  
      const file = await drive.files.create({
        resource: fileMetadata,
        fields: 'id',
      });
  
      sheetID = file.data.id;
      console.log(`✅ Sheet created: ${sheetID}`);
  
      const doc = await waitForSheetReady(sheetID);
      const sheet = doc.sheetsByIndex[0];
  
      const headerRow = ['Name', ...SERVICES, 'Percentage', 'Total', 'Note'];
      await sheet.setHeaderRow(headerRow);
  
      const placeholderRow = Object.fromEntries(headerRow.map(col => [col, zeroWidth]));
      const placeholderRows = Array(STAFF_ROW_COUNT - 1).fill(placeholderRow);
  
      const dumpRow = Object.fromEntries(headerRow.map(col => [col, zeroWidth]));
      dumpRow['Name'] = '__DUMP__';
  
      await sheet.addRows([...placeholderRows, dumpRow]);
  
      const startRow = STAFF_ROW_COUNT + 2; // Header + 50 rows + 1
      const totalCol = String.fromCharCode(65 + headerRow.length - 2); // Total column
      const noteCol = String.fromCharCode(65 + headerRow.length - 1); // Note column
      const colRef = (index) => String.fromCharCode(66 + index); // B, C, D...
  
      const footerRows = [
        {
          Name: 'Total',
          ...Object.fromEntries(
            SERVICES.map((svc, i) => [
                svc, `=TEXT(SUM(${colRef(i)}2:${colRef(i)}${STAFF_ROW_COUNT + 1}), "$#,##0.00")`])
          ),
          Total: `=TEXT(SUM(${totalCol}2:${totalCol}${STAFF_ROW_COUNT + 1}), "$#,##0.00")`,
          Note: `=TEXT(SUM(${noteCol}2:${noteCol}${STAFF_ROW_COUNT + 1}), "#,##0 \"đ\"")`,        },
        {
          Name: 'Kế Toán',
          Percentage: '1%',
          Total: `=${totalCol}${startRow}*0.01`,
          Note: `=${noteCol}${startRow}*0.01`,
        },
        {
          Name: 'Tech',
          Percentage: '1%',
          Total: `=${totalCol}${startRow}*0.01`,
          Note: `=${noteCol}${startRow}*0.01`,
        },
        {
          Name: 'Trợ lý',
          Percentage: '0%',
          Total: `=${totalCol}${startRow}*0`,
          Note: `=${noteCol}${startRow}*0`,
        },
        {
          Name: 'Grand total',
          Total: `=${totalCol}${startRow}+${totalCol}${startRow + 1}+${totalCol}${startRow + 2}`,
          Note: `=${noteCol}${startRow}+${noteCol}${startRow + 1}+${noteCol}${startRow + 2}`,
        },
        {
          Name: 'Boss',
          Percentage: '10%',
          Total: `=${totalCol}${startRow + 3}*0.1`,
          Note: `=${noteCol}${startRow + 3}*0.1`,
        },
      ];
  
      await sheet.addRows(footerRows);
  
      // Step 6: Style headers & footers
      await sheet.loadCells(`A1:${noteCol}${startRow + footerRows.length}`);
  
      // Style header
      for (let col = 0; col < headerRow.length; col++) {
        const cell = sheet.getCell(0, col);
        cell.textFormat = { bold: true };
        cell.horizontalAlignment = 'CENTER';
      }
  
      // Style footer labels
      for (let i = 0; i < footerRows.length; i++) {
        const cell = sheet.getCell(startRow - 1 + i, 0);
        cell.textFormat = { bold: true };
      }
  
      // Optional: style dump row as gray
      const dumpCell = sheet.getCell(STAFF_ROW_COUNT, 0); // A51
      dumpCell.textFormat = { foregroundColorStyle: { rgbColor: { red: 0.6, green: 0.6, blue: 0.6 } } };
  
      await sheet.saveUpdatedCells();
  
      console.log('✅ Template created with 50 placeholder rows, footer, and styling');
      return sheetID;
    } catch (error) {
      console.error('❌ Error creating sheet:', error.message);
      if (sheetID) {
        try {
          await drive.files.delete({ fileId: sheetID });
          console.warn(`🧹 Deleted broken sheet: ${sheetID}`);
        } catch (delErr) {
          console.error('❌ Cleanup failed:', delErr.message);
        }
      }
      throw error;
    }
  };

export const findSheetinFolder = async(folderId,sheetName) => {
    try{
        const drive = serviceAccountAuth();
        const respone = await drive.files.list({
            q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and name='${sheetName}'`,
            fields: "files(id, name)",
            spaces: "drive",    
        });
    
        console.log(respone);
    
        if(respone.data.files.length > 0){
            return respone.data.files[0].id;
        }else{
            return null;
        }
    }catch(error){
        console.error("Error searching for sheet:", error);
        throw new Error("Failed to search for sheet in folder");
    }
}

// Append dynamic summary block
export const appendSummaryToSheet = async (sheet) => {
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    const header = sheet.headerValues;

    // Step 1: Remove old summary rows
    const summaryStartIndex = rows.findIndex(row => row.Name && row.Name.toLowerCase().includes("total"));
    if (summaryStartIndex !== -1) {
        for (let i = rows.length - 1; i >= summaryStartIndex; i--) {
            await rows[i].delete();
            console.log(`delete row ${i}`);
        }
    }

    // Step 2: Calculate actual total
    let staffTotal = 0;
    const percentageMap = {
        'Kế Toán': 0.01,
        'Tech': 0.01,
        'Trợ lý': 0.00,
    };

    for (const row of rows) {
        const totalVal = parseFloat(row['Total']);
        if (!isNaN(totalVal)) {
            staffTotal += totalVal;
        }
    }

    // Step 3: Build summary rows dynamically
    const summaryRows = [
        {},
        { Name: 'Total' },
    ];

    let grandTotal = staffTotal;

    for (const [name, rate] of Object.entries(percentageMap)) {
        const cut = Math.round(staffTotal * rate);
        summaryRows.push({
            Name: name,
            Percentage: `${rate * 100}%`,
            Total: cut,
            Note: `${cut.toLocaleString('vi-VN')} đ`
        });
        grandTotal += cut;
    }

    summaryRows.push({
        Name: 'Grand total',
        Total: grandTotal,
    });

    // Step 4: Append to sheet
    await sheet.addRows(summaryRows);
};
