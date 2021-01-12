<template>
  <div v-if="allMessages.length" class="h-36 overflow-y-auto">
    <li v-for="message in allMessages" :key="message.id">
      {{ message.message }}
    </li>
  </div>
  <div v-if="loading">Loading messages...</div>
  <div v-if="!allMessages.length && !loading" class="h-36">
    No messages to display yet!
  </div>
  <div v-if="!loading && error">{{ error }}</div>
  <div>
    <textarea
      name="messageSend"
      class="border"
      cols="30"
      rows="5"
      placeholder="Enter a message to send."
      v-model="message"
    ></textarea>
  </div>
  <button @click="sendMessage(message)" class="bg-blue-500">Send!</button>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import useMessages from "@/hooks/useMessages";

export default defineComponent({
  name: "Room",
  setup() {
    const route = useRoute();
    const message = ref<string>("");
    const { messages: allMessages, loading, error, sendMessage } = useMessages(
      route.params.id.toString()
    );

    return { message, allMessages, loading, error, sendMessage };
  },
});
</script>