import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = 5000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Debug API Connectivity with Regula Service
app.get("/api/check-regula", async (req, res) => {
    try {
        console.log("Checking Regula service at port 41101...");
        const response = await axios.get("http://localhost:41101/api/info");
        console.log("Regula service response:", response.data);
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error("Failed to connect to Regula service at port 41101:", error.message);
        res.status(500).json({ error: "Could not reach Regula service.", details: error.message });
    }
});

// Forward Face Matching Request to Regula API
app.post("/api/match", async (req, res) => {
    try {
        console.log("\n🔍 Received a face matching request...");
        
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
                detectAll: true,
            })),
            processParam: {
                onlyCentralFace: false,
                similarityThreshold: 0.7
            },
            outputImageParams: {
                backgroundColor: [128, 128, 128],
                crop: {
                    type: 2,
                    padColor: [128, 128, 128],
                    size: [300, 400],
                    returnOriginalRect: true
                }
            }
        };
        
        console.log("Forwarding request to Regula API...");
        const regulaResponse = await axios.post("http://localhost:41101/api/match", requestBody, {
            headers: { "Content-Type": "application/json" }
        });
        
        console.log("Regula API Response:", JSON.stringify(regulaResponse.data, null, 2));
        
        if (regulaResponse.data?.results?.length > 0) {
            const similarity = regulaResponse.data.results[0].similarity;
            res.json({ success: true, similarity }); 
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
    res.send("Express.js server is running on port 5000.");
});

app.listen(PORT, () => {
    console.log(`🚀 Express server running at http://localhost:${PORT}`);
});
