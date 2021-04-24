import presence from "./function-suites/handlePresence.suite";
import popQueue from "./function-suites/popQueue.suite";
import rules from "./function-suites/rules.suite";
import convertAudio from "./function-suites/convertAudio.suite";
import * as admin from "firebase-admin";
import { DATABASE_URL } from "./testHelpers";

/**
 * Having Jest runs each suite in parallel causes weird overwrites in emulator
 * Sequentially running the test that write/read from database prevents issues
 * Any additional unit tests (.test.ts) will be run in parallel
 */
describe("Run Emulator Tests Sequentially", () => {
  process.env.FIREBASE_DATABASE_EMULATOR_HOST = "localhost:9000";
  // have one central adminApp to delete instead of individual ones in each suite
  // rules has its own separate admin app according to docs
  const adminApp = admin.initializeApp({
    databaseURL: DATABASE_URL,
  });
  const adminDB = admin.database();
  afterAll(async () => {
    await adminApp.delete();
  });
  describe("Firebase Rules", rules);
  describe("Presence Handling", () => presence(adminDB));
  describe("Pop Queue", () => popQueue(adminDB));
  describe("Convert Audio", () => convertAudio(adminDB));
});
