/**
 * Calculates Unix timestamp for when track should start and end
 * @param duration song duration is seconds
 * @returns Array of startTime and endTime
 */
export const calculatePlayTime = (duration: number): number[] => {
  const startTime = Date.now();
  const endTime = startTime + duration * 1000;
  return [startTime, endTime];
};
