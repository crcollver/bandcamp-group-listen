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
  test("user cannot write to rooms node", async () => {
    const db = useDB(myID);
    await firebase.assertFails(db.ref("rooms").set({ foo: "bar" }));
  });
  test("user cannot delete nowplaying since endtime > currentTime", async () => {
    const db = useDB(myID);
    const path = "music/alternative/nowplaying/foo";
    await adminDB.ref(path).set({
      endTime: Math.round(Date.now() / 1000) + 600, // timestamp in future
    });
    await firebase.assertFails(db.ref(path).remove());
  });
});
