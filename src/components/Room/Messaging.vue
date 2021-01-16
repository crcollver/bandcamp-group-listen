<template>
  <div v-if="allMessages.length" class="h-48 overflow-y-auto">
    <message-bubble
      v-for="message in allMessages"
      :key="message.id"
      :message="message"
    />
  </div>
  <div v-if="loading">Loading messages...</div>
  <div v-if="!allMessages.length && !loading" class="h-36">
    No messages to display yet!
  </div>
  <div v-if="!loading && error">{{ error }}</div>
  <message-box />
</template>

<script lang="ts">
import { messagesRef, serverOffset } from "@/firebase";
import MessageBox from "@/components/Room/MessageBox.vue";
import MessageBubble from "@/components/Room/MessageBubble.vue";
import { useRoute } from "vue-router";
import { onBeforeUnmount, ref } from "vue";

export interface Message {
  name: string;
  uid: string;
  message: string;
  messageID: string;
  sentAt: number;
}

export default {
  name: "Messaging",
  components: {
    MessageBox,
    MessageBubble,
  },
  setup() {
    const loading = ref<boolean>(true);
    const error = ref<string>("");
    const allMessages = ref<Message[]>([]);

    const route = useRoute();
    const roomRef = messagesRef.child(route.params.id.toString());

    /**
     * Fetch all messages initially, then setup listener
     * Uses server timestamp to get all messages after initial query
     * Not sure how reliable this approach is this and if messages could be skipped?
     */
    const createListener = async () => {
      try {
        const msgSnap = await roomRef.once("value");
        const timeSnap = await serverOffset.once("value");
        const currentServerTime = Date.now() + timeSnap.val();
        msgSnap.forEach((child) => {
          allMessages.value.push({ id: child.key, ...child.val() });
        });
        roomRef
          .orderByChild("sentAt")
          .startAt(currentServerTime)
          .on("child_added", (snapshot) => {
            allMessages.value.push({ id: snapshot.key, ...snapshot.val() });
          });
      } catch (err) {
        error.value = "Something went wrong while setting up messages.";
      } finally {
        loading.value = false;
      }
    };

    createListener();
    onBeforeUnmount(() => roomRef.off());
    return {
      loading,
      error,
      allMessages,
    };
  },
};
</script>

<style>
</style>