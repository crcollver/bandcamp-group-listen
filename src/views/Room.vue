<template>
  <Messaging class="w-1/2" />
  <NowPlaying />
  <Queue />
  <OnlineUsers />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Messaging from "../components/Room/Messaging.vue";
import Queue from "../components/Room/Queue.vue";
import NowPlaying from "../components/Room/NowPlaying.vue";
import OnlineUsers from "../components/Room/OnlineUsers.vue";
import usePresence from "../composables/usePresence";

export default defineComponent({
  name: "Room",
  components: {
    Messaging,
    Queue,
    NowPlaying,
    OnlineUsers,
  },
  setup() {
    usePresence();
  },
});
</script> 