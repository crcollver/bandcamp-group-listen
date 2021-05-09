import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// pull out function to easily test without auth
export const skipAudio = async (data: any) => {
  const { roomID, trackID } = data;
  const skipRef = admin.database().ref(`music/${roomID}/nowplaying/skipCount`);
  const nowPlayingRef = admin
    .database()
    .ref(`music/${roomID}/nowplaying/${trackID}`);
  const onlineCountRef = admin.database().ref(`rooms/${roomID}/online`);

  const onlineCount: number = (await onlineCountRef.once("value")).val();
  if (onlineCount <= 0) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "That room has no users."
    );
  }

  // According to developer advocate, this should be the promise type returned
  // https://stackoverflow.com/questions/54058785/how-to-get-value-inside-transaction-result-firebase-via-node-js
  type ResolvedTransaction = {
    committed: boolean;
    snapshot: admin.database.DataSnapshot;
  };
  let transactionResult: ResolvedTransaction;

  try {
    transactionResult = await skipRef.transaction((count) => {
      return (count || 0) + 1;
    });
  } catch (err) {
    console.error(err?.message);
    throw new functions.https.HttpsError(
      "unknown",
      "Transaction failed for an unknown reason."
    );
  }

  if (!transactionResult.committed) {
    throw new functions.https.HttpsError(
      "aborted",
      "Transaction failed, could not count your skip vote."
    );
  }

  const skipCount: number = transactionResult.snapshot.val();
  if (skipCount > onlineCount / 2) {
    await nowPlayingRef.remove();
  }

  return skipCount;
};

export default functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Can only skip if authenticated"
    );
  }

  return skipAudio(data);
});
