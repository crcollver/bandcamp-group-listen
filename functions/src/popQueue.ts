import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { calculatePlayTime } from "./utils";
import { Track } from "./interfaces";
export default functions.database
  .ref("music/{roomID}/nowplaying")
  .onDelete(async (snapshot, context) => {
    const { roomID } = context.params;
    const queueRef = admin.database().ref(`music/${roomID}/queue`);
    try {
      const nextTrackSnap = await queueRef.limitToFirst(1).once("value");
      if (nextTrackSnap.exists()) {
        // snapshot is a list, must use a forEach to access children properties
        // reuse auto-gen firebase ID from queue inside nowplaying
        let trackID: string = "";
        nextTrackSnap.forEach((childSnapshot) => {
          trackID = childSnapshot.key!; // key cannot be null if snapshot exists
        });

        // construct trackInfo object
        let trackInfo: Track = { ...nextTrackSnap.val()[trackID] };
        const [startTime, endTime] = calculatePlayTime(trackInfo.duration);
        trackInfo = { ...trackInfo, startTime, endTime };

        await snapshot.ref.set({
          [trackID]: {
            ...trackInfo,
            status: "playing",
          },
        }); // set the first song in the queue as nowplaying
        await queueRef.child(trackID).remove(); // remove nowplaying song from queue
      }
    } catch (err) {
      console.error(
        "Something happened when queueing up next song",
        err.message
      );
    }
  });
