

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatRoom from '../components/ChatRoom';
// FIX: Import Profile to create a mock profile for ChatRoom
import type { User, Room, Profile } from '../types';

interface ChatPageProps {
  user: User;
}

const GeneralIcon = () => <span className="text-2xl">#</span>;
const AiHelpIcon = () => <span className="text-2xl">🤖</span>;
const RandomIcon = () => <span className="text-2xl">🎲</span>;

const initialRooms: Room[] = [
    { id: 'general', name: 'general', icon: <GeneralIcon /> },
    { id: 'ai-help', name: 'ai-help', icon: <AiHelpIcon /> },
    { id: 'random', name: 'random', icon: <RandomIcon /> },
];


const ChatPage: React.FC<ChatPageProps> = ({ user }) => {
  const [currentRoom, setCurrentRoom] = useState<Room>(initialRooms[0]);

  // FIX: Create a mock profile from user to satisfy ChatRoom's props
  const mockProfile: Profile = {
    uid: user.uid,
    displayName: user.displayName || (user.isAnonymous ? `Guest-${user.uid.substring(0, 5)}` : 'User'),
    photoURL: user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`,
    bio: '',
  };

  return (
    <div className="flex h-screen font-sans bg-[#2b2d31] text-gray-200">
      <Sidebar user={user} rooms={initialRooms} currentRoom={currentRoom} setCurrentRoom={setCurrentRoom} />
      <main className="flex-1 flex flex-col bg-[#313338]">
        {/* FIX: Pass required props to ChatRoom component */}
        <ChatRoom 
          groupId="default-group" 
          channel={currentRoom} 
          user={user} 
          profile={mockProfile} 
        />
      </main>
    </div>
  );
};

export default ChatPage;
