import dotenv from 'dotenv';
import { JWT } from "google-auth-library";
import { google } from "googleapis";
import connectGoogleSheet from './sheet.js';


dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL;
const AUDIT_FOLDER = process.env.FOLDER_NAME;

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

//Create googleSheets
export const createSheetinFolder = async (folderId, sheetTitle, services = ['SM', 'Chat', 'Sakura', 'Imlive'], rate = '24.5') => {
    try {
      const drive = serviceAccountAuth();
  
      // Step 1: Create Google Sheet in Drive folder
      const fileMetadata = {
        name: sheetTitle,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: [folderId],
      };
  
      const file = await  drive.files.create({
        resource: fileMetadata,
        fields: 'id',
      });
  
      const sheetID =  file.data.id;
      console.log(`✅ Google Sheet created successfully with ID: ${sheetID}`);
  
      // Step 2: Connect to the new sheet
      const doc = await connectGoogleSheet(sheetID);
      const sheet = doc.sheetsByIndex[0];
  
    // ✅ Step 1: Add display row at top
    // await sheet.setHeaderRow(['Income', '', '', '', '', '', '', '', `rate: ${rate}`],1);

    // ✅ Step 2: Set proper header for audit data
    const headerRow = ['Name', ...services, 'Percentage', 'Total', 'Note'];
    await sheet.setHeaderRow(headerRow); // Set at row 2

      console.log('✅ Header and initial data row added to the sheet');
      return sheetID;
    } catch (error) {
      console.error('❌ Error creating Google Sheet:', error.message);

      if (sheetID) {
        try {
          await drive.files.delete({ fileId: sheetID });
          console.warn(`🧹 Rolled back: Deleted sheet ${sheetID} due to error`);
        } catch (deleteError) {
          console.error('❌ Failed to auto-delete broken sheet:', deleteError.message);
        }
      }

      throw new Error('Failed to create Google Sheet');
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
