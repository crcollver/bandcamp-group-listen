export interface Track {
  audioSrc: string;
  albumArt: string;
  artist: string;
  albumTitle: string;
  title: string;
  duration: number;
  originalUrl: string;
  id: string;
  startTime?: number;
  endTime?: number;
  status: string;
}

export interface Message {
  name: string;
  uid: string;
  message: string;
  messageID: string;
  sentAt: number;
}

export interface Room {
  id: string;
  title: string;
}

export interface ListUser {
  id: string;
  name: string;
  photo: string;
}

export interface PlayerStatus {
  volume: number;
  hasEnded: boolean;
  isMuted: boolean;
  currentTime: string;
  duration: string;
}
