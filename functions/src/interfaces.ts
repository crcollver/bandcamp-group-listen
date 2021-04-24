export interface Track {
  audioSrc: string;
  albumArt: string;
  artist: string;
  albumTitle: string | null;
  title: string;
  duration: number;
  trackUrl: string;
  expires: string;
  status: string;
  rescrape?: boolean;
  startTime?: number;
  endTime?: number;
  resumeDuration?: number;
}

export interface TrackPreview {
  albumArt: string;
  title: string;
  artist: string;
}
