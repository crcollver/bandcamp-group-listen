import presence from "./function-suites/handlePresence.suite";
import popQueue from "./function-suites/popQueue.suite";
import rules from "./function-suites/rules.suite";
import { useAdmin } from "./testHelpers";

/**
 * Having Jest runs each suite in parallel causes weird overwrites in emulator
 * Sequentially running the test that write/read from database prevents issues
 * Any additional unit tests (.test.ts) will be run in parallel
 */
describe("Run Emulator Tests Sequentially", () => {
  // have one central adminApp to delete instead of individual ones in each suite
  const [adminApp, adminDB] = useAdmin();
  afterAll(async () => {
    await adminApp.delete();
  });
  describe("Firebase Rules", () => rules(adminDB));
  describe("Presence Handling", () => presence(adminDB));
  describe("Pop Queue", () => popQueue(adminDB));
});
