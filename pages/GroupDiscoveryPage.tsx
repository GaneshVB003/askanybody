import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import firebase from 'firebase/compat/app';
import type { User, Group, Profile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// Modal for Creating a Group
const CreateGroupModal = ({ user, onClose }: { user: User, onClose: () => void }) => {
    const [name, setName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const newGroupRef = db.collection('groups').doc();
        await newGroupRef.set({
            id: newGroupRef.id,
            name,
            isPrivate,
            password: isPrivate ? password : null,
            ownerId: user.uid,
            members: [user.uid],
            iconUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
        });

        // Add a default 'general' channel
        await newGroupRef.collection('channels').doc('general').set({
            id: 'general',
            name: 'general',
        });
        
        onClose();
        navigate(`/group/${newGroupRef.id}`);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#2b2d31] p-6 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-4">Create a New Group</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Group Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#1E1F22] p-2 rounded-md mt-1" required />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} id="is-private" />
                        <label htmlFor="is-private" className="text-sm">Private Group</label>
                    </div>
                    {isPrivate && (
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#1E1F22] p-2 rounded-md mt-1" required />
                        </div>
                    )}
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="bg-gray-600 px-4 py-2 rounded-md">Cancel</button>
                        <button type="submit" className="bg-[#5865F2] px-4 py-2 rounded-md">Create</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const GroupDiscoveryPage: React.FC<{ user: User, profile: Profile }> = ({ user, profile }) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch public groups
        const unsubscribe = db.collection('groups').where('isPrivate', '==', false).onSnapshot(snapshot => {
            const groupList = snapshot.docs.map(doc => doc.data() as Group);
            setGroups(groupList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleJoinGroup = async (group: Group) => {
        await db.collection('groups').doc(group.id).update({
            members: firebase.firestore.FieldValue.arrayUnion(user.uid)
        });
        navigate(`/group/${group.id}`);
    };

    return (
        <div className="min-h-screen bg-[#313338] text-white p-8">
            <AnimatePresence>
                {showCreateModal && <CreateGroupModal user={user} onClose={() => setShowCreateModal(false)} />}
            </AnimatePresence>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Discover Groups</h1>
                    <p className="text-gray-400">Join a community or create your own.</p>
                </div>
                 <div className="flex items-center space-x-4">
                    <span className="font-semibold">Welcome, {profile.displayName}</span>
                    <button onClick={() => auth.signOut()} className="bg-red-600 px-4 py-2 rounded-md text-sm">Logout</button>
                    <button onClick={() => setShowCreateModal(true)} className="bg-[#5865F2] px-4 py-2 rounded-md font-semibold">
                        + Create Group
                    </button>
                </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? <p>Loading groups...</p> : groups.map(group => (
                    <motion.div key={group.id} whileHover={{ y: -5 }} className="bg-[#2b2d31] p-4 rounded-lg shadow-lg flex flex-col">
                        <div className="flex items-center mb-2">
                            <img src={group.iconUrl} alt={group.name} className="w-12 h-12 rounded-full mr-4"/>
                            <h3 className="font-bold text-lg flex-1">{group.name}</h3>
                        </div>
                        <p className="text-sm text-gray-400 flex-1 mb-4">{group.members.length} members</p>
                        {group.members.includes(user.uid) ? (
                             <Link to={`/group/${group.id}`} className="w-full text-center mt-auto bg-green-600 p-2 rounded-md text-sm font-semibold">
                                Open
                            </Link>
                        ) : (
                            <button onClick={() => handleJoinGroup(group)} className="w-full mt-auto bg-[#5865F2] p-2 rounded-md text-sm font-semibold">
                                Join Group
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default GroupDiscoveryPage;
