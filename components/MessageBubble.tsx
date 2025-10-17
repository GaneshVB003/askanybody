import React from 'react';
import { formatTimestamp } from '../utils/formatTimestamp';
import type { Message, User } from '../types';

interface MessageBubbleProps {
  message: Message;
  currentUser: User;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUser }) => {
  const { text, senderId, senderName, senderPhotoURL, timestamp, type } = message;
  const isCurrentUser = senderId === currentUser.uid;
  const isAi = type === 'ai';

  const bubbleStyles = {
    user: 'bg-[#5865F2] text-white self-end',
    ai: 'bg-[#9B59B6] text-white self-start',
    other: 'bg-[#404249] text-gray-200 self-start',
    media: 'bg-transparent p-0',
  };

  const getBubbleClass = () => {
    if (type === 'image' || type === 'gif' || type === 'voice') return bubbleStyles.media;
    if (isAi) return bubbleStyles.ai;
    return isCurrentUser ? bubbleStyles.user : bubbleStyles.other;
  };
  
  const UserAvatar: React.FC<{ photoURL: string | null; name: string }> = ({ photoURL, name }) => (
    <img
      src={photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`}
      alt={name}
      className="w-10 h-10 rounded-full mr-4"
    />
  );

  const renderContent = () => {
    switch (type) {
        case 'image':
            return <img src={text} alt="Uploaded content" className="rounded-lg max-w-xs max-h-64 cursor-pointer" onClick={() => window.open(text, '_blank')} />;
        case 'gif':
            return <img src={text} alt="GIF content" className="rounded-lg max-w-xs max-h-64" />;
        case 'voice':
            return <audio controls src={text} className="w-64" />;
        default:
            return <p className="whitespace-pre-wrap px-4 py-2">{text}</p>;
    }
  }

  return (
    <div className={`flex items-start my-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      {!isCurrentUser && <UserAvatar photoURL={senderPhotoURL} name={senderName} />}
      <div className="flex flex-col">
        <div className={`flex items-baseline mb-1 ${isCurrentUser ? 'self-end' : ''} ${isCurrentUser ? 'mr-2' : ''}`}>
          <span className="font-semibold text-white mr-2">{senderName}</span>
          <span className="text-xs text-gray-500">
            {timestamp ? formatTimestamp(timestamp) : '...'}
          </span>
        </div>
        <div className={`rounded-lg max-w-lg ${getBubbleClass()}`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;