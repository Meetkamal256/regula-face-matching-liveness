import React, { useState } from "react";
import "./verification.css";

const Verification = () => {
  const [selfie, setSelfie] = useState(null);
  const [idPhoto, setIdPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const validTypes = ["image/jpeg", "image/png", "image/bmp", "image/webp", "image/gif"];

  const handleFileChange = (event, setFile) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log(`Uploaded File: ${file.name} (${file.type}), Size: ${file.size} bytes`);

    if (!validTypes.includes(file.type)) {
      alert("Invalid file format. Please upload a JPG, PNG, BMP, WEBP, or GIF image.");
      return;
    }

    setFile(file);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selfie || !idPhoto) {
      alert("Please upload both a selfie and an ID photo.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      console.log("🔄 Converting images to base64...");

      const selfieBase64 = await convertToBase64(selfie);
      const idPhotoBase64 = await convertToBase64(idPhoto);

      // Debug: Check base64 data
      console.log("Selfie Base64 Sample:", selfieBase64.substring(0, 50)); // First 50 chars
      console.log("ID Photo Base64 Sample:", idPhotoBase64.substring(0, 50));  // First 50 chars

      // Debug: Check image type assignments
      console.log("Assigned Image Types:", {
        selfie: 3,  // Selfie should be imageType 3
        idPhoto: 1   // ID Photo should be imageType 1
      });

      const requestBody = {
        tag: "face_matching",
        thumbnails: null,
        images: [
          { imageType: 3, image: selfieBase64 },
          { imageType: 1, image: idPhotoBase64 }
        ]
      };

      console.log("📤 Sending request to server with body:", JSON.stringify(requestBody, null, 2));

      const response = await fetch("http://localhost:5000/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to process face match.");
      }

      const data = await response.json();

      // Debug: Check the raw API response
      console.log("📝 Regula API Response:", data);

      if (data?.results?.length > 0 && data.results[0].similarity !== undefined) {
        setResult(`✅ Face match similarity: ${data.results[0].similarity.toFixed(2)}%`);
      } else {
        setResult("❌ No valid matching results found.");
      }
    } catch (error) {
      console.error("❌ Error processing face match:", error);
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Regula Face Verification</h1>
      <form onSubmit={handleSubmit}>
        <label>Upload Selfie</label>
        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setSelfie)} />

        <label>Upload ID Photo</label>
        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setIdPhoto)} />

        <button type="submit" className="button" disabled={loading}>
          {loading ? "Verifying..." : "Upload & Verify"}
        </button>
      </form>
      {result && <p>{result}</p>}
    </div>
  );
};

export default Verification;
