import { convertAudio } from "../../convertAudio";
import {
  noAudioUrls,
  knownGoodSingleUrls,
  knownGoodAlbumUrls,
} from "../testHelpers";
import * as admin from "firebase-admin";
import { Track, TrackPreview } from "../../interfaces";

export default (adminDB: admin.database.Database) => {
  const params = {
    roomID: "alternative",
    url: "failedurl",
  };
  const nowPlayingRef = adminDB.ref(`music/${params.roomID}/nowplaying`);
  const roomNowPlayingRef = adminDB.ref(`rooms/${params.roomID}/nowplaying`);
  const queueRef = adminDB.ref(`music/${params.roomID}/queue`);

  describe("a known bad url", () => {
    afterAll(async () => {
      await adminDB.ref().set(null);
    });
    test("should fail to fetch", async () => {
      return await expect(convertAudio(params)).rejects.toThrowError();
    });

    test("with no audio info should return an error", async () => {
      params.url = noAudioUrls[0];
      return await expect(convertAudio(params)).rejects.toThrowError();
    });
  });

  /**
   * convertAudio Integration Test
   * (1) Add a known good album
   * (2) Add a known good single afterwards for consistency check
   */
  describe("a known good url with multiple audio sources", () => {
    beforeAll(() => (params.url = knownGoodAlbumUrls[1]));
    afterAll(async () => {
      await adminDB.ref().set(null);
    });

    let currentTrack: Track, currentTrackID: string;
    const previewCheck = (done: jest.DoneCallback) => {
      roomNowPlayingRef.on("value", (snap) => {
        const preview: TrackPreview = snap.val();
        if (
          snap.exists() &&
          preview.title === currentTrack.title &&
          preview.albumArt === currentTrack.albumArt &&
          preview.artist === currentTrack.artist
        ) {
          roomNowPlayingRef.off();
          done();
        }
      });
    };

    test("where first track should be in nowplaying", async (done) => {
      await expect(convertAudio(params)).resolves.toBe(params.url);
      nowPlayingRef.on("value", (snap) => {
        const nowPlayingKeys = Object.keys(snap.val());
        currentTrackID = nowPlayingKeys[0];
        currentTrack = snap.child(currentTrackID).val();
        if (
          snap.exists() &&
          currentTrack.status === "playing" &&
          currentTrack.rescrape !== undefined &&
          !currentTrack.rescrape
        ) {
          expect(nowPlayingKeys.length).toBe(1);
          nowPlayingRef.off();
          done();
        }
      });
    });

    test("where first track should have a preview on room node", previewCheck);

    let numInQueue: number;
    test("where queue should not be empty", async (done) => {
      queueRef.on("value", (snap) => {
        if (snap.exists()) {
          numInQueue = snap.numChildren();
          queueRef.off();
          done();
        }
      });
    });

    test("where adding another track should increase queue size", async (done) => {
      params.url = knownGoodSingleUrls[1];
      await expect(convertAudio(params)).resolves.toBe(params.url);
      queueRef.on("value", (snap) => {
        if (snap.exists()) {
          expect(snap.numChildren()).toBeGreaterThan(numInQueue);
          queueRef.off();
          done();
        }
      });
    });

    test("where added track should not replace or add to nowplaying", (done) => {
      nowPlayingRef.on("value", (snap) => {
        const nowPlayingKeys = Object.keys(snap.val());
        const sameID = nowPlayingKeys[0];
        if (snap.exists() && currentTrackID === sameID) {
          expect(nowPlayingKeys.length).toBe(1);
          nowPlayingRef.off();
          done();
        }
      });
    });

    test("where added track should not replace room preview", previewCheck);
  });
};
