import React, { useRef, useEffect } from 'react';
import useFirebaseChat from '../hooks/useFirebaseChat';
import MessageInput from './MessageInput';
import MessageBubble from './MessageBubble';
import { motion, AnimatePresence } from 'framer-motion';
import type { User, Profile, Channel } from '../types';

interface ChatRoomProps {
  groupId: string;
  channel: Channel;
  user: User;
  profile: Profile;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ groupId, channel, user, profile }) => {
  const { messages, loading } = useFirebaseChat(groupId, channel.id);
  const bottomOfChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ChatHeader: React.FC<{ channel: Channel }> = ({ channel }) => (
    <div className="flex items-center p-3 border-b border-[#26282b] shadow-md">
      <span className="text-gray-500 text-2xl mr-2">#</span>
      <h2 className="text-lg font-semibold text-white">{channel.name}</h2>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader channel={channel} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && <div className="text-center text-gray-400">Loading messages...</div>}
        <AnimatePresence>
          {messages.map((msg, index) => (
             <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
            >
               <MessageBubble message={msg} currentUser={user} />
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomOfChatRef} />
      </div>
      <MessageInput groupId={groupId} channelId={channel.id} user={user} profile={profile} />
    </div>
  );
};

export default ChatRoom;
