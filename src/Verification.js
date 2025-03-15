import React, { useState, useEffect } from "react";
import { FaceSdk } from "@regulaforensics/facesdk-webclient";
import "./verification.css";

const Verification = () => {
  const [sdk, setSdk] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [idPhoto, setIdPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  
  // eslint-disable-next-line
  const [isSdkReady, setIsSdkReady] = useState(false);
  
  useEffect(() => {
    const loadLicenseAndInitializeSdk = async () => {
      try {
        console.log("Initializing FaceSDK...");
        
        const response = await fetch("http://localhost:5000/license");
        if (!response.ok) throw new Error("Failed to fetch license.");
        
        // Fetch as binary (correct format)
        const licenseBuffer = await response.arrayBuffer();
        console.log("License loaded successfully.");
        
        // Initialize SDK with binary license
        const sdkInstance = new FaceSdk({ license: new Uint8Array(licenseBuffer) });
        console.log("FaceSDK initialized successfully:", sdkInstance);
        
        if (!sdkInstance.matchingApi) throw new Error("matchingApi is undefined.");
        console.log("Matching API Methods:", Object.keys(sdkInstance.matchingApi));
        
        setIsSdkReady(true);
        console.log("SDK is ready.");
        setSdk(sdkInstance);
      } catch (error) {
        console.error("SDK initialization error:", error);
      }
    };
    
    loadLicenseAndInitializeSdk();
  }, []);
  
  const handleFileChange = (event, setFile) => {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log(`📝 File Name: ${file.name}, Detected Type: ${file.type}`);
    
    const validExtensions = [".jpg", ".jpeg", ".png", ".bmp", ".webp", ".gif"];
    const validMimeTypes = ["image/jpeg", "image/png", "image/bmp", "image/webp", "image/gif"];
    
    const fileNameLower = file.name.toLowerCase();
    
    const isValidExtension = validExtensions.some(ext => fileNameLower.endsWith(ext));
    const isValidMimeType = validMimeTypes.includes(file.type);
    
    if (!isValidExtension || !isValidMimeType) {
      alert("⚠️ Please upload a valid image format (JPG, PNG, BMP, WEBP, GIF).");
      return;
    }
    
    setFile(file);
    console.log(`📂 Uploaded: ${file.name} (${file.type}, ${file.size} bytes)`);
  };
  
  
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        console.log(`📷 Converted ${file.name} to Base64`);
        resolve(reader.result.split(",")[1]); 
      };
      reader.onerror = (error) => reject(error);
    });
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Form submitted for verification");
    
    if (!selfie || !idPhoto) {
      alert("Please upload both a selfie and an ID photo.");
      return;
    }
    
    setLoading(true);
    setResult("");
    
    try {
      console.log("Processing images for face matching...");
      const selfieBase64 = await convertToBase64(selfie);
      const idPhotoBase64 = await convertToBase64(idPhoto);
      
      console.log("Selfie Image (Base64):", selfieBase64.substring(0, 50) + "...");
      console.log("ID Photo Image (Base64):", idPhotoBase64.substring(0, 50) + "...");
      
      if (!sdk || !sdk.matchingApi) {
        throw new Error("SDK or matchingApi is not initialized.");
      }
      
      console.log("Sending images to match API...");
      const requestBody = {
        images: [
          { image: selfieBase64, imageType: 3, type: 3, data: "" }, // Selfie
          { image: idPhotoBase64, imageType: 1, type: 3, data: "" }, // ID Photo
        ],
      };
      
      console.log("Sending payload to FaceSDK:", JSON.stringify(requestBody, null, 2));
      
      const response = await sdk.matchingApi.match(requestBody);
      console.log("Face match response:", response);
      
      if (response?.results?.length > 0) {
        const similarity = response.results[0].similarity;
        console.log("Face match similarity:", similarity);
        setResult(`Face match similarity: ${similarity.toFixed(2)}%`);
      } else {
        throw new Error("Verification failed! No matching results.");
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
      <h1>Regula Face Verification</h1>
      <form onSubmit={handleSubmit}>
        <label>Upload Selfie</label>
        <input type="file" accept="image/png" onChange={(e) => handleFileChange(e, setSelfie)} />
        
        <label>Upload ID Photo</label>
        <input type="file" accept="image/jpeg" onChange={(e) => handleFileChange(e, setIdPhoto)} />
        
        <button type="submit" className="button" disabled={loading}>
          {loading ? "Verifying..." : "Upload & Verify"}
        </button>
      </form>
      {result && <p>{result}</p>}
    </div>
  );
};

export default Verification;
