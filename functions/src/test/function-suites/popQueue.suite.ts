import firebase from "firebase";

export default (adminDB: firebase.database.Database) => {
  const nowPlayingRef = adminDB.ref("music/alternative/nowplaying");
  const roomNowPlayingRef = adminDB.ref("rooms/alternative/nowplaying");
  const queueRef = adminDB.ref("music/alternative/queue");
  const duration = 195;

  const song = {
    title: "foo",
    artist: "bar",
  };
  const queuedSong = {
    title: "foo2",
    artist: "bar2",
    albumArt: "https://f4.bcbits.com/img/a4032137264_16.jpg",
    duration,
  };

  describe("the queue is empty", () => {
    beforeAll(async () => {
      await nowPlayingRef.child("song1").set(song);
      await roomNowPlayingRef.set(song);
      await nowPlayingRef.remove();
    });
    afterAll(async () => {
      await adminDB.ref().set(null);
    });

    // if an empty queue, then preview in room details should be empty
    test("preview should be empty", (done) => {
      roomNowPlayingRef.on("value", (snap) => {
        if (!snap.exists()) {
          roomNowPlayingRef.off();
          done();
        }
      });
    });

    // nowplaying should not exist if queue is empty
    test("nowplaying should be empty", (done) => {
      nowPlayingRef.on("value", (snap) => {
        if (!snap.exists()) {
          roomNowPlayingRef.off();
          done();
        }
      });
    });
  });

  describe("the queue is not empty", () => {
    beforeAll(async () => {
      await nowPlayingRef.child("song1").set(song);
      await roomNowPlayingRef.set(song);
      await queueRef.child("song2").set(queuedSong);
      await nowPlayingRef.remove();
    });
    afterAll(async () => {
      await adminDB.ref().set(null);
    });

    // the first song in the queue should be playing
    test("first in queue is now playing", (done) => {
      nowPlayingRef.child("song2").on("value", (snap) => {
        const newTrack = snap.val();
        if (
          newTrack?.status === "playing" &&
          newTrack.startTime &&
          newTrack.endTime &&
          newTrack.rescrape !== undefined &&
          !newTrack.rescrape
        ) {
          nowPlayingRef.off();
          done();
        }
      });
    });

    test("queue is now empty", (done) => {
      queueRef.on("value", (snap) => {
        if (!snap.exists()) {
          queueRef.off();
          done();
        }
      });
    });

    test("room preview reflects song change", (done) => {
      roomNowPlayingRef.on("value", (snap) => {
        const preview = snap.val();
        if (
          preview?.artist === queuedSong.artist &&
          preview?.title === queuedSong.title &&
          preview?.albumArt === queuedSong.albumArt
        )
          roomNowPlayingRef.off();
        done();
      });
    });
  });
};
