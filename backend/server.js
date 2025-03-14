import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 5000;

app.use(cors());

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the regula.license file
app.get("/license", (req, res) => {
    const licensePath = "/opt/regula/face-rec-service/extBin/unix/regula.license";
    res.sendFile(licensePath, (err) => {
        if (err) {
            console.error("Error serving license file:", err);
            res.status(500).send("License file not found or cannot be served.");
        }
    });
});

// Default route for sanity check
app.get("/", (req, res) => {
    res.send("License Server is running. Access the license at /license");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
