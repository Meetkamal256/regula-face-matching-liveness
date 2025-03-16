import React, { useState } from "react";
import "./verification.css";

const Verification = () => {
  const [selfie, setSelfie] = useState(null);
  const [idPhoto, setIdPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  
  const validTypes = ["image/jpeg", "image/png", "image/bmp", "image/webp", "image/gif"];
  
  const handleFileChange = async (event, setFile) => {
    const file = event.target.files[0];
    if (!file) return;
  
    console.log(`Uploaded File: ${file.name} (${file.type}), Size: ${file.size} bytes`);
  
    if (!validTypes.includes(file.type)) {
      alert("⚠️ Invalid file format. Please upload a JPG, PNG, BMP, WEBP, or GIF image.");
      return;
    }
  
    try {
      const resizedFile = await resizeImage(file);
      console.log(`Resized File: ${resizedFile.name}, Size: ${resizedFile.size} bytes`);
      setFile(resizedFile);
    } catch (error) {
      console.error("Error resizing image:", error);
    }
  };
  
  // const handleFileChange = async (event, setFile) => {
  //   const file = event.target.files[0];
  //   if (!file) return;
  //   console.log(`Uploaded File: ${file.name} (${file.type}), Size: ${file.size} bytes`);
  //   setFile(file);  // Use the original file instead of resizing
  // };

  const resizeImage = async (file, maxSize = 1024) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log(`Original Image Dimensions: ${img.width}x${img.height}`);

        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        console.log(`Resized Image Dimensions: ${width}x${height}`);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(img.src);
          if (blob) resolve(new File([blob], "resized.jpg", { type: "image/jpeg" }));
          else reject(new Error("Image resizing failed"));
        }, "image/jpeg", 0.7);
      };
      img.onerror = () => reject(new Error("Invalid image file"));
      img.src = URL.createObjectURL(file);
    });
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
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
    // Convert images to Base64
    const selfieBase64 = await convertToBase64(selfie);
    const idPhotoBase64 = await convertToBase64(idPhoto);
    
    if (!selfieBase64 || !idPhotoBase64) {
      throw new Error("Failed to convert images to Base64.");
    }
    
    // ✅ Debugging: Log Base64 sizes and start/end snippets
    console.log("Selfie Base64 Length:", selfieBase64.length);
    console.log("ID Photo Base64 Length:", idPhotoBase64.length);
    console.log("Selfie Base64 (start):", selfieBase64.slice(0, 100));
    console.log("Selfie Base64 (end):", selfieBase64.slice(-100));
    console.log("ID Photo Base64 (start):", idPhotoBase64.slice(0, 100));
    console.log("ID Photo Base64 (end):", idPhotoBase64.slice(-100));
    
    // ✅ Remove 'data:image/jpeg;base64,' prefix before sending
    const formattedSelfieBase64 = selfieBase64.split(",")[1];
    const formattedIdPhotoBase64 = idPhotoBase64.split(",")[1];
    
    // ✅ Updated request body
   const stripBase64Prefix = (base64) => base64.replace(/^data:image\/\w+;base64,/, "");

const requestBody = {
  images: [
    { image: stripBase64Prefix(selfieBase64), imageType: 3, contentType: "image/jpeg" },
    { image: stripBase64Prefix(idPhotoBase64), imageType: 1, contentType: "image/jpeg" },
  ],
};
    
    
    console.log("Sending Face Match Request:", requestBody);
    
    // Send API request
    const response = await fetch("http://localhost:5000/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    
    console.log("Raw Response Status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error("Failed to process face match.");
    }
    
    const data = await response.json();
    console.log("Face match response:", JSON.stringify(data, null, 2));
    
    // ✅ Save Base64 images for debugging
    const saveBase64AsFile = (base64, filename) => {
      const link = document.createElement("a");
      link.href = `data:image/jpeg;base64,${base64}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    saveBase64AsFile(formattedSelfieBase64, "selfie-debug.jpg");
    saveBase64AsFile(formattedIdPhotoBase64, "id-debug.jpg");
    
    // ✅ Validate response
    if (data?.results?.length > 0 && data.results[0].similarity !== undefined) {
      const similarity = data.results[0].similarity;
      console.log(`✅ Face match similarity: ${similarity.toFixed(2)}%`);
      setResult(`✅ Face match similarity: ${similarity.toFixed(2)}%`);
    } else {
      console.error("❌ No valid matching results found.");
      setResult("❌ No valid matching results found.");
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
