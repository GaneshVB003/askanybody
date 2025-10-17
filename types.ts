import type React from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

export type Timestamp = firebase.firestore.Timestamp;
export interface User extends firebase.User {}

export type MessageType = "user" | "ai" | "image" | "voice" | "gif";

export interface Message {
  id: string;
  text: string; // URL for image, voice, gif
  senderId: string;
  senderName: string;
  senderPhotoURL: string | null;
  timestamp: Timestamp;
  type: MessageType;
}

export interface Channel {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  ownerId: string;
  isPrivate: boolean;
  iconUrl?: string;
  members: string[];
}

export interface Profile {
    uid: string;
    displayName: string;
    bio: string;
    photoURL: string;
}

// FIX: Add Room interface for legacy ChatPage
export interface Room {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export interface UserStatus {
    status: 'online' | 'offline';
    last_changed: Timestamp;
}
