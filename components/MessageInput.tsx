import React, { useState, useRef } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db, storage } from '../firebase';
import { generateAiResponse } from '../services/geminiService';
import type { User, Profile } from '../types';

// A simple Giphy Picker component (can be expanded)
const GifPicker = ({ onSelectGif, onClose }: { onSelectGif: (url: string) => void, onClose: () => void }) => {
    // Replace with a real Giphy API call. This is a placeholder.
    const popularGifs = [
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3d2ZmlwOTFhMWFtdzJ2bWlqZm02bjl0c3A3OW05NXJ0bW8yZHJ2eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/h7dhcOkyY62s85K6h0/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGF4emRiaDE1MWFodGo0MzFpZzJ0eGFodDQ1Nmh3emZzc2J0cHd0MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/h4ksWhW4yM4A8/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExajM2Z2N2dWVscHl3aW5jMXRjZzUxb3U0eHZjcDVyMXJzcHJtY2NnayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o72FfM5HJydzafgUE/giphy.gif",
    ];
    return (
        <div className="absolute bottom-20 bg-[#2b2d31] p-4 rounded-lg shadow-2xl border border-gray-700">
            <h3 className="text-white font-semibold mb-2">Select a GIF</h3>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {popularGifs.map(url => <img key={url} src={url} className="w-full h-24 object-cover rounded cursor-pointer" onClick={() => onSelectGif(url)} />)}
            </div>
            <button onClick={onClose} className="text-xs text-gray-400 mt-2 hover:text-white">Close</button>
        </div>
    );
};

interface MessageInputProps {
  groupId: string;
  channelId: string;
  user: User;
  profile: Profile;
}

const MessageInput: React.FC<MessageInputProps> = ({ groupId, channelId, user, profile }) => {
  const [text, setText] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const addMessageToFirestore = async (content: string, type: 'user' | 'ai' | 'image' | 'voice' | 'gif') => {
      const messagesCol = db.collection('groups').doc(groupId).collection('channels').doc(channelId).collection('messages');
      await messagesCol.add({
          text: content,
          senderId: type === 'ai' ? 'gemini-bot' : user.uid,
          senderName: type === 'ai' ? 'Gemini' : profile.displayName,
          senderPhotoURL: type === 'ai' ? `https://api.dicebear.com/7.x/bottts/svg?seed=gemini` : profile.photoURL,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          type: type,
      });
  };

  const sendMessage = async () => {
    if (text.trim() === '') return;
    const currentText = text;
    setText('');
    await addMessageToFirestore(currentText, 'user');

    if (currentText.startsWith('/ai') || currentText.startsWith('@Gemini')) {
      setIsAiReplying(true);
      const prompt = currentText.replace('/ai', '').replace('@Gemini', '').trim();
      const aiResponse = await generateAiResponse(prompt);
      await addMessageToFirestore(aiResponse, 'ai');
      setIsAiReplying(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const storageRef = storage.ref(`chat_media/${groupId}/${Date.now()}_${file.name}`);
    const snapshot = await storageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();
    await addMessageToFirestore(downloadURL, 'image');
  };
  
  const handleGifSelect = async (url: string) => {
    await addMessageToFirestore(url, 'gif');
    setShowGifPicker(false);
  }
  
  const toggleRecording = () => {
    if (isRecording) {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    } else {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const audioChunks: Blob[] = [];
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const storageRef = storage.ref(`voice_messages/${groupId}/${Date.now()}.webm`);
                const snapshot = await storageRef.put(audioBlob);
                const downloadURL = await snapshot.ref.getDownloadURL();
                await addMessageToFirestore(downloadURL, 'voice');
                stream.getTracks().forEach(track => track.stop()); // Stop microphone access
            };
            mediaRecorder.start();
            setIsRecording(true);
        }).catch(err => console.error("Microphone access denied:", err));
    }
  };

  return (
    <div className="px-4 pb-4 relative">
      {isAiReplying && (<div className="text-xs text-gray-400 mb-1">Gemini is typing...</div>)}
      {showGifPicker && <GifPicker onSelectGif={handleGifSelect} onClose={() => setShowGifPicker(false)} />}
      <div className="bg-[#404249] rounded-lg flex items-center px-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none py-3"
          disabled={isAiReplying || isRecording}
        />
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
        
        {/* Action Buttons */}
        <button onClick={toggleRecording} className={`p-2 ${isRecording ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        </button>
        <button onClick={() => setShowGifPicker(!showGifPicker)} className="text-gray-400 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 1a1 1 0 000 2h3a1 1 0 000-2H6zM6 9a1 1 0 000 2h6a1 1 0 100-2H6zm5 3a1 1 0 100 2h.01a1 1 0 100-2H11z" clipRule="evenodd" /></svg>
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </button>
        <button onClick={sendMessage} className="text-gray-400 hover:text-white p-2" disabled={isAiReplying || !text.trim()}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 12h14" /></svg>
        </button>
      </div>
    </div>
  );
};

export default MessageInput;