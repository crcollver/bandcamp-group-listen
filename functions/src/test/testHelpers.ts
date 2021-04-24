export const PROJECT_ID = "music-chat-development-default-rtdb";
export const DATABASE_URL =
  "http://localhost:9000/?ns=music-chat-development-default-rtdb";

export const myAuth = {
  uid: "myUserID",
  name: "Test User",
  email: "test@gmail.com",
};

export const FIXED_SYSTEM_TIME = 1616184030408;
export const getDateNowSeconds = () => {
  return Math.floor(Date.now() / 1000);
};

// with multiple tracks per link
export const knownGoodAlbumUrls = [
  "https://shashawman.bandcamp.com/",
  "https://shashawman.bandcamp.com/album/if-youre-swingin-youre-swangin-single",
  "https://pile.bandcamp.com/album/pile-audiotree-live",
];

// with a single track per link, not part of larger album
export const knownGoodSingleUrls = [
  "https://pile.bandcamp.com/track/my-employer-alternate-version",
  "https://vanderhuge.bandcamp.com/track/keyboard",
];

// where trackinfo exists, but no audio is available
export const noAudioUrls = [
  "https://pile.bandcamp.com/album/glow",
  "https://pile.bandcamp.com/album/live-at-third-man-records",
];

// where no playable tracks exist
export const badUrls = [
  "https://shashawman.bandcamp.com/music",
  "https://protomartyr.bandcamp.com/",
];
