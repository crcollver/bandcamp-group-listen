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
    <p>{{ playerStatus.currentTime }} / {{ playerStatus.duration }}</p>
  </div>
  <p v-if="!currentTrack">Nothing playing yet!</p>
  <input
    type="range"
    min="0"
    max="1"
    step="0.01"
    v-model.number="playerStatus.volume"
    @input="changeVolume"
  />
  <button @click="toggleMute">
    {{ playerStatus.isMuted ? "Unmute" : "Mute" }}
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
    const {
      playerStatus,
      toggleMute,
      changeVolume,
      setupTrack,
    } = useAudioPlayer();

    const currentTrack = ref<Track | null>(null);
    const route = useRoute();
    const nowplayingRef = musicRef.child(
      `${route.params.id.toString()}/nowplaying`
    );

    /**
     * Gets the calculated time accounting for server offset
     * @param offset the offset of server and client in milliseconds
     * @returns current time in seconds
     */
    const getServerTimeSeconds = (offset: number) => {
      return Math.round((Date.now() + offset) / 1000);
    };

    /**
     * Compares expected end time to track token expiry time
     * @param serverTime calculated server offset in seconds
     * @returns true if track is expired
     */
    const trackExpired = (serverTime: number) => {
      const trackInfo = currentTrack.value;
      if (trackInfo) {
        const expectedEndTime = serverTime + trackInfo.duration;
        if (parseInt(trackInfo.expires) <= expectedEndTime) {
          return true;
        }
      }
      return false;
    };

    const setupListeners = async () => {
      nowplayingRef.on("child_removed", () => {
        currentTrack.value = null;
      });

      const offset = (await offsetRef.once("value")).val();
      nowplayingRef.limitToFirst(1).on("child_added", (snapshot) => {
        currentTrack.value = {
          id: snapshot.key,
          ...snapshot.val(),
        };
        const serverTime = getServerTimeSeconds(offset);
        const startTime = serverTime - currentTrack.value!.startTime!;
        if (!trackExpired(serverTime)) {
          setupTrack(startTime, currentTrack.value!.audioSrc);
        } else {
          // rescrape the nowplaying track
          return nowplayingRef
            .child(`${currentTrack.value!.id}/rescrape`)
            .set(true);
        }
      });
      nowplayingRef.on("child_changed", (snapshot) => {
        const changedTrack: Track = snapshot.val();
        if (
          currentTrack.value &&
          changedTrack.audioSrc !== currentTrack.value.audioSrc
        ) {
          currentTrack.value.audioSrc = changedTrack.audioSrc;
          const startTime =
            getServerTimeSeconds(offset) - currentTrack.value!.startTime!;
          setupTrack(startTime, currentTrack.value!.audioSrc);
        }
      });
    };

    // request to remove track from nowplaying once it has finished
    // no error is thrown when trying to remove non-existing item according to docs
    watch(
      () => playerStatus.hasEnded,
      async () => {
        if (playerStatus.hasEnded) {
          await nowplayingRef.child(currentTrack.value!.id).remove();
        }
      }
    );

    onMounted(setupListeners);
    onUnmounted(() => nowplayingRef.off());

    return {
      currentTrack,
      playerStatus,
      toggleMute,
      changeVolume,
    };
  },
});
</script>