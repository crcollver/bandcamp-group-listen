import { useAdmin, myAuth } from "./testHelpers";

describe("Presence Handling", () => {
  const [adminApp, adminDB] = useAdmin();
  afterEach(async () => {
    await adminDB.ref().set(null); // clear the database after each test
  });
  afterAll(async () => {
    await adminApp.delete();
  });

  test("incrementOnline", async (done) => {
    adminDB.ref(`status/alternative/${myAuth.uid}`).set({
      device1: true,
      device2: true,
    });
    const onlineRef = adminDB.ref("rooms/alternative/online");
    const onlineListener = onlineRef.on("value", (snap) => {
      const expectedCount = 1;
      if (snap.val() === expectedCount) {
        onlineRef.off("value", onlineListener);
        done();
      }
    });
  });
});
