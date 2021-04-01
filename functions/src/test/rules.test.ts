import * as firebase from "@firebase/rules-unit-testing";
import { useDB, useAdmin } from "./testHelpers";
const myID = "myUserID";

const [adminApp, adminDB] = useAdmin();
const authDB = useDB(myID);
const unAuthDB = useDB(null);

describe("Firebase Rules", () => {
  afterEach(async () => {
    await adminDB.ref().set(null); // clear the database after each test
  });
  afterAll(async () => {
    await adminApp.delete();
    Promise.all(firebase.apps().map((app) => app.delete()));
  });

  test("unauthenticated cannot read or write to database", async () => {
    await firebase.assertFails(unAuthDB.ref("foo").once("value"));
    await firebase.assertFails(unAuthDB.ref("foo").set({ foo: "bar" }));
  });

  test("user cannot write to rooms node", async () => {
    await firebase.assertFails(authDB.ref("rooms").set({ foo: "bar" }));
  });

  const nowPlayingPath = "music/alternative/nowplaying/foo";
  test("user cannot delete nowplaying since endtime > currentTime", async () => {
    await adminDB.ref(nowPlayingPath).set({
      endTime: Math.floor(Date.now() / 1000) + 600, // timestamp in future
    });
    await firebase.assertFails(authDB.ref(nowPlayingPath).remove());
  });

  // assume song has just ended and the request to remove nowplaying has been sent
  test("user can delete nowplaying since endtime <= currentTime", async () => {
    await adminDB.ref(nowPlayingPath).set({
      endTime: Math.floor(Date.now() / 1000),
    });
    await firebase.assertSucceeds(authDB.ref(nowPlayingPath).remove());
  });

  test("user can request a rescrape", async () => {
    await adminDB.ref(nowPlayingPath).set({
      rescrape: false,
    });
    await firebase.assertSucceeds(
      authDB.ref(nowPlayingPath).update({
        rescrape: true,
      })
    );
  });

  test("user cannot update any other nowplaying data", async () => {
    await firebase.assertFails(
      authDB.ref(nowPlayingPath).update({
        rescrape: true,
        audioSrc: "foobar.com",
        albumTitle: "Foo",
      })
    );
  });
});
