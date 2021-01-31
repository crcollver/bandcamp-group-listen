<template>
  <div v-if="currentTrack" class="mt-6">
    <h1>{{ currentTrack.title }}</h1>
    <h2>{{ track.albumTitle }}</h2>
    <h3>{{ track.artist }}</h3>
    <p>{{ track.audioSrc }}</p>
    <img :src="track.albumArt" :alt="track.artist + track.title" class="w-48" />
  </div>
  <p v-if="!currentTrack">Nothing playing yet!</p>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref } from "vue";
import { useRoute } from "vue-router";
import { Track } from "@/interfaces";
import { queueRef } from "@/firebase";

export default defineComponent({
  name: "NowPlaying",
  setup() {
    const currentTrack = ref<Track | null>(null);
    const route = useRoute();
    const roomQueueRef = queueRef
      .child(route.params.id.toString())
      .limitToFirst(1);
    roomQueueRef.on("child_added", (snapshot) => {
      currentTrack.value = snapshot.val();
    });
    onBeforeUnmount(() => roomQueueRef.off());
    return {
      currentTrack,
    };
  },
});
</script>