import scrapeBandcamp from "../scrapeBandcamp";
import {
  badUrls,
  noAudioUrls,
  knownGoodSingleUrls,
  knownGoodAlbumUrls,
} from "./testHelpers";

// Tests against a few known good and bad urls that are unlikely to change
describe("scrapeBandcamp", () => {
  test.each(badUrls)(
    "%s has no trackinfo and will throw an error",
    async (url) => {
      await expect(scrapeBandcamp(url)).rejects.toThrowError();
    }
  );

  test.each(noAudioUrls)(
    "%s has trackinfo but no usable audio",
    async (url) => {
      await expect(scrapeBandcamp(url)).resolves.toHaveLength(0);
    }
  );

  // each track within trackinfo should have these properties
  const trackProperties = {
    audioSrc: expect.any(String),
    albumArt: expect.any(String),
    artist: expect.any(String),
    albumTitle: expect.any(String),
    title: expect.any(String),
    duration: expect.any(Number),
    expires: expect.any(String),
    trackUrl: expect.any(String),
    status: expect.stringMatching("queued"),
  };
  test.each(knownGoodSingleUrls)(
    "%s is a single track with no album title",
    async (url) => {
      const tracks = await scrapeBandcamp(url);
      expect(tracks).toHaveLength(1);
      tracks.forEach((track) => {
        expect(track).toEqual(trackProperties);
        expect(track.albumTitle).toBe("");
      });
    }
  );

  test.each(knownGoodAlbumUrls)(
    "%s is an album with more than 1 song",
    async (url) => {
      const tracks = await scrapeBandcamp(url);
      expect(tracks.length).toBeGreaterThan(1);
      tracks.forEach((track) => {
        expect(track).toEqual(trackProperties);
        expect(track.albumTitle).toBeTruthy();
      });
    }
  );
});
