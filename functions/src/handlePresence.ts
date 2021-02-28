import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
export const incrementOnline = functions.database
  .ref("status/{roomID}/{uid}")
  .onCreate((snapshot, context) => {
    const onlineCountRef = admin
      .database()
      .ref(`rooms/${context.params.roomID}/online`);
    return onlineCountRef.set(admin.database.ServerValue.increment(1));
  });

export const decrementOnline = functions.database
  .ref("status/{roomID}/{uid}")
  .onDelete((snapshot, context) => {
    const onlineCountRef = admin
      .database()
      .ref(`rooms/${context.params.roomID}/online`);
    return onlineCountRef.set(admin.database.ServerValue.increment(-1));
  });
