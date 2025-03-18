import React, { useState, useRef, useEffect } from "react";
// eslint-disable-next-line
import { FaceLivenessWebComponent } from "@regulaforensics/vp-frontend-face-components";
import styles from "./livenessTest.module.css";

const LivenessTest = () => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const componentRef = useRef(null);
    
    const livenessSettings = {
        url: "http://localhost:5000/proxy/liveness-start", 
        customization: {
            onboardingScreenStartButtonBackground: "#5b5050",
        },
        constraints: {
            orientation: "any",
        },
    };
    
    // Handle Liveness Test Events
    const handleLivenessEvent = (event) => {
        const data = event.detail;
        console.log("📢 Liveness Event:", data);
        
        if (data.action === "PROCESS_FINISHED") {
            if (data.data?.status === 1) {
                console.log("Liveness Verified");
                console.log("Transaction ID:", data.data.transactionId);
                console.log("Captured Portrait (Base64):", data.data.portrait);
                console.log("Video Data (if available):", data.data.video);
            } else {
                console.warn("Liveness Test Failed: ", data.data.reason);
            }
        }
        
        if (["CLOSE", "RETRY_COUNTER_EXCEEDED"].includes(data.action)) {
            console.log("❌ Liveness test closed or retries exceeded.");
            setIsOpen(false);
        }
    };
    
    // Attach Event Listener
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener("face-liveness", handleLivenessEvent);
            console.log("🔗 Event listener attached.");
        }
        return () => {
            if (container) {
                container.removeEventListener("face-liveness", handleLivenessEvent);
                console.log("Event listener removed.");
            }
        };
    }, []);
    
    return (
        <div className={styles.container} ref={containerRef}>
            {isOpen ? (
                <face-liveness ref={componentRef} settings={livenessSettings}></face-liveness>
            ) : (
                <button className={styles.startButton} onClick={() => setIsOpen(true)}>
                    Start Liveness Test
                </button>
            )}
        </div>
    );
};

export default LivenessTest;
