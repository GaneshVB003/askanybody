import { useState, useEffect } from 'react';
import { db } from '../firebase';
import type { UserStatus } from '../types';

export const useUserStatus = (uid?: string): 'online' | 'offline' => {
    const [status, setStatus] = useState<'online' | 'offline'>('offline');

    useEffect(() => {
        if (!uid) {
            setStatus('offline');
            return;
        }

        const unsubscribe = db.collection('user_status').doc(uid).onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data() as UserStatus;
                setStatus(data.status);
            } else {
                setStatus('offline');
            }
        }, error => {
            console.error("Error fetching user status:", error);
            setStatus('offline');
        });

        return () => unsubscribe();
    }, [uid]);

    return status;
};
