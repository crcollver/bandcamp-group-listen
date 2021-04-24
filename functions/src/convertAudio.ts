import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import scrapeBandcamp from "./scrapeBandcamp";
import { calculatePlayTime } from "./utils";
import { Track } from "./interfaces";

// pull the function out so it's easier to test
export const convertAudio = async (data: any) => {
  const { url, roomID } = data;
  let extractedTrackInfo: Track[] = [];
  try {
    extractedTrackInfo = await scrapeBandcamp(url);
  } catch (e) {
    throw new functions.https.HttpsError("invalid-argument", e.message);
  }

  if (extractedTrackInfo.length === 0) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "There was no audio source associated with the track info on this link."
    );
  }

  // determine if there are any tracks in queue
  // if there are, set start, end, and status for track requested
  // then push that audio to the appropriate now playing for the room
  try {
    const queueRef = admin.database().ref(`music/${roomID}/queue`);
    const roomNowPlayingRef = admin
      .database()
      .ref(`rooms/${roomID}/nowplaying`);
    const nowPlayingRef = admin.database().ref(`music/${roomID}/nowplaying`);
    const snapshot = await queueRef.limitToFirst(1).once("value");
    if (!snapshot.exists()) {
      const [startTime, endTime] = calculatePlayTime(
        extractedTrackInfo[0].duration
      );
      nowPlayingRef.push({
        ...extractedTrackInfo[0],
        startTime,
        endTime,
        status: "playing",
        rescrape: false,
      }); // first track now playing
      roomNowPlayingRef.update({
        artist: extractedTrackInfo[0].artist,
        title: extractedTrackInfo[0].title,
        albumArt: extractedTrackInfo[0].albumArt,
      }); // set a preview on the room node for easy retrieval
      extractedTrackInfo.shift(); // remove it from the queue
    }
    extractedTrackInfo.forEach((track: Track) => {
      queueRef.push(track); // push remaining tracks (if any) to queue
    });
    return url;
  } catch (err) {
    throw new functions.https.HttpsError(
      "unknown",
      "Something happened when pushing to database.",
      err.message
    );
  }
};

export default functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Can only suggest music if authenticated."
    );
  }
  convertAudio(data);
});
