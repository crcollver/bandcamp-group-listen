import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

export const app = firebase.initializeApp({
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
});

firebase.database.enableLogging(true);

const database = firebase.database();
export const auth = firebase.auth();
export const roomsRef = database.ref("rooms");
export const messagesRef = database.ref("messages");
export const convertRef = database.ref("convertQueue");
export const musicRef = database.ref("musicQueue");
export const createAuthProvider = () => {
  return new firebase.auth.GoogleAuthProvider();
};
export const createTimeStamp = () => {
  return firebase.database.ServerValue.TIMESTAMP;
};
