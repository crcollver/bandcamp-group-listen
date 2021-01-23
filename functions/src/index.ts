import * as functions from "firebase-functions";
import * as cheerio from "cheerio";
import fetch from "node-fetch";

exports.getBandcampAudio = functions.database
  .ref("convertQueue/{roomID}")
  .onCreate(async (snapshot, context) => {
    const { url } = snapshot.val();
    const musicRef = snapshot.ref.root.child(
      `musicQueue/${context.params.roomID}`
    );
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const albumInfo = $("script[data-tralbum]").data("tralbum");
    console.log("Grabbing audio...", context.params.roomID, albumInfo);
    return musicRef.push({
      originalUrl: url,
      converted: true,
    });
  });
