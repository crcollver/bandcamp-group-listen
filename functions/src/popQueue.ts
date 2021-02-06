import * as functions from "firebase-functions";

export default functions.database
  .ref("queue/{roomID}")
  .onDelete((snapshot, context) => {
    return;
  });
