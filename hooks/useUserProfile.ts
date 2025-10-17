import { useState, useEffect } from 'react';
import { db } from '../firebase';
import type { Profile } from '../types';

export const useUserProfile = (uid?: string) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) {
            setProfile(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = db.collection('users').doc(uid).onSnapshot(doc => {
            if (doc.exists) {
                setProfile(doc.data() as Profile);
            } else {
                setProfile(null);
            }
            setLoading(false);
        }, error => {
            console.error("Error fetching user profile:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [uid]);

    return { profile, loading };
};
