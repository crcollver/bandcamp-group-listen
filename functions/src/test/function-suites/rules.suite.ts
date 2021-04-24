import * as fb from "@firebase/rules-unit-testing";
import { myAuth, getDateNowSeconds, PROJECT_ID } from "../testHelpers";

interface Auth {
  uid: string;
  name: string;
  email: string;
}

const useDB = (userAuth: Auth | null) => {
  return fb
    .initializeTestApp({
      databaseName: PROJECT_ID,
      auth: userAuth ? userAuth : undefined,
    })
    .database();
};

export default () => {
  const authDB = useDB(myAuth);
  const unAuthDB = useDB(null);
  const adminApp = fb.initializeAdminApp({ databaseName: PROJECT_ID });
  const adminDB = adminApp.database();

  afterEach(async () => {
    await adminDB.ref().set(null); // clear the database after each test
  });
  afterAll(async () => {
    await adminApp.delete();
    Promise.all(fb.apps().map((app) => app.delete()));
  });

  test("unauthenticated cannot read or write to database", async () => {
    await fb.assertFails(unAuthDB.ref("foo").once("value"));
    await fb.assertFails(unAuthDB.ref("foo").set({ foo: "bar" }));
  });

  test("user cannot write to rooms node", async () => {
    await fb.assertFails(authDB.ref("rooms").set({ foo: "bar" }));
  });

  const nowPlayingPath = "music/alternative/nowplaying/foo";
  test("user cannot delete nowplaying since endtime > currentTime", async () => {
    await adminDB.ref(nowPlayingPath).set({
      endTime: getDateNowSeconds() + 600, // timestamp in future
    });
    await fb.assertFails(authDB.ref(nowPlayingPath).remove());
  });

  // assume song has just ended and the request to remove nowplaying has been sent
  test("user can delete nowplaying since endtime <= currentTime", async () => {
    await adminDB.ref(nowPlayingPath).set({
      endTime: getDateNowSeconds(),
    });
    await fb.assertSucceeds(authDB.ref(nowPlayingPath).remove());
  });

  test("user can request a rescrape", async () => {
    await adminDB.ref(nowPlayingPath).set({
      rescrape: false,
    });
    await fb.assertSucceeds(
      authDB.ref(nowPlayingPath).update({
        rescrape: true,
      })
    );
  });

  test("user cannot update any other nowplaying data", async () => {
    await fb.assertFails(
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
    await fb.assertFails(authDB.ref(messagePath).update({ message: "update" }));
  });

  test("user cannot delete any message", async () => {
    await fb.assertFails(authDB.ref(messagePath).remove());
  });

  test("user can send a message given all required fields", async () => {
    await fb.assertSucceeds(
      authDB.ref(messagePath).set({
        uid: myAuth.uid,
        message: "Send Message",
        sentAt: fb.database.ServerValue.TIMESTAMP,
        photo:
          "https://lh3.googleusercontent.com/a-/AOh14Gg6SooS7eGbZdqHsJrNWqeCUW3d1VWgKlfSI74P=s96-c",
        name: myAuth.name,
      })
    );
  });
};
