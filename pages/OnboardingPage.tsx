import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage, auth } from '../firebase';
import type { User } from '../types';
import { motion } from 'framer-motion';

interface OnboardingPageProps {
  user: User;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ user }) => {
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [pfp, setPfp] = useState<File | null>(null);
    const [pfpPreview, setPfpPreview] = useState<string>(`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handlePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPfp(file);
            setPfpPreview(URL.createObjectURL(file));
        }
    };

    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!displayName.trim()) return;
        setLoading(true);

        let photoURL = pfpPreview;
        if (pfp) {
            const storageRef = storage.ref(`profile_pictures/${user.uid}/${pfp.name}`);
            const snapshot = await storageRef.put(pfp);
            photoURL = await snapshot.ref.getDownloadURL();
        }

        const userProfile = {
            uid: user.uid,
            displayName,
            bio,
            photoURL,
        };

        await db.collection('users').doc(user.uid).set(userProfile);
        setLoading(false);
        navigate('/groups');
    };

    return (
        <div className="flex items-center justify-center h-screen bg-[#1E1F22]">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#2b2d31] p-8 rounded-lg shadow-2xl w-full max-w-md"
            >
                <h1 className="text-2xl font-bold text-white mb-2">Create Your Profile</h1>
                <p className="text-gray-400 mb-6">Welcome! Let's get you set up.</p>

                <form onSubmit={handleCompleteProfile} className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <img src={pfpPreview} alt="Profile preview" className="w-20 h-20 rounded-full object-cover" />
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePfpChange} className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-gray-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-500">
                            Upload Picture
                        </button>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-[#1E1F22] p-2 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-[#1E1F22] p-2 rounded-md mt-1 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-[#5865F2] text-white font-medium py-3 rounded-md hover:bg-[#4f5bda] transition-colors disabled:bg-gray-500">
                        {loading ? 'Saving...' : 'Complete Profile'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default OnboardingPage;
