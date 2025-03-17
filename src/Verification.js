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
    console.log("Selfie Base64 Sample:", selfieBase64.substring(0, 50)); 
    console.log("ID Photo Base64 Sample:", idPhotoBase64.substring(0, 50));
    
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
    
    // Log the request object before sending
    // console.log("Request Body:", JSON.stringify(requestBody, null, 2));
    
    const response = await fetch("http://localhost:5000/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    
    // Log response status and body
    console.log("Response Status:", response.status);
    const data = await response.json();
    console.log("Response Data:", data);
    
    if (!response.ok) {
      throw new Error(`Failed to process face match. Status: ${response.status}`);
    }
    
    if (data?.similarity !== undefined) {
      setResult(`✅ Face match similarity: ${(data.similarity * 100).toFixed(2)}%`);
    } else {
      setResult("No valid matching results found.");
    }
  } catch (error) {
    console.error("Error processing face match:", error);
    setResult(`Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
  
  
  return (
    <div className="container">
      <h1>Face Matching Verification</h1>
      <div className="upload-section">
        <div className="upload-box">
          <label>Upload Selfie</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setSelfie)} />
          {selfie && <img src={URL.createObjectURL(selfie)} alt="Selfie" className="preview-image" />}
        </div>
        <div className="upload-box">
          <label>Upload ID Photo</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setIdPhoto)} />
          {idPhoto && <img src={URL.createObjectURL(idPhoto)} alt="ID" className="preview-image" />}
        </div>
      </div>
      <button type="submit" className="verify-button" onClick={handleSubmit} disabled={loading}>
        {loading ? "Verifying..." : "Verify Face Match"}
      </button>
      {result && <p className="result-message">{result}</p>}
    </div>
  );
};

export default Verification;

