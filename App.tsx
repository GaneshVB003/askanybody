import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './firebase';
import firebase from 'firebase/compat/app';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import GroupDiscoveryPage from './pages/GroupDiscoveryPage';
import GroupPage from './pages/GroupPage';
import { useUserProfile } from './hooks/useUserProfile';
import type { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { profile, loading: profileLoading } = useUserProfile(user?.uid);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser as User);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      if (!profileLoading && !profile && location.pathname !== '/onboarding') {
        navigate('/onboarding');
      } else if (!profileLoading && profile && (location.pathname === '/' || location.pathname === '/onboarding')) {
        navigate('/groups');
      }
    } else {
      navigate('/');
    }
  }, [user, profile, authLoading, profileLoading, navigate, location.pathname]);

  useEffect(() => {
    if (!user) return;

    // This is a basic Firestore-based presence system.
    // For a more robust solution, Firebase Realtime Database's `onDisconnect` is recommended.
    const userStatusRef = db.collection('user_status').doc(user.uid);

    const onlineStatus = {
        status: 'online' as const,
        last_changed: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const offlineStatus = {
        status: 'offline' as const,
        last_changed: firebase.firestore.FieldValue.serverTimestamp(),
    };

    // Set online status when user is authenticated and app is open.
    userStatusRef.set(onlineStatus);

    const onUnload = () => {
        // Firestore writes are async and may not complete before the page unloads.
        // This is a best-effort attempt to set the status to offline.
        if (auth.currentUser) {
            userStatusRef.set(offlineStatus);
        }
    };

    window.addEventListener('beforeunload', onUnload);

    return () => {
        window.removeEventListener('beforeunload', onUnload);
    };
  }, [user]);


  if (authLoading || (user && profileLoading)) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1E1F22]">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <GroupDiscoveryPage user={user} profile={profile!} /> : <LoginPage />} />
      <Route path="/onboarding" element={user ? <OnboardingPage user={user} /> : <LoginPage />} />
      <Route path="/groups" element={user && profile ? <GroupDiscoveryPage user={user} profile={profile} /> : <LoginPage />} />
      <Route path="/group/:groupId" element={user && profile ? <GroupPage user={user} profile={profile} /> : <LoginPage />} />
    </Routes>
  );
};

export default App;
