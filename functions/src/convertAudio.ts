import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import scrapeBandcamp from "./scrapeBandcamp";
import { calculatePlayTime } from "./utils";
import { Track } from "./interfaces";

export default functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Can only suggest music if authenticated."
    );
  }

  const { url, roomID } = data;
  const extractedTrackInfo = await scrapeBandcamp(url);

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
    const nowPlayingRef = admin.database().ref(`music/${roomID}/nowplaying`);
    const snapshot = await queueRef.once("value");
    if (!snapshot.exists()) {
      const [startTime, endTime] = calculatePlayTime(
        extractedTrackInfo[0].duration
      );
      extractedTrackInfo[0].startTime = startTime;
      extractedTrackInfo[0].endTime = endTime;
      extractedTrackInfo[0].status = "playing";
      nowPlayingRef.push(extractedTrackInfo[0]); // first track now playing
      extractedTrackInfo.shift(); // remove it from the list
    }
    extractedTrackInfo.forEach((track: Track) => {
      queueRef.push(track);
    });
    return url;
  } catch (err) {
    throw new functions.https.HttpsError(
      "unknown",
      "Something happened when pushing to database.",
      err.message
    );
  }
});
