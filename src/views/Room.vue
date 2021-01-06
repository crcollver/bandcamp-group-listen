<template>
  <div v-if="allMessages.length" class="h-36 overflow-y-auto">
    <li v-for="message in allMessages" :key="message">{{ message }}</li>
  </div>
  <div v-if="!allMessages.length" class="h-36">No messages to display yet!</div>
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
  <button @click="onSendMessage" class="bg-blue-500">Send!</button>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "Room",
  setup() {
    const message = ref<string>("");
    const allMessages = ref<Array<string>>([]);

    const onSendMessage = () => {
      allMessages.value.push(message.value);
    };

    return { message, allMessages, onSendMessage };
  },
});
</script>