import * as firebase from "@firebase/rules-unit-testing";
import { useDB, useAdmin } from "./testHelpers";
const myID = "myUserID";

const [adminApp, adminDB] = useAdmin();

describe("Firebase Rules", () => {
  afterEach(async () => {
    await adminDB.ref().set(null); // clear the database after each test
  });
  afterAll(async () => {
    await adminApp.delete();
    Promise.all(firebase.apps().map((app) => app.delete()));
  });

  test("unauthenticated cannot read or write to database", async () => {
    const db = useDB(null);
    await firebase.assertFails(db.ref("foo").once("value"));
    await firebase.assertFails(db.ref("foo").set({ foo: "bar" }));
  });

  test("user cannot write to rooms node", async () => {
    const db = useDB(myID);
    await firebase.assertFails(db.ref("rooms").set({ foo: "bar" }));
  });

  const nowPlayingPath = "music/alternative/nowplaying/foo";
  test("user cannot delete nowplaying since endtime > currentTime", async () => {
    const db = useDB(myID);
    await adminDB.ref(nowPlayingPath).set({
      endTime: Math.floor(Date.now() / 1000) + 600, // timestamp in future
    });
    await firebase.assertFails(db.ref(nowPlayingPath).remove());
  });

  // assume song has just ended and the request to remove nowplaying has been sent
  test("user can delete nowplaying since endtime <= currentTime", async () => {
    const db = useDB(myID);
    await adminDB.ref(nowPlayingPath).set({
      endTime: Math.floor(Date.now() / 1000),
    });
    await firebase.assertSucceeds(db.ref(nowPlayingPath).remove());
  });

  test("user can request a rescrape", async () => {
    const db = useDB(myID);
    await adminDB.ref(nowPlayingPath).set({
      rescrape: false,
    });
    await firebase.assertSucceeds(
      db.ref(nowPlayingPath).update({
        rescrape: true,
      })
    );
  });

  test("user cannot update any other nowplaying data", async () => {
    const db = useDB(myID);
    await firebase.assertFails(
      db.ref(nowPlayingPath).update({
        rescrape: true,
        audioSrc: "foobar.com",
        albumTitle: "Foo",
      })
    );
  });
});
