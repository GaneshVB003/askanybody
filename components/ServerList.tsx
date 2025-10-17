import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import type { User, Group } from '../types';
import { motion } from 'framer-motion';

interface ServerListProps {
    user: User;
}

const ServerList: React.FC<ServerListProps> = ({ user }) => {
    const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
    const { groupId: activeGroupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = db.collection('groups').where('members', 'array-contains', user.uid).onSnapshot(snapshot => {
            const groups = snapshot.docs.map(doc => doc.data() as Group);
            setJoinedGroups(groups);
        });
        return () => unsubscribe();
    }, [user.uid]);

    return (
        <div className="w-20 bg-[#1E1F22] flex flex-col items-center py-3 space-y-3">
             <ServerIcon 
                icon={<span>🏠</span>} 
                label="Home" 
                isActive={false}
                onClick={() => navigate('/groups')}
            />
            <div className="w-8 h-px bg-gray-700" />
            {joinedGroups.map(group => (
                 <Link to={`/group/${group.id}`} key={group.id}>
                    <ServerIcon 
                        icon={<img src={group.iconUrl} alt={group.name} className="w-full h-full object-cover" />} 
                        label={group.name}
                        isActive={activeGroupId === group.id}
                    />
                </Link>
            ))}
        </div>
    );
};

const ServerIcon = ({ icon, label, isActive, onClick }: { icon: React.ReactNode; label: string, isActive: boolean, onClick?: () => void }) => (
    <div className="relative group">
        <motion.div 
            className="absolute left-0 h-0 w-1 bg-white rounded-r-full transition-all duration-200"
            animate={{ height: isActive ? '2.5rem' : '0.5rem' }}
            whileHover={{ height: '1.5rem' }}
         />
        <motion.div
            whileHover={{ scale: 1.1, borderRadius: '1rem' }}
            whileTap={{ scale: 0.9 }}
            animate={{ borderRadius: isActive ? '1rem' : '9999px' }}
            className={`w-12 h-12 flex items-center justify-center text-white text-xl overflow-hidden cursor-pointer transition-all duration-200 ${isActive ? 'bg-[#5865F2]' : 'bg-[#313338] hover:bg-[#5865F2]'}`}
            onClick={onClick}
        >
            {icon}
        </motion.div>
         <span className="absolute left-16 w-auto p-2 min-w-max rounded-md shadow-md text-white bg-black text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100">
            {label}
        </span>
    </div>
);


export default ServerList;
