import dotenv from 'dotenv';

dotenv.config();

const generateID = async (sheet) => {
    const rows = await sheet.getRows();
    const nextID = rows.length + 1; // Start counting from 1
    const formattedID = nextID.toString().padStart(6, '0'); // Convert to 6-digit format
    return formattedID;
};

export default generateID;