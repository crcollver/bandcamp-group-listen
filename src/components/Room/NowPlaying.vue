<template>
  <div v-if="currentTrack" class="mt-6">
    <h1>{{ currentTrack.title }}</h1>
    <h2>{{ currentTrack.albumTitle }}</h2>
    <h3>{{ currentTrack.artist }}</h3>
    <audio
      :src="currentTrack.audioSrc"
      controls
      :currentTime="currentTrack.startTime"
    ></audio>
    <img
      :src="currentTrack.albumArt"
      :alt="currentTrack.artist + currentTrack.title"
      class="w-48"
    />
  </div>
  <p v-if="!currentTrack">Nothing playing yet!</p>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref } from "vue";
import { useRoute } from "vue-router";
import { Track } from "@/interfaces";
import { queueRef, offsetRef } from "@/firebase";

export default defineComponent({
  name: "NowPlaying",
  setup() {
    const currentTrack = ref<Track | null>(null);
    let offset: number;
    const route = useRoute();
    const roomQueueRef = queueRef
      .child(route.params.id.toString())
      .limitToFirst(1);

    const createListener = async () => {
      offset = (await offsetRef.once("value")).val();

      roomQueueRef.on("value", (snapshot) => {
        if (!snapshot.exists()) {
          currentTrack.value = null;
        }
        snapshot.forEach((childSnapshot) => {
          currentTrack.value = {
            id: childSnapshot.key,
            ...childSnapshot.val(),
          };
          currentTrack.value!.startTime! =
            (Date.now() + offset - currentTrack.value!.startTime!) / 1000;
        });
      });
    };

    createListener();
    onBeforeUnmount(() => {
      roomQueueRef.off();
    });
    return {
      currentTrack,
    };
  },
});
</script>