import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import axios from "axios";

const app = express();
const PORT = 5000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const licensePath = "/opt/regula/face-rec-service/extBin/unix/regula.license";

app.get("/license", (req, res) => {
    if (!fs.existsSync(licensePath)) {
        console.error("❌ License file not found:", licensePath);
        return res.status(404).json({ error: "License file not found." });
    }
    console.log("✅ Serving license file...");
    res.sendFile(licensePath, (err) => {
        if (err) {
            console.error("⚠️ Error serving license file:", err);
            res.status(500).json({ error: "Failed to serve license file." });
        }
    });
});

app.post("/api/match", async (req, res) => {
    try {
        console.log("\n📩 Received a face matching request...");
        console.log("Request Body:", JSON.stringify(req.body, null, 2));

        // ✅ Validate request structure
        if (!req.body.images || req.body.images.length !== 2) {
            console.error("❌ Invalid request: Expected 2 images, but received:", req.body.images?.length || 0);
            return res.status(400).json({ error: "Invalid request. Expected 2 images." });
        }

        req.body.images.forEach((img, index) => {
            console.log(`📷 Image ${index + 1}:`);
            console.log(`   🔹 Type: ${img.imageType}`);
            console.log(`   📏 Base64 Length: ${img.image.length}`);

            if (!img.image || img.image.length < 100) {
                console.error(`❌ Image ${index + 1} is invalid or too small!`);
            } else {
                console.log(`First 20 chars: ${img.image.substring(0, 20)}...`);
                console.log(`Last 20 chars: ...${img.image.substring(img.image.length - 20)}`);

            }
        });

        console.log("🚀 Forwarding request to Regula API...");
        const regulaResponse = await axios.post("http://localhost:41101/api/match", req.body, {
            headers: { "Content-Type": "application/json" }
        });

        console.log("✅ Regula API Response:", regulaResponse.data);
        res.json(regulaResponse.data);
    } catch (error) {
        console.error("❌ Error calling Regula API:", error.response ? error.response.data : error.message);
        res.status(500).json({
            error: "Failed to process face matching request.",
            details: error.response ? error.response.data : error.message,
        });
    }
});


app.get("/", (req, res) => {
    res.send("✅ License Server is running. Access the license at /license");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
