import * as admin from "firebase-admin";
import { convertAudio } from "../../convertAudio";
import { Track } from "../../interfaces";
import { knownGoodSingleUrls } from "../testHelpers";

export default (adminDB: admin.database.Database) => {
  const params = {
    roomID: "alternative",
    url: knownGoodSingleUrls[1],
  };
  const nowPlayingRef = adminDB.ref(`music/${params.roomID}/nowplaying`);
  let trackRef: admin.database.Reference;
  let currentTrack: Track;

  beforeAll(async () => {
    await convertAudio(params);
    const snapshot = await nowPlayingRef.once("value");
    const nowPlayingKeys = Object.keys(snapshot.val());
    const trackID = nowPlayingKeys[0];
    currentTrack = snapshot.child(trackID).val();
    trackRef = nowPlayingRef.child(trackID);
  });

  afterAll(async () => {
    await adminDB.ref().set(null);
  });

  // (1) Test that when rescrape is true, and expected end time is < expire time
  //  the function modifies nothing and rescrape is reset to false
  test("should not rescrape and should set flag to false", async (done) => {
    await trackRef.child("rescrape").set(true);
    trackRef.on("value", (snap) => {
      const notUpdatedTrack: Track = snap.val();
      if (
        notUpdatedTrack.audioSrc === currentTrack.audioSrc &&
        notUpdatedTrack.expires === currentTrack.expires &&
        !notUpdatedTrack.rescrape
      ) {
        trackRef.off();
        done();
      }
    });
  });

  // (2) Test that when rescrape is true, and expected end time is >= expire time
  //  update should take place, flag should reset
  test("track should have new audiosrc and expire time", async (done) => {
    // set expire time to 25 hours in the past, to ensure rescrape
    await trackRef.child("expires").set(currentTrack.expires - 90000);
    await trackRef.child("rescrape").set(true);
    trackRef.on("value", (snap) => {
      const updatedTrack: Track = snap.val();
      if (
        updatedTrack.audioSrc !== currentTrack.audioSrc &&
        updatedTrack.expires > currentTrack.expires &&
        !updatedTrack.rescrape
      ) {
        currentTrack = updatedTrack;
        trackRef.off();
        done();
      }
    });
  });

  // (3) In case the audio url is removed, the function modifies nothing and rescrape
  //  is reset to false
  test("track should reset rescrape to false", async (done) => {
    await trackRef.child("trackUrl").remove();
    await trackRef.child("rescrape").set(true);
    trackRef.on("value", (snap) => {
      const notUpdatedTrack: Track = snap.val();
      if (
        notUpdatedTrack.expires === currentTrack.expires &&
        notUpdatedTrack.audioSrc === currentTrack.audioSrc &&
        !notUpdatedTrack.rescrape
      ) {
        trackRef.off();
        done();
      }
    });
  });
};
