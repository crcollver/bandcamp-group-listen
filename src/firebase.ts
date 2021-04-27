import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/functions";

export const app = firebase.initializeApp({
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_FIREBASE_APP_ID,
});

firebase.database.enableLogging(true);

const database = firebase.database();
const functions = firebase.functions();

if (location.hostname === "localhost") {
  database.useEmulator("localhost", 9000);
  functions.useEmulator("localhost", 5001);
}

export const convertAudio = functions.httpsCallable("convertAudio");
export const auth = firebase.auth();
export const roomsRef = database.ref("rooms");
export const messagesRef = database.ref("messages");
export const musicRef = database.ref("music");
export const statusRef = database.ref("status");
export const offsetRef = database.ref(".info/serverTimeOffset");
export const connectedRef = database.ref(".info/connected");
export const createAuthProvider = () => {
  return new firebase.auth.GoogleAuthProvider();
};
export const createTimeStamp = () => {
  return firebase.database.ServerValue.TIMESTAMP;
};
