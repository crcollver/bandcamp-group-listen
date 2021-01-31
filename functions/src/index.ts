import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cheerio from "cheerio";
import fetch from "node-fetch";

admin.initializeApp();

interface Track {
  audioSrc: string;
  albumArt: string;
  artist: string;
  albumTitle: string | null;
  title: string;
  duration: number;
  originalUrl: string;
  status: string;
  startTime?: number;
  endTime?: number;
}

exports.getBandcampAudio = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Can only suggest music if authenticated."
    );
  }

  const { url, roomID } = data;
  const extractedTrackInfo = await getBandcampLinkInfo(url);

  if (extractedTrackInfo.length === 0) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "There was no audio source associated with the track info on this link."
    );
  }

  // determine if track is only track in queue
  // if it is, set start, end and status accordingly
  // then push that audio to the appropriate queue for the room
  try {
    const queueRef = admin.database().ref(`queue/${roomID}`);
    const snapshot = await queueRef.once("value");
    if (!snapshot.exists()) {
      const startTime = Date.now();
      const endTime = startTime + extractedTrackInfo[0].duration * 1000;
      extractedTrackInfo[0].startTime = startTime;
      extractedTrackInfo[0].endTime = endTime;
      extractedTrackInfo[0].status = "playing";
    }
    extractedTrackInfo.forEach((track: Track) => {
      queueRef.push(track);
    });
    return "Success";
  } catch (err) {
    throw new functions.https.HttpsError("unknown", err.message, err);
  }
});

/**
 * Uses cheerio to fetch the HTML of the bandcamp link
 * Bandcamp seems to render the audio info on the server
 * @param url The url that the user passes in from the client
 * @returns Array of Tracks
 * @throws Formatted error that is sent to client in caller
 */
async function getBandcampLinkInfo(url: string): Promise<Track[]> {
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
