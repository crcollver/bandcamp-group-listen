<template>
  <div class="pa-4 border">
    <router-link :to="{ name: 'Room', params: { id: room.id } }">
      <h1>{{ room.title }}</h1>
      <p v-if="currentlyPlaying">
        Playing: {{ currentlyPlaying.title }} | {{ currentlyPlaying.artist }}
      </p>
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref } from "vue";
import { Room, Track } from "@/interfaces";
import { musicRef } from "@/firebase";

export default defineComponent({
  props: {
    room: {
      type: Object as () => Room,
      required: true,
    },
  },
  setup(props) {
    const currentlyPlaying = ref<Track | null>(null);
    const nowPlayingRef = musicRef.child(`${props.room.id}/nowplaying`);
    nowPlayingRef.on("child_removed", () => {
      currentlyPlaying.value = null;
    });
    nowPlayingRef.on("child_added", (snapshot) => {
      currentlyPlaying.value = snapshot.val();
    });
    onUnmounted(() => {
      nowPlayingRef.off();
    });
    return {
      currentlyPlaying,
    };
  },
});
</script>