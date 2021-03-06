import * as admin from "firebase-admin";
import convertAudio from "./convertAudio";
import popQueue from "./popQueue";
import {
  incrementOnline,
  decrementOnline,
  savePlayback,
  resumePlayback,
} from "./handlePresence";

admin.initializeApp();

exports.convertAudio = convertAudio;
exports.popQueue = popQueue;
exports.incrementOnline = incrementOnline;
exports.decrementOnline = decrementOnline;
exports.savePlayback = savePlayback;
exports.resumePlayback = resumePlayback;
