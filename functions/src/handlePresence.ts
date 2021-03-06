import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Track } from "./interfaces";
import { calculatePlayTime, peekFirstListItem } from "./utils";
export const incrementOnline = functions.database
  .ref("status/{roomID}/{uid}")
  .onCreate((snapshot, context) => {
    const onlineCountRef = admin
      .database()
      .ref(`rooms/${context.params.roomID}/online`);
    return onlineCountRef.set(admin.database.ServerValue.increment(1));
  });

export const decrementOnline = functions.database
  .ref("status/{roomID}/{uid}")
  .onDelete((snapshot, context) => {
    const onlineCountRef = admin
      .database()
      .ref(`rooms/${context.params.roomID}/online`);
    return onlineCountRef.set(admin.database.ServerValue.increment(-1));
  });

/**
 * When the last user leaves a room:
 *  (1) save current playback time
 *  (2) set track to paused
 */
export const savePlayback = functions.database
  .ref("status/{roomID}")
  .onDelete(async (snapshot, context) => {
    const nowPlayingRef = admin
      .database()
      .ref(`music/${context.params.roomID}/nowplaying`);
    const [trackID, trackInfo] = await peekFirstListItem<Track>(nowPlayingRef);
    if (trackInfo?.startTime && trackID) {
      const resumeDuration = Date.now() - trackInfo.startTime;
      return nowPlayingRef
        .child(trackID)
        .update({ status: "paused", resumeDuration });
    }
  });

/**
 * When a room is empty and a user enters:
 *  (1) recaculate start and end time for nowplaying
 *  (2) TODO: Check bandcamp token with current time and rescrape if needed
 */
export const resumePlayback = functions.database
  .ref("status/{roomID}")
  .onCreate(async (snapshot, context) => {
    const nowPlayingRef = admin
      .database()
      .ref(`music/${context.params.roomID}/nowplaying`);
    const [trackID, trackInfo] = await peekFirstListItem<Track>(nowPlayingRef);
    if (trackInfo && trackID) {
      const { resumeDuration, duration } = trackInfo;
      const [startTime, endTime] = calculatePlayTime(duration, resumeDuration);
      await nowPlayingRef.child(`${trackID}/resumeDuration`).remove();
      return nowPlayingRef
        .child(trackID)
        .update({ status: "playing", startTime, endTime });
    }
  });
