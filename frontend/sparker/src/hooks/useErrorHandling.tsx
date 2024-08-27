import { useState } from 'react';

export const useErrorHandling = () => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleError = (error: any) => {
        let message = 'An unexpected error occurred.';
        
        if (error && error.message) {
            message = `Error: ${error.message}`;
            setErrorMessage(message);
        } else {
            setErrorMessage(message);
        }
        return message;  // Return the error message directly
    };

    const clearError = () => setErrorMessage(null);

    return {
        errorMessage,
        handleError,
        clearError,
    };
};
