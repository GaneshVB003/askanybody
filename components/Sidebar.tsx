
import React from 'react';
// import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import type { User, Room } from '../types';

interface SidebarProps {
  user: User;
  rooms: Room[];
  currentRoom: Room;
  setCurrentRoom: (room: Room) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, rooms, currentRoom, setCurrentRoom }) => {
  const handleLogout = () => {
    // FIX: Use v8 auth.signOut() method
    auth.signOut();
  };

  const UserAvatar: React.FC<{ user: User }> = ({ user }) => (
    <img
      src={user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`}
      alt={user.displayName || 'User Avatar'}
      className="w-10 h-10 rounded-full"
    />
  );

  return (
    <div className="w-64 bg-[#1E1F22] flex flex-col p-3 space-y-4">
      <div className="text-white font-bold text-xl px-2">Gemini Chat</div>
      
      {/* Room List */}
      <div className="flex-1">
        <h2 className="text-xs font-bold text-gray-400 uppercase px-2 mb-2">Text Channels</h2>
        <ul className="space-y-1">
          {rooms.map((room) => (
            <li key={room.id}>
              <button
                onClick={() => setCurrentRoom(room)}
                className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-left transition-colors ${
                  currentRoom.id === room.id
                    ? 'bg-[#404249] text-white'
                    : 'text-gray-400 hover:bg-[#36373d] hover:text-gray-200'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">{room.icon}</div>
                <span className="font-medium">{room.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* User Info & Logout */}
      <div className="flex items-center justify-between p-2 bg-[#232428] rounded-lg">
        <div className="flex items-center space-x-2">
          <UserAvatar user={user} />
          <span className="text-sm font-semibold text-white truncate">
            {user.isAnonymous ? `Guest-${user.uid.substring(0,5)}` : user.displayName}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLogout}
          title="Logout"
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5h10a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414L8.586 11l-3.293 3.293a1 1 0 101.414 1.414L10 12.414l3.293 3.293a1 1 0 001.414-1.414L11.414 11l3.293-3.293z" clipRule="evenodd" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar;
