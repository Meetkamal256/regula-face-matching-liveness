import React, { useState, useEffect } from "react";
import { FaceSdk, ImageSource } from "@regulaforensics/facesdk-webclient";
import "./verification.css";

const Verification = () => {
  const [sdk, setSdk] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [idPhoto, setIdPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [isSdkReady, setIsSdkReady] = useState(false);

  useEffect(() => {
    const loadLicenseAndInitializeSdk = async () => {
      try {
        console.log("🔄 Initializing FaceSDK...");

        const response = await fetch("/regula.license");
        if (!response.ok) throw new Error("Failed to fetch license.");

        const license = await response.text();
        if (!license || license.length < 50) throw new Error("License file is empty or invalid.");

        console.log("🔹 License loaded successfully.");

        const sdkInstance = new FaceSdk({ license });
        console.log("✅ FaceSDK initialized successfully:", sdkInstance);

        if (!sdkInstance.matchingApi) throw new Error("matchingApi is undefined.");
        console.log("🔹 Matching API Methods:", Object.keys(sdkInstance.matchingApi));

        setIsSdkReady(true);
        console.log("⚡ Assuming SDK is ready.");
        setSdk(sdkInstance);
      } catch (error) {
        console.error("❌ SDK initialization error:", error);
      }
    };

    loadLicenseAndInitializeSdk();
  }, []);

  const handleFileChange = (event, setFile) => {
    const file = event.target.files[0];
    if (!file) return;
    setFile(file);
    console.log(`📤 Uploaded file: ${file.name}`);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        console.log("📷 Image converted to Base64:", reader.result.substring(0, 30) + "...");
        resolve(reader.result.split(",")[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("📝 Form submitted for verification");

    if (!sdk) {
      console.error("❌ SDK is not initialized.");
      setResult("Error: SDK not initialized correctly.");
      return;
    }

    if (!sdk.matchingApi) {
      console.error("❌ matchingApi is missing in SDK instance.");
      setResult("Error: matchingApi not found in SDK.");
      return;
    }

    if (typeof sdk.matchingApi.match !== "function") {
      console.error("❌ match method is not found in matchingApi.");
      setResult("Error: match method is missing.");
      return;
    }

    if (!selfie || !idPhoto) {
      alert("⚠️ Please upload both a selfie and an ID photo.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const selfieBase64 = await convertToBase64(selfie);
      const idPhotoBase64 = await convertToBase64(idPhoto);

      console.log("📤 Sending images for face matching...");
      console.log("🖼️ Selfie Image (Base64):", selfieBase64.substring(0, 30) + "...");
      console.log("🖼️ ID Photo Image (Base64):", idPhotoBase64.substring(0, 30) + "...");

      const response = await sdk.matchingApi.match({
        images: [
          { image: selfieBase64, imageType: ImageSource.LIVE },
          { image: idPhotoBase64, imageType: ImageSource.DOCUMENT },
        ],
      });

      console.log("📬 Face match response received:", response);

      if (response?.results?.[0]) {
        const similarity = response.results[0].similarity;
        console.log("✅ Face match similarity:", similarity);
        setResult(`Face match similarity: ${similarity.toFixed(2)}%`);
      } else {
        throw new Error("Verification failed! No matching results.");
      }
    } catch (error) {
      console.error("❌ Error processing face match:", error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
      <h1>Regula Face Verification</h1>
      <form onSubmit={handleSubmit}>
        <label>Upload Selfie:</label>
        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setSelfie)} />
        
        <label>Upload ID Photo:</label>
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
