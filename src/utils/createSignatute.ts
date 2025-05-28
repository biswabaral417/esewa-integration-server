import { createSignatureFunctionType } from "../Types";

import CryptoJS from "crypto-js";

export const createSignature: createSignatureFunctionType = (secretKey, message) => {
    try {
        const hash = CryptoJS.HmacSHA256(message, secretKey);
        return CryptoJS.enc.Base64.stringify(hash);
    } catch (error) {
        console.error('Error creating signature:', error);
        throw new Error('Failed to create signature.');
    }
};

