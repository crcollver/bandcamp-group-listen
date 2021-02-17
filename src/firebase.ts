import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

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
export const auth = firebase.auth();
export const roomsRef = database.ref("rooms");
export const messagesRef = database.ref("messages");
export const musicRef = database.ref("music");
export const offsetRef = database.ref(".info/serverTimeOffset");
export const createAuthProvider = () => {
  return new firebase.auth.GoogleAuthProvider();
};
export const createTimeStamp = () => {
  return firebase.database.ServerValue.TIMESTAMP;
};
