import * as admin from "firebase-admin";

/**
 * Calculates Unix timestamp for when track should start and end
 * @param duration song duration is seconds
 * @param startOffset an offset if track must be resumed at specific spot
 * @returns Tuple of startTime and endTime
 */
export const calculatePlayTime = (
  duration: number,
  startOffset = 0
): [number, number] => {
  const startTime = Math.floor(Date.now() / 1000) - startOffset;
  const endTime = startTime + duration;
  return [startTime, endTime];
};

/**
 * Grabs the first item in the list of the provided reference
 * @param ref Firebase reference to at least one item
 * @returns A tuple of the first item ID and first item data
 */
export const peekFirstListItem = async <T>(
  ref: admin.database.Reference
): Promise<[string, T | null]> => {
  const snapshot = await ref.limitToFirst(1).once("value");
  let itemID = "";
  let itemData: T | null = null;
  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      itemID = childSnapshot.key ? childSnapshot.key : "";
      itemData = { ...childSnapshot.val() };
    });
  }
  return [itemID, itemData];
};

/**
 * Pulls the timestamp from query string of audio which is when the link expires
 * @param audioSrc the url of the bandcamp audio
 * @returns time in seconds that the audio link expires
 */
export const getLinkExpireTime = (audioSrc: string): number | null => {
  const srcUrl = new URL(audioSrc);
  const expires = srcUrl.searchParams.get("ts");
  return expires ? parseInt(expires) : null;
};
