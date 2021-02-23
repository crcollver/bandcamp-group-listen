import { onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import firebase from "firebase/app";
import useAuth from "@/composables/useAuth";
import { connectedRef, statusRef } from "@/firebase";

export default function () {
  let deviceID: firebase.database.ThenableReference;
  const route = useRoute();
  const roomID = route.params.id.toString();
  onMounted(async () => {
    const user = await useAuth().getCurrentUser();
    const presenceRef = statusRef.child(`${roomID}/${user!.uid}`);
    connectedRef.on("value", (snap) => {
      if (snap.val()) {
        // create a unique id for the device when online
        // user could possibily be logged in on multiple devices
        deviceID = presenceRef.push();
        deviceID.onDisconnect().remove(); // remove that id on disconnect
        deviceID.set({
          name: user!.displayName,
          photo: user!.photoURL,
        }); // add this id to list of room connections
      }
    });
  });
  onUnmounted(() => {
    deviceID.remove(); // when user leaves room, remove device from connection list
    connectedRef.off();
  });
}
