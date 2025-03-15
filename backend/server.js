import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();
const PORT = 5000;

app.use(cors({ origin: "*" })); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const licensePath = "/opt/regula/face-rec-service/extBin/unix/regula.license";

app.get("/license", (req, res) => {
    // Check if license file exists
    if (!fs.existsSync(licensePath)) {
        console.error("License file not found:", licensePath);
        return res.status(404).json({ error: "License file not found." });
    }
    
    res.sendFile(licensePath, (err) => {
        if (err) {
            console.error("⚠️ Error serving license file:", err);
            res.status(500).json({ error: "Failed to serve license file." });
        }
    });
});

app.get("/", (req, res) => {
    res.send("License Server is running. Access the license at /license");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
