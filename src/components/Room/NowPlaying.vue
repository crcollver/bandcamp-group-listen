<template>
  <div v-if="currentTrack" class="mt-6">
    <h1>{{ currentTrack.title }}</h1>
    <h2>{{ currentTrack.albumTitle }}</h2>
    <h3>{{ currentTrack.artist }}</h3>
    <img
      :src="currentTrack.albumArt"
      :alt="currentTrack.artist + currentTrack.title"
      class="w-48"
    />
    <p>{{ currentTime }} / {{ duration }}</p>
  </div>
  <p v-if="!currentTrack">Nothing playing yet!</p>
  <input
    type="range"
    min="0"
    max="1"
    step="0.01"
    v-model.number="volume"
    @input="changeVolume"
  />
  <button @click="toggleMute">
    {{ isMuted ? "Unmute" : "Mute" }}
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import useAudioPlayer from "@/composables/useAudioPlayer";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { musicRef, offsetRef } from "@/firebase";
import { Track } from "@/interfaces";

export default defineComponent({
  name: "NowPlaying",
  setup() {
    const currentTrack = ref<Track | null>(null);

    const route = useRoute();
    const nowplayingRef = musicRef.child(
      `${route.params.id.toString()}/nowplaying`
    );

    const {
      volume,
      isMuted,
      currentTime,
      duration,
      hasEnded,
      toggleMute,
      changeVolume,
      setupTrack,
    } = useAudioPlayer();

    const setupListeners = async () => {
      const offset: number = (await offsetRef.once("value")).val();
      nowplayingRef.on("child_removed", () => {
        currentTrack.value = null;
      });

      nowplayingRef.limitToFirst(1).on("child_added", (snapshot) => {
        currentTrack.value = {
          id: snapshot.key,
          ...snapshot.val(),
        };
        const startTime =
          (Date.now() + offset - currentTrack.value!.startTime!) / 1000;
        setupTrack(startTime, currentTrack.value!.audioSrc);
      });
    };

    // request to remove track from nowplaying once it has finished
    // no error is thrown when trying to remove non-existing item according to docs
    watch(hasEnded, async () => {
      if (hasEnded.value) {
        await nowplayingRef.child(currentTrack.value!.id).remove();
      }
    });

    onMounted(setupListeners);
    onUnmounted(() => nowplayingRef.off());

    return {
      currentTrack,
      volume,
      isMuted,
      currentTime,
      duration,
      hasEnded,
      toggleMute,
      changeVolume,
    };
  },
});
</script>