import * as admin from "firebase-admin";
import { skipAudio } from "../../skipAudio";

export default (adminDB: admin.database.Database) => {
  const roomID = "skipAudioRoomID";
  const trackID = "foo";
  const playingSong = {
    title: "foo",
    artist: "bar",
  };

  const onlineRef = adminDB.ref(`rooms/${roomID}/online`);
  const nowPlayingRef = admin
    .database()
    .ref(`music/${roomID}/nowplaying/${trackID}`);

  afterAll(async () => {
    await adminDB.ref().set(null);
  });

  test("should reject skip if no user is in the room", async () => {
    await expect(skipAudio({ roomID, trackID })).rejects.toThrowError();
  });

  test("should process skip but not remove track", async (done) => {
    await onlineRef.set(3);
    await nowPlayingRef.set(playingSong);

    // skip count of 1, with same track playing
    await expect(skipAudio({ roomID, trackID })).resolves.toBe(1);
    nowPlayingRef.on("value", (snap) => {
      if (
        snap.val().title === playingSong.title &&
        snap.val().artist === playingSong.artist
      ) {
        nowPlayingRef.off();
        done();
      }
    });
  });
};
