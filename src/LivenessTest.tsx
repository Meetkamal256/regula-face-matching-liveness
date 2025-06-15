// import React, { useState, useRef, useEffect } from "react";
// // eslint-disable-next-line
// import { FaceLivenessWebComponent } from "@regulaforensics/vp-frontend-face-components";
// import styles from "./liveness.module.css";

// interface LivenessEventData {
//   action: string;
//   data?: {
//     status: number;
//     transactionId: string;
//     portrait: string;
//     video?: string;
//     reason?: string;
//   };
// }

// const LivenessTest: React.FC = () => {
//   const [isOpen, setIsOpen] = useState(false);
  
//   // Use Ref with proper type for the custom element
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const componentRef = useRef<FaceLivenessWebComponent | null>(null);
  
//   const livenessSettings = {
//     url: "http://localhost:5000/proxy/liveness-start",
//     customization: {
//       onboardingScreenStartButtonBackground: "#5b5050",
//     },
//     constraints: {
//       orientation: "any",
//     },
//   };
  
//   // Handle Liveness Test Events
//   const handleLivenessEvent = (event: CustomEvent<LivenessEventData>) => {
//     const data = event.detail;
//     console.log("📢 Liveness Event:", data);

//     if (data.action === "PROCESS_FINISHED") {
//       if (data.data?.status === 1) {
//         console.log("Liveness Verified");
//         console.log("Transaction ID:", data.data.transactionId);
//         console.log("Captured Portrait (Base64):", data.data.portrait);
//         console.log("Video Data (if available):", data.data.video);
//       } else {
//         console.warn("Liveness Test Failed: ", data.data?.reason);
//       }
//     }

//     if (["CLOSE", "RETRY_COUNTER_EXCEEDED"].includes(data.action)) {
//       console.log("❌ Liveness test closed or retries exceeded.");
//       setIsOpen(false);
//     }
//   };

//   // Attach Event Listener
//   useEffect(() => {
//     const container = containerRef.current;
//     if (container) {
//       container.addEventListener(
//         "face-liveness",
//         handleLivenessEvent as EventListener
//       );
//       console.log("🔗 Event listener attached.");
//     }
//     return () => {
//       if (container) {
//         container.removeEventListener(
//           "face-liveness",
//           handleLivenessEvent as EventListener
//         );
//         console.log("Event listener removed.");
//       }
//     };
//   }, []);

//   return (
//     <div className={styles.container} ref={containerRef}>
//       {isOpen ? (
//         <face-liveness
//           ref={componentRef}
//           settings={livenessSettings}
//         ></face-liveness>
//       ) : (
//         <button className={styles.startButton} onClick={() => setIsOpen(true)}>
//           Start Liveness Test
//         </button>
//       )}
//     </div>
//   );
// };

// export default LivenessTest;
