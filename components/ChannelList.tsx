import React from 'react';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import type { User, Profile, Group, Channel } from '../types';

interface ChannelListProps {
  user: User;
  profile: Profile;
  group: Group;
  channels: Channel[];
  currentChannel: Channel | null;
  setCurrentChannel: (channel: Channel) => void;
}

const ChannelList: React.FC<ChannelListProps> = ({ user, profile, group, channels, currentChannel, setCurrentChannel }) => {
  const handleLogout = () => {
    auth.signOut();
  };

  const UserAvatar: React.FC<{ profile: Profile }> = ({ profile }) => (
    <img
      src={profile.photoURL}
      alt={profile.displayName}
      className="w-10 h-10 rounded-full"
    />
  );

  return (
    <div className="w-64 bg-[#2b2d31] flex flex-col">
      {/* Group Header */}
      <header className="p-4 font-bold text-lg shadow-md border-b border-black/20">{group.name}</header>
      
      {/* Channel List */}
      <div className="flex-1 p-2 overflow-y-auto">
        <h2 className="text-xs font-bold text-gray-400 uppercase px-2 mb-2">Text Channels</h2>
        <ul className="space-y-1">
          {channels.map((channel) => (
            <li key={channel.id}>
              <button
                onClick={() => setCurrentChannel(channel)}
                className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-left transition-colors ${
                  currentChannel?.id === channel.id
                    ? 'bg-[#404249] text-white'
                    : 'text-gray-400 hover:bg-[#36373d] hover:text-gray-200'
                }`}
              >
                <span className="text-xl text-gray-500">#</span>
                <span className="font-medium">{channel.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* User Info & Logout */}
      <div className="flex items-center justify-between p-2 bg-[#232428]">
        <div className="flex items-center space-x-2 overflow-hidden">
          <UserAvatar profile={profile} />
          <div className="flex flex-col text-sm overflow-hidden">
              <span className="font-semibold text-white truncate">{profile.displayName}</span>
              <span className="text-xs text-gray-400 truncate">{profile.bio || 'No bio'}</span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLogout}
          title="Logout"
          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a1 1 0 011 1v5a1 1 0 11-2 0V3a1 1 0 011-1zM4.032 4.032a1 1 0 011.414 0l1.06 1.06a1 1 0 01-1.414 1.414l-1.06-1.06a1 1 0 010-1.414zm10.936 0a1 1 0 010 1.414l-1.06 1.06a1 1 0 01-1.414-1.414l1.06-1.06a1 1 0 011.414 0zM17 10a1 1 0 01-1 1h-5a1 1 0 110-2h5a1 1 0 011 1z" />
            <path fillRule="evenodd" d="M3 10a7 7 0 1111.493 5.432c.323.323.323.847 0 1.17l-1.17 1.17a.833.833 0 01-1.17 0l-1.65-1.65a5 5 0 00-7.07-7.07l-1.65-1.65a.833.833 0 010-1.17l1.17-1.17a.833.833 0 011.17 0L5.43 3.507A7.002 7.002 0 013 10z" clipRule="evenodd" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

export default ChannelList;
