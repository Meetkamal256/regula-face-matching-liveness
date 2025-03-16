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
        console.error("License file not found:", licensePath);
        return res.status(404).json({ error: "License file not found." });
    }
    console.log("Serving license file...");
    res.sendFile(licensePath, (err) => {
        if (err) {
            console.error("⚠️ Error serving license file:", err);
            res.status(500).json({ error: "Failed to serve license file." });
        } else {
            console.log("License file served successfully.");
        }
    });
});

app.post("/api/match", async (req, res) => {
    try {
        console.log("\nReceived a face matching request...");

        if (!req.body.images || req.body.images.length !== 2) {
            console.error("Invalid request: Expected 2 images, but received:", req.body.images?.length || 0);
            return res.status(400).json({ error: "Invalid request. Expected 2 images." });
        }

        const requestBody = {
            tag: "face_matching",
            thumbnails: null,
            images: req.body.images.map((img, index) => ({
                index,
                type: img.imageType,
                data: img.image,
                detectAll: true,  // Ensure faces are detected properly
            })),
            processParam: { // Ensure correct matching
                onlyCentralFace: false,
                similarityThreshold: 0.7 // Adjust threshold if necessary
            },
            outputImageParams: {
                backgroundColor: [128, 128, 128],
                crop: {
                    type: 2, // Auto crop faces properly
                    padColor: [128, 128, 128],
                    size: [300, 400],
                    returnOriginalRect: true
                }
            }
        };
        
        console.log("Forwarding request to Regula API with formatted payload...");
        const regulaResponse = await axios.post("http://localhost:41101/api/match", requestBody, {
            headers: { "Content-Type": "application/json" }
        });
        
        console.log("Regula API Response:", JSON.stringify(regulaResponse.data, null, 2));
        
        if (regulaResponse.data?.results?.length > 0) {
            res.json({
                success: true,
                similarity: regulaResponse.data.results[0].similarity,
                message: `Match similarity: ${regulaResponse.data.results[0].similarity.toFixed(2)}%`
            });
        } else {
            res.status(400).json({ error: "No matching results found." });
        }
    
    } catch (error) {
        console.error("Error calling Regula API:", error.response ? error.response.data : error.message);
        res.status(500).json({
            error: "Failed to process face matching request.",
            details: error.response ? error.response.data : error.message,
        });
    }
});

app.get("/", (req, res) => {
    res.send("License Server is running. Access the license at /license");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
