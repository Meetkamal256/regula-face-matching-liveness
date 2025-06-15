import React, { useState } from "react";
import styles from "./verification.module.css";

const Verification = () => {
const [selfie, setSelfie] = useState<File | null>(null);
const [idPhoto, setIdPhoto] = useState<File | null>(null);
const [loading, setLoading] = useState<boolean>(false);
const [result, setResult] = useState<string>("");
  
  const validTypes = ["image/jpeg", "image/png", "image/bmp", "image/webp", "image/gif"];
  
    const handleFileChange = (
      event: React.ChangeEvent<HTMLInputElement>,
      setFile: React.Dispatch<React.SetStateAction<File | null>>
    ) => {
      const file = event.target.files?.[0];
      if (!file) return;
      
      console.log(
        `Uploaded File: ${file.name} (${file.type}), Size: ${file.size} bytes`
      );
      
      if (!validTypes.includes(file.type)) {
        alert(
          "Invalid file format. Please upload a JPG, PNG, BMP, WEBP, or GIF image."
        );
        return;
      }
      
      setFile(file);
    };
  
 const convertToBase64 = (file: File): Promise<string> => {
   return new Promise((resolve, reject) => {
     const reader = new FileReader();
     reader.readAsDataURL(file);
     reader.onload = () => {
       const base64String = reader.result as string;
       resolve(base64String.split(",")[1]); // Extract base64 data
     };
     reader.onerror = (error) => reject(error);
   });
 };
  
const handleSubmit = async (event: React.FormEvent) => {
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
      // tag: "face_matching",
      thumbnails: null,
      images: [
        { imageType: 3, image: selfieBase64 },
        { imageType: 1, image: idPhotoBase64 }
      ]
    };
    
    // Send the request to the backend API
    const response = await fetch("http://localhost:5000/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    
    const data = await response.json();
    console.log("Response Data:", data);
    
    if (!response.ok) {
      throw new Error(`Failed to process face match. Status: ${response.status}`);
    }
    
    if (data?.similarity !== undefined) {
      const similarityPercentage = (data.similarity * 100).toFixed(2);
      
      // Determine if it's a match based on similarity percentage
      if (data.similarity >= 0.75) {
        setResult(`✅ Face match similarity: ${similarityPercentage}% (Match)`);
      } else {
        setResult(`❌ Face match similarity: ${similarityPercentage}% (Not a match)`);
      }
    } else {
      setResult("No valid matching results found.");
    }
  } catch (error) {
    console.error("Error processing face match:", error);
  setResult(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  } finally {
    setLoading(false);
  }
};
  
  return (
    <div className={styles.container}>
      <h1>Face Matching Verification</h1>
      <div className={styles.uploadSection}>
        <div className={styles.uploadBox}>
          <label>Upload Selfie</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setSelfie)} />
          {selfie && <img src={URL.createObjectURL(selfie)} alt="Selfie" className={styles.previewImage} />}
        </div>
        <div className={styles.uploadBox}>
          <label>Upload ID Photo</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setIdPhoto)} />
          {idPhoto && <img src={URL.createObjectURL(idPhoto)} alt="ID" className={styles.previewImage} />}
        </div>
      </div>
      <button type="submit" className={styles.verifyButton} onClick={handleSubmit} disabled={loading}>
        {loading ? "Verifying..." : "Verify Face Match"}
      </button>
      {result && <p className={styles.resultMessage}>{result}</p>}
    </div>
  );
};

export default Verification;

