<template>
  <textarea
    name="messageSend"
    class="border block"
    cols="30"
    rows="5"
    placeholder="Enter a message to send."
    v-model="message"
  ></textarea>
  <button @click="onSendMessage" class="bg-blue-500">Send!</button>
</template>

<script lang="ts">
import useAuth from "../../composables/useAuth";
import { messagesRef, createTimeStamp } from "../../firebase";
import { ref } from "vue";
import { useRoute } from "vue-router";
export default {
  name: "MessageBox",
  setup() {
    const route = useRoute();
    const message = ref<string>("");
    const error = ref<string>("");
    // this function will only be run when user is not null
    // safe to use not-null assertion (for now)
    // what happens when we allow anonymous users?
    const onSendMessage = async () => {
      const { getCurrentUser } = useAuth();
      const user = await getCurrentUser();
      try {
        await messagesRef.child(route.params.id.toString()).push({
          name: user!.displayName,
          uid: user!.uid,
          message: message.value,
          sentAt: createTimeStamp(),
          photo: user!.photoURL,
        });
        message.value = "";
      } catch (err) {
        error.value = "Unable to send message.";
        console.error(err);
      }
    };
    return {
      message,
      onSendMessage,
      error,
    };
  },
};
</script>