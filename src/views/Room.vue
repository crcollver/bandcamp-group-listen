<template>
  <messaging class="w-1/2" />
  <now-playing></now-playing>
  <queue />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Messaging from "@/components/Room/Messaging.vue";
import Queue from "@/components/Room/Queue.vue";
import NowPlaying from "@/components/Room/NowPlaying.vue";

export default defineComponent({
  name: "Room",
  components: {
    Messaging,
    Queue,
    NowPlaying,
  },
});
</script>