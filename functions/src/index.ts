import * as admin from "firebase-admin";
import convertAudio from "./convertAudio";
import popQueue from "./popQueue";

admin.initializeApp();

exports.convertAudio = convertAudio;
exports.popQueue = popQueue;
