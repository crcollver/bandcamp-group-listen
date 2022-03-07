<template>
  <div>
    <div v-if="allMessages.length" class="h-48 overflow-y-auto">
      <message-bubble
        v-for="message in allMessages"
        :key="message.id"
        :message="message"
      />
    </div>
    <div v-if="!allMessages.length" class="h-36">
      No messages to display yet!
    </div>
    <message-box />
  </div>
</template>

<script lang="ts">
import { messagesRef } from "../../firebase";
import MessageBox from "./MessageBox.vue";
import MessageBubble from "./MessageBubble.vue";
import { Message } from "../../interfaces";
import { useRoute } from "vue-router";
import { onBeforeUnmount, ref } from "vue";

export default {
  name: "Messaging",
  components: {
    MessageBox,
    MessageBubble,
  },
  setup() {
    const allMessages = ref<Message[]>([]);

    const route = useRoute();
    const roomRef = messagesRef.child(route.params.id.toString());

    // add a setTimeout to counter the brief time allMessages is empty
    roomRef.on("child_added", (snapshot) => {
      allMessages.value.push({ id: snapshot.key, ...snapshot.val() });
    });

    onBeforeUnmount(() => roomRef.off());
    return {
      allMessages,
    };
  },
};
</script>