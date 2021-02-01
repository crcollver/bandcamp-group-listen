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
