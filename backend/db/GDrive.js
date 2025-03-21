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

// Create Sheet in Folder
export const createSheetinFolder = async(folderId,sheetTitle) => {
    try {
        const drive = serviceAccountAuth();

        const fileMetadata = {
            name: sheetTitle,
            mimeType: "application/vnd.google-apps.spreadsheet",
            parents: [folderId],
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            fields: "id",
        });
        console.log("file created",file);
        
        await new Promise((resolve) => setTimeout(resolve, 3000)); 

        const sheetID =  file.data.id;

        console.log(`Google Sheet created successfully with ID: ${sheetID}`);

        await new Promise((resolve) => setTimeout(resolve, 10000)); 

        const doc = await connectGoogleSheet(sheetID);
        // const auditSheet = doc.sheetsByIndex[0];

        await doc.sheetsByIndex[0].setHeaderRow(["ID","Name","Income", "Service", "", "", "", "Percentage", "Total", "Note"]);

        console.log("reach here");
        console.log(`Initial data added to Sheet: ${sheetTitle}`);
        return sheetID;
    } catch (error) {
        console.error("Error creating Google Sheet:", error);
        throw new Error("Failed to create Google Sheet");
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