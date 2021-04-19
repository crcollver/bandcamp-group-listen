import * as tests from "@firebase/rules-unit-testing";
import firebase from "firebase";

process.env.FIREBASE_DATABASE_EMULATOR_HOST = "localhost:9000";
const PROJECT_ID = "music-chat-development-default-rtdb";
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

interface Auth {
  uid: string;
  name: string;
  email: string;
}
export const useDB = (userAuth: Auth | null) => {
  return tests
    .initializeTestApp({
      databaseName: PROJECT_ID,
      auth: userAuth ? userAuth : undefined,
    })
    .database();
};

/**
 * Firebase.apps() does not presently clean up any admin app inits
 * Returning the app instance allows for proper clean up
 * @returns [firebase admin app, firebase admin db]
 */
export const useAdmin = (): [firebase.app.App, firebase.database.Database] => {
  const app = tests.initializeAdminApp({ databaseName: PROJECT_ID });
  const db = app.database();
  return [app, db];
};
