import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import scrapeBandcamp from "./scrapeBandcamp";
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

  // determine if track is only track in queue
  // if it is, set start, end and status accordingly
  // then push that audio to the appropriate queue for the room
  try {
    const queueRef = admin.database().ref(`queue/${roomID}`);
    const snapshot = await queueRef.once("value");
    if (!snapshot.exists()) {
      const startTime = Date.now();
      const endTime = startTime + extractedTrackInfo[0].duration * 1000;
      extractedTrackInfo[0].startTime = startTime;
      extractedTrackInfo[0].endTime = endTime;
      extractedTrackInfo[0].status = "playing";
    }
    extractedTrackInfo.forEach((track: Track) => {
      queueRef.push(track);
    });
    return url;
  } catch (err) {
    throw new functions.https.HttpsError("unknown", err.message, err);
  }
});
