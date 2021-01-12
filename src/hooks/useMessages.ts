import { ref, onBeforeUnmount } from "vue";
import firebase from "firebase/app";
import { messagesRef } from "@/firebase";
import useAuth from "./useAuth";

interface Message {
  name: string;
  uid: string;
  message: string;
  messageID: string;
}

export default function(roomID: string) {
  const messages = ref<Message[]>([]);
  const loading = ref<boolean>(true);
  const error = ref<string>("");

  const roomRef: firebase.database.Reference = messagesRef.child(roomID);
  const { getCurrentUser } = useAuth();

  const sendMessage = async (message: string) => {
    const user = await getCurrentUser();
    try {
      // since this hook is not used until user is defined
      // it is safe to assume user will not be null (for now)
      roomRef.push({
        name: user!.displayName,
        uid: user!.uid,
        message,
      });
    } catch (err) {
      error.value = "Unable to send message.";
      console.error(err);
    }
  };
  /**
   * Runs on created hook
   * naive approach as messages may be skipped
   * TODO: use a timestamp value to get all new messages reliably
   */
  roomRef.on("child_added", snapshot => {
    if (loading.value) {
      messages.value.push({ id: snapshot.key, ...snapshot.val() });
    }
  });
  roomRef.once("value", snapshot => {
    snapshot.forEach(child => {
      messages.value.push({ id: child.key, ...child.val() });
    });
    loading.value = false;
  });

  onBeforeUnmount(() => {
    roomRef.off();
    console.log("Remove listener");
  });

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
}
