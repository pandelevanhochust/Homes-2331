import dotenv from "dotenv";
import { gapi } from "gapi-script";

dotenv.config();

const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";  // Replace with your actual Client ID
const API_KEY = "YOUR_GOOGLE_API_KEY";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.file";

export const initGoogleDrive = () => {
  gapi.load("client:auth2", () => {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    });
  });
};

export const signInToGoogle = async () => {
  await gapi.auth2.getAuthInstance().signIn();
};

export const uploadFileToGoogleDrive = async (file) => {
  const accessToken = gapi.auth.getToken().access_token;

  const metadata = {
    name: file.name,
    mimeType: file.type,
    parents: ["YOUR_DRIVE_FOLDER_ID"], // Change to your Drive folder ID if needed
  };

  const formData = new FormData();
  formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  formData.append("file", file);

  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: new Headers({ Authorization: `Bearer ${accessToken}` }),
    body: formData,
  });

  const data = await response.json();
  return `https://drive.google.com/uc?id=${data.id}`; // Public link format
};
