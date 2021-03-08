import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { calculatePlayTime, peekFirstListItem } from "./utils";
import { Track } from "./interfaces";
export default functions.database
  .ref("music/{roomID}/nowplaying")
  .onDelete(async (snapshot, context) => {
    const { roomID } = context.params;
    const queueRef = admin.database().ref(`music/${roomID}/queue`);
    const roomNowPlayingRef = admin
      .database()
      .ref(`rooms/${roomID}/nowplaying`);
    const [trackID, trackInfo] = await peekFirstListItem<Track>(queueRef);
    if (trackInfo && trackID) {
      const [startTime, endTime] = calculatePlayTime(trackInfo.duration);
      try {
        await snapshot.ref.set({
          [trackID]: {
            ...trackInfo,
            startTime,
            endTime,
            status: "playing",
            rescrape: false,
          },
        }); // set the first song in the queue as nowplaying using original trackID
        await queueRef.child(trackID).remove(); // remove nowplaying song from queue
      } catch (err) {
        console.error(
          "Something happened when queueing up next song",
          err.message
        );
      }

      // set room preview of nowplaying
      return roomNowPlayingRef.update({
        artist: trackInfo.artist,
        title: trackInfo.title,
        albumArt: trackInfo.albumArt,
      });
    } else {
      return roomNowPlayingRef.remove(); // remove preview if no track next in queue
    }
  });
