import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import ServerList from '../components/ServerList';
import ChannelList from '../components/ChannelList';
import ChatRoom from '../components/ChatRoom';
import type { User, Profile, Group, Channel } from '../types';

interface GroupPageProps {
  user: User;
  profile: Profile;
}

const GroupPage: React.FC<GroupPageProps> = ({ user, profile }) => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    // Fetch current group details
    const groupUnsubscribe = db.collection('groups').doc(groupId).onSnapshot(doc => {
        if (doc.exists) {
            const groupData = doc.data() as Group;
            if (!groupData.members.includes(user.uid)) {
                // User is not a member, redirect
                navigate('/groups');
                return;
            }
            setCurrentGroup(groupData);
        } else {
            // Group doesn't exist
             navigate('/groups');
        }
        setLoading(false);
    });

    // Fetch channels for the group
    const channelsUnsubscribe = db.collection('groups').doc(groupId).collection('channels').onSnapshot(snapshot => {
        const channelList = snapshot.docs.map(doc => doc.data() as Channel);
        setChannels(channelList);
        if (channelList.length > 0 && !currentChannel) {
            setCurrentChannel(channelList[0]);
        }
    });

    return () => {
        groupUnsubscribe();
        channelsUnsubscribe();
    }
  }, [groupId, user.uid, navigate, currentChannel]);

  if (loading || !currentGroup) {
      return <div className="flex h-screen bg-[#1E1F22] items-center justify-center text-white">Loading Group...</div>
  }

  return (
    <div className="flex h-screen font-sans bg-[#2b2d31] text-gray-200">
      <ServerList user={user} />
      <ChannelList 
        user={user} 
        profile={profile}
        group={currentGroup}
        channels={channels}
        currentChannel={currentChannel}
        setCurrentChannel={setCurrentChannel}
      />
      <main className="flex-1 flex flex-col bg-[#313338]">
        {currentChannel ? (
            <ChatRoom 
                groupId={currentGroup.id} 
                channel={currentChannel}
                user={user}
                profile={profile}
            />
        ) : (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400">Select a channel to start chatting.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default GroupPage;
