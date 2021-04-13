import { useAdmin, myAuth, getDateNowSeconds } from "./testHelpers";

const [adminApp, adminDB] = useAdmin();
const statusRef = adminDB.ref(`status/alternative/${myAuth.uid}`);
const onlineRef = adminDB.ref("rooms/alternative/online");
const nowPlayingRef = adminDB.ref("music/alternative/nowplaying/song1");
const duration = 195;
let dateNowSeconds: number;
beforeAll(() => {
  dateNowSeconds = getDateNowSeconds();
});

afterAll(async () => {
  adminDB.ref().set(null);
  await adminApp.delete();
});

/**
 * Presence Handling Integration test
 * (1) User joins a room with a paused song in nowplaying and an empty queue
 * (2) Expect online counter to increment and resumePlayback to fire
 */
describe("User joins an empty room", () => {
  beforeAll(async () => {
    const timeInPast = dateNowSeconds - 600;
    await nowPlayingRef.set({
      duration,
      resumeDuration: duration / 2,
      startTime: timeInPast,
      endTime: timeInPast + duration,
      status: "paused",
    });
    await statusRef.set({ device1: true });
  });

  test("incrementOnline", async (done) => {
    await statusRef.update({ device2: true }); // add another device
    onlineRef.on("value", (snap) => {
      const expectedCount = 1;
      if (snap.val() === expectedCount) {
        onlineRef.off();
        done();
      }
    });
  });

  // a song has been paused and is ready to be resumed
  test("resumePlayback", async (done) => {
    nowPlayingRef.on("value", (snap) => {
      const altered = snap.val();
      if (
        altered?.duration === duration &&
        altered?.startTime >= dateNowSeconds - duration / 2 &&
        altered?.endTime >= dateNowSeconds + duration / 2 &&
        altered?.status === "playing" &&
        !snap.child("resumeDuration").exists()
      ) {
        nowPlayingRef.off();
        done();
      }
    });
  });
});

/**
 * (4) User goes offline with a track that was previously playing in above test
 * (5) Expect online counter to decrement and savePlayback to fire
 */
describe("User is last to leave a room", () => {
  beforeAll(async () => {
    await statusRef.remove(); // remove all previous user devices
  });

  test("decrementOnline", (done) => {
    onlineRef.on("value", (snap) => {
      const expectedCount = 0;
      if (snap.val() === expectedCount) {
        onlineRef.off();
        done();
      }
    });
  });

  // a song's playback position must be saved
  test("savePlayback", async (done) => {
    nowPlayingRef.on("value", (snap) => {
      const expectedResumeDuration = duration / 2;
      const altered = snap.val();
      if (
        altered?.duration === duration &&
        altered?.status === "paused" &&
        snap.child("resumeDuration").exists() &&
        altered?.resumeDuration >= expectedResumeDuration &&
        altered?.resumeDuration <= duration
      ) {
        nowPlayingRef.off();
        done();
      }
    });
  });
});
