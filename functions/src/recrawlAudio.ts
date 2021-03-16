import * as functions from "firebase-functions";
import scrapeBandcamp from "./scrapeBandcamp";
import { Track } from "./interfaces";
/**
 * When client cannot playback audio source, they auto request a rescrape
 * Could have issues if many out of sync clients request rescrape
 *  after it has already been set to false again since it would do unecessary work
 * Move onUpdate to parent so as to short circuit before reading from DB
 */
export default functions.database
  .ref("music/{roomID}/nowplaying/{trackID}/rescrape")
  .onUpdate(async (change) => {
    const shouldRescrape = change.after.val();
    if (shouldRescrape) {
      const parentRef = change.after.ref.parent!;
      // if rescrape is true, then the parent node exists and has audio info
      const trackInfo: Track = (await parentRef.once("value")).val();

      // if the expected end time exceeds the tokenrefresh time, then rescrape
      const expectEndTime = trackInfo!.startTime! + trackInfo!.duration;
      const tokenRefresh = trackInfo.expires;
      if (tokenRefresh && parseInt(tokenRefresh) <= expectEndTime) {
        const [trackToScrape] = await scrapeBandcamp(trackInfo!.trackUrl);
        return parentRef.update({
          audioSrc: trackToScrape.audioSrc,
          rescrape: false,
        });
      }
    }
  });
