import React, { useState } from "react";
import "./verification.css";

const Verification = () => {
  const [selfie, setSelfie] = useState(null);
  const [idPhoto, setIdPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  
  const handleFileChange = async (event, setFile) => {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log(`Uploaded File: ${file.name} (${file.type})`);
    
    const validTypes = ["image/jpeg", "image/png", "image/bmp", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("⚠️ Invalid file format. Please upload a JPG, PNG, BMP, WEBP, or GIF image.");
      return;
    }
    
    // Convert to JPEG if necessary
    const convertedFile = file.type !== "image/jpeg" ? await convertToJpeg(file) : file;
    setFile(convertedFile);
  };
  
  const convertToJpeg = async (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], "converted.jpg", { type: "image/jpeg" }));
          else reject(new Error("Image conversion failed"));
        }, "image/jpeg", 0.9);
      };
      img.onerror = () => reject(new Error("Invalid image file"));
    });
  };
  
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // Extract base64 only
      reader.onerror = (error) => reject(error);
    });
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Submitting images for face verification...");
    
    if (!selfie || !idPhoto) {
      alert("Please upload both a selfie and an ID photo.");
      return;
    }
    
    setLoading(true);
    setResult("");
    
    try {
      const selfieBase64 = await convertToBase64(selfie);
      const idPhotoBase64 = await convertToBase64(idPhoto);
      
      console.log("Sending images to backend for matching...");
      
      const response = await fetch("http://localhost:5000/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: [
            { image: selfieBase64, imageType: 3 }, // Selfie
            { image: idPhotoBase64, imageType: 1 }, // ID Photo
          ],
        }),
      });
      
      if (!response.ok) throw new Error("Failed to process face match.");
      
      const data = await response.json();
      console.log("Face match response:", data);
      
      if (data?.results?.length > 0 && data.results[0].similarity !== undefined) {
        const similarity = data.results[0].similarity;
        setResult(`✅ Face match similarity: ${similarity.toFixed(2)}%`);
      } else {
        throw new Error("No valid matching results found.");
      }
    } catch (error) {
      console.error("Error processing face match:", error);
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