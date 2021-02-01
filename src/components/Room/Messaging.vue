<template>
  <div>
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
  </div>
</template>

<script lang="ts">
import { messagesRef } from "@/firebase";
import MessageBox from "@/components/Room/MessageBox.vue";
import MessageBubble from "@/components/Room/MessageBubble.vue";
import { Message } from "@/interfaces";
import { useRoute } from "vue-router";
import { onBeforeUnmount, ref } from "vue";

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
     * Firebase guarantees that "value" events always run after "child_" events
     */
    const createListener = async () => {
      try {
        roomRef.on("child_added", (snapshot) => {
          allMessages.value.push({ id: snapshot.key, ...snapshot.val() });
        });
        roomRef.once("value", () => {
          loading.value = false;
        });
      } catch (err) {
        console.error(err);
        error.value = "Something went wrong setting up messages.";
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