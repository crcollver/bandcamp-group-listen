import * as tests from "@firebase/rules-unit-testing";
import firebase from "firebase";

process.env.FIREBASE_DATABASE_EMULATOR_HOST = "localhost:9000";
const PROJECT_ID = "music-chat-development";

export const useDB = (userID: string | null) => {
  return tests
    .initializeTestApp({
      databaseName: PROJECT_ID,
      auth: userID ? { uid: userID } : undefined,
    })
    .database();
};

/**
 * Firebase.apps() does not presently clean up any admin app inits
 * Returning the app instance allows for proper clean up
 * @returns [firebase admin app, firebase admin db]
 */
export const useAdmin = (): [firebase.app.App, firebase.database.Database] => {
  const app = tests.initializeAdminApp({ databaseName: PROJECT_ID });
  const db = app.database();
  return [app, db];
};
