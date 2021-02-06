import * as admin from "firebase-admin";
import convertAudio from "./convertAudio";

admin.initializeApp();

exports.convertAudio = convertAudio;
