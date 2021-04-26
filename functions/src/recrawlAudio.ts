import * as functions from "firebase-functions";
import scrapeBandcamp from "./scrapeBandcamp";
import { getLinkExpireTime } from "./utils";
import { Track } from "./interfaces";
/**
 * When client cannot playback audio source, they auto request a rescrape
 * Could have issues if many out of sync clients request rescrape
 *  after it has already been set to false again since it would do unecessary work
 */
export default functions.database
  .ref("music/{roomID}/nowplaying/{trackID}/rescrape")
  .onUpdate(async (change) => {
    const shouldRescrape = change.after.val();
    const rescrapeRef = change.after.ref;
    if (!shouldRescrape) return;

    const parentRef = rescrapeRef.parent!;
    const trackInfo: Track = (await parentRef.once("value")).val();

    // if there is no trackUrl associated, then there is nothing to rescrape
    if (!trackInfo?.trackUrl) return change.after.ref.set(false);

    // if the expected end time exceeds the tokenrefresh time, then rescrape
    const expectEndTime = trackInfo!.startTime! + trackInfo!.duration;
    const tokenRefresh = trackInfo.expires;
    if (tokenRefresh && tokenRefresh <= expectEndTime) {
      const [trackToScrape] = await scrapeBandcamp(trackInfo!.trackUrl);
      const audioSrc = trackToScrape.audioSrc;
      return parentRef.update({
        audioSrc,
        expires: getLinkExpireTime(audioSrc),
        rescrape: false,
      });
    }
    return rescrapeRef.set(false);
  });
