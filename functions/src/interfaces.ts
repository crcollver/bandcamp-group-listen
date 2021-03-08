export interface Track {
  audioSrc: string;
  albumArt: string;
  artist: string;
  albumTitle: string | null;
  title: string;
  duration: number;
  trackUrl: string;
  status: string;
  startTime?: number;
  endTime?: number;
  resumeDuration?: number;
}
