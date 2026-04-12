import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.join(__dirname, "../Client/src/assets/logo_icon.svg");

async function uploadLogo() {
    try {
        const result = await cloudinary.uploader.upload(logoPath, {
            folder: "chat_app_assets",
            public_id: "logo",
        });
        console.log("Logo uploaded successfully!");
        console.log("URL:", result.secure_url);
        fs.writeFileSync("logo_url.txt", result.secure_url);
    } catch (error) {
        console.error("Error uploading logo:", error);
    }
}

uploadLogo();
