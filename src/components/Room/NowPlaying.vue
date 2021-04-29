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

    const getServerTimeSeconds = (offset: number) => {
      return Math.round((Date.now() + offset) / 1000);
    };

    const currentTrack = ref<Track | null>(null);
    const route = useRoute();
    const nowplayingRef = musicRef.child(
      `${route.params.id.toString()}/nowplaying`
    );

    /**
     * Compares expected end time to track token expiry time
     * @param serverTime calculated server offset in seconds
     * @returns true if track is expired
     */
    const trackExpired = (startTime: number) => {
      const trackInfo = currentTrack.value;
      if (trackInfo) {
        const expectedEndTime = startTime + trackInfo.duration;
        if (parseInt(trackInfo.expires) <= expectedEndTime) {
          return true;
        }
      }
      return false;
    };

    const setupListeners = async () => {
      // TODO: no need to set null on every removal
      // need reference to queue to set to null when queue is empty
      nowplayingRef.on("child_removed", () => {
        currentTrack.value = null;
      });

      /**
       * Listen for new tracks added to nowplaying, only play when:
       *  (1) the status of the track is set to playing
       *  (2) and when the track link is not expired
       * Otherwise, set the rescrape flag for firebase functions to handle
       */
      const offset = (await offsetRef.once("value")).val();
      nowplayingRef.limitToFirst(1).on("child_added", (snapshot) => {
        currentTrack.value = {
          id: snapshot.key,
          ...snapshot.val(),
        };
        if (currentTrack.value?.status === "playing") {
          const serverTime = getServerTimeSeconds(offset);
          const startTime = serverTime - currentTrack.value!.startTime!;
          if (!trackExpired(startTime)) {
            setupTrack(startTime, currentTrack.value!.audioSrc);
          } else {
            // rescrape the nowplaying track
            return nowplayingRef
              .child(`${currentTrack.value!.id}/rescrape`)
              .set(true);
          }
        }
      });

      /**
       * Listen for changes to nowplaying either when:
       *  (1) the audio source has changed due to a recrawl
       *  (2) or the track's status has changed to playing
       */
      nowplayingRef.on("child_changed", (snapshot) => {
        const changedTrack: Track = snapshot.val();
        if (
          changedTrack.audioSrc !== currentTrack.value?.audioSrc ||
          (changedTrack.status === "playing" &&
            currentTrack.value?.status === "paused")
        ) {
          currentTrack.value = {
            id: snapshot.key,
            ...snapshot.val(),
          };
          const startTime =
            getServerTimeSeconds(offset) - currentTrack.value?.startTime!;
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