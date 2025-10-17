import React, { useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth } from '../firebase';
import { motion } from 'framer-motion';

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

const LoginPage: React.FC = () => {
    const [error, setError] = useState<string | null>(null);

    const getFriendlyErrorMessage = (errorCode: string): string => {
        switch (errorCode) {
            case 'auth/configuration-not-found':
            case 'auth/operation-not-allowed':
                return "This sign-in method is not enabled. Please enable it in your project's Firebase Authentication settings.";
            default:
                return "An unexpected error occurred. Please check the console and try again.";
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await auth.signInWithPopup(provider);
        } catch (err: any) {
            console.error("Error during Google sign-in:", err);
            setError(getFriendlyErrorMessage(err.code));
        }
    };

    const handleAnonymousLogin = async () => {
        setError(null);
        try {
            await auth.signInAnonymously();
        } catch (err: any) {
            console.error("Error during anonymous sign-in:", err);
            setError(getFriendlyErrorMessage(err.code));
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-[#1E1F22]">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[#2b2d31] p-10 rounded-lg shadow-2xl text-center max-w-sm w-full"
            >
                <h1 className="text-3xl font-bold text-white mb-2">Gemini Chat</h1>
                <p className="text-gray-400 mb-8">Welcome to the Discord Clone MVP</p>
                
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-md relative mb-6 text-sm" 
                        role="alert"
                    >
                        <strong className="font-bold block">Authentication Error</strong>
                        <span>{error}</span>
                    </motion.div>
                )}

                <div className="space-y-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center bg-white text-gray-700 font-medium py-3 rounded-md shadow-sm hover:bg-gray-100 transition-colors"
                    >
                        <GoogleIcon />
                        Sign in with Google
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAnonymousLogin}
                        className="w-full bg-[#5865F2] text-white font-medium py-3 rounded-md hover:bg-[#4f5bda] transition-colors"
                    >
                        Sign in Anonymously
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;