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
  const startTime = Date.now() - startOffset;
  const endTime = startTime + duration * 1000;
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
