import * as functions from "firebase-functions";
import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { Track } from "./interfaces";

/**
 * Uses cheerio to fetch the HTML of the bandcamp link
 * Bandcamp seems to render the audio info on the server
 * @param url The url that the user passes in from the client
 * @returns Array of Tracks
 * @throws Formatted error that is sent to client in caller
 */
export default async function(url: string): Promise<Track[]> {
  // TODO: When would these operations fail?
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
  // since Bandcamp can change surrounding data at any time, "any" is used
  return trackinfo
    .filter((track: any) => track.file && track.file["mp3-128"])
    .map((track: any) => {
      return {
        audioSrc: track.file["mp3-128"],
        albumArt,
        artist: bandInfo.artist,
        albumTitle: bandInfo.album_title || "",
        title: track.title,
        duration: track.duration, // in seconds
        originalUrl: url, // the original url passed in
        status: "queued",
      };
    });
}
