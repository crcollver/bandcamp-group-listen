import * as firebase from "@firebase/rules-unit-testing";
import { useDB, useAdmin } from "./testHelpers";

const myAuth = {
  uid: "myUserID",
  name: "Test User",
  email: "test@gmail.com",
};

describe("Firebase Rules", () => {
  const [adminApp, adminDB] = useAdmin();
  const authDB = useDB(myAuth);
  const unAuthDB = useDB(null);
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

  const messagePath = "messages/alternative/1";
  test("user cannot edit any message", async () => {
    await adminDB.ref(messagePath).set({
      message: "new message",
    });
    await firebase.assertFails(
      authDB.ref(messagePath).update({ message: "update" })
    );
  });

  test("user cannot delete any message", async () => {
    await firebase.assertFails(authDB.ref(messagePath).remove());
  });

  test("user can send a message given all required fields", async () => {
    await firebase.assertSucceeds(
      authDB.ref(messagePath).set({
        uid: myAuth.uid,
        message: "Send Message",
        sentAt: firebase.database.ServerValue.TIMESTAMP,
        photo:
          "https://lh3.googleusercontent.com/a-/AOh14Gg6SooS7eGbZdqHsJrNWqeCUW3d1VWgKlfSI74P=s96-c",
        name: myAuth.name,
      })
    );
  });
});
