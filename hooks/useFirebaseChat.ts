import { useState, useEffect } from 'react';
import { db } from '../firebase';
import type { Message, Timestamp } from '../types';

const useFirebaseChat = (groupId: string, channelId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !channelId) {
        setMessages([]);
        return;
    };

    setLoading(true);
    const unsubscribe = db.collection('groups').doc(groupId).collection('channels').doc(channelId).collection('messages').orderBy('timestamp', 'asc').onSnapshot((querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId, channelId]);

  return { messages, loading };
};

export default useFirebaseChat;