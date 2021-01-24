import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cheerio from "cheerio";
import fetch from "node-fetch";

admin.initializeApp();

interface Track {
  audioSrc: string;
  albumArt: string;
  artist: string;
  albumTitle: string;
  title: string;
  duration: number;
  originalUrl: string;
}

exports.getBandcampAudio = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Can only suggest music if authenticated."
    );
  }

  const { url, roomID } = data;
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  // grab the script tag with the embedded album info
  const trackInfoNode = $("script[data-tralbum]");
  const { trackinfo } = trackInfoNode.data("tralbum");

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
  const extractedTrackInfo = trackinfo
    .filter((track: any) => track.file && track.file["mp3-128"])
    .map((track: any) => {
      return {
        audioSrc: track.file["mp3-128"],
        albumArt,
        artist: bandInfo.artist,
        albumTitle: bandInfo.album_title,
        title: track.title,
        duration: track.duration, // in seconds
        originalUrl: url, // the original url passed in
      };
    });

  if (extractedTrackInfo.length === 0) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "There was no audio source associated with the track info on this link."
    );
  }

  // push that audio to the appropriate queue for the room
  try {
    const queueRef = admin.database().ref(`queue/${roomID}`);
    extractedTrackInfo.forEach((track: Track) => {
      queueRef.push(track);
    });
    return "Success";
  } catch (err) {
    return new functions.https.HttpsError("unknown", err.message, err);
  }
});
