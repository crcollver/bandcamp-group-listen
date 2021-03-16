import * as functions from "firebase-functions";
import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { Track } from "./interfaces";

/**
 * Takes user given url and appends the appropriate track pathname to the
 *  hostname.  Allows for recrawling individual songs even if album link was provided.
 * @param originalUrl the original url that a user passes in
 * @param trackTitle the track title_link property on a bandcamp track object
 * @returns url formatted in protocol://hostname/trackTitle
 */
const concatTrackUrl = (originalUrl: string, trackTitle: string): string => {
  const concatUrl = new URL(originalUrl);
  const hostname = concatUrl.hostname;
  const protocol = concatUrl.protocol;
  concatUrl.href = protocol + hostname + trackTitle;
  return concatUrl.href;
};

/**
 * Uses cheerio to fetch the HTML of the bandcamp link
 * Bandcamp seems to render the audio info on the server
 * @param url The url that the user passes in from the client
 * @returns Array of Tracks
 * @throws Formatted error that is sent to client in caller
 */
export default async function (url: string): Promise<Track[]> {
  if (!url) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A URL must be provided."
    );
  }
  // TODO: When else would these operations fail?
  const res = await fetch(url);
  const html = await res.text();

  const $ = cheerio.load(html);
  // grab the script tag with the embedded album info
  const trackInfoNode = $("script[data-tralbum]");
  const { trackinfo } = trackInfoNode.data("tralbum") || {};
  if (!trackinfo) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "There was no track information on this link."
    );
  }

  // get info like artist, album name, and art
  const bandInfo = trackInfoNode.data("embed");
  const albumArt = $("#tralbumArt .popupImage img").attr("src");

  // filter out those without an audio source
  // since Bandcamp can change surrounding data at any time, "any" is used for now
  return trackinfo
    .filter((track: any) => track.file && track.file["mp3-128"])
    .map((track: any) => {
      // "ts" is in the query string of the scraped audio source link
      // it is the timestamp of when the link expires
      const audioSrc = track.file["mp3-128"];
      const srcUrl = new URL(audioSrc);
      const expires = srcUrl.searchParams.get("ts");
      return {
        audioSrc,
        albumArt,
        artist: bandInfo.artist,
        albumTitle: bandInfo.album_title || "",
        title: track.title,
        duration: track.duration, // in seconds
        expires,
        trackUrl: concatTrackUrl(url, track.title_link),
        status: "queued",
      };
    });
}
