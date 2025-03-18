import React, { useState } from "react";
import { FaceSDK } from "@regulaforensics/facesdk-webclient";
import styles from "./livenessTest.module.css";

const LivenessTest = () => {
    return (
        <div className={styles.container}>
            <div className={styles.livenessContainer}>
                <h2 className={styles.title}>Liveness Test</h2>
                <button className={styles.startButton}>Start Test</button>
            </div>
        </div>
    );
};

export default LivenessTest;
