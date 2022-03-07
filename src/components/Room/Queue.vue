<template>
  <div class="mt-6">
    <input
      type="text"
      v-model="bandcampUrl"
      placeholder="Enter a bandcamp link."
      class="border"
    />
    <button class="bg-green-500" @click="onAddSong">Add Song!</button>
    <ul v-if="musicQueue.length">
      <li v-for="track in musicQueue" :key="track.id">
        <img
          :src="track.albumArt"
          :alt="track.artist + track.title"
          class="w-24"
        />
        <h1>{{ track.title }}</h1>
        <h2>{{ track.albumTitle }}</h2>
        <h3>{{ track.artist }}</h3>
      </li>
    </ul>
    <p v-if="!musicQueue.length">No songs in the queue yet!</p>
  </div>
</template>

<script lang="ts">
import { musicRef, convertAudio } from "../../firebase";
import { defineComponent, onBeforeUnmount, ref } from "vue";
import { useRoute } from "vue-router";
import { Track } from "../../interfaces";

export default defineComponent({
  name: "Queue",
  setup() {
    const route = useRoute();
    const roomID = route.params.id.toString();
    const bandcampUrl = ref<string>("");
    const urlError = ref<string>("");

    /**
     * Very simple regex for url validation
     * Bandcamp urls can be a band's custom domain, so we allow all http urls
     */
    const onAddSong = async () => {
      const validUrl =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
      urlError.value = "";

      if (!validUrl.test(bandcampUrl.value)) {
        urlError.value = "Not a valid URL";
        return;
      }
      try {
        await convertAudio({ roomID, url: bandcampUrl.value });
      } catch (error) {
        urlError.value = error.message;
      }
    };

    const musicQueue = ref<Track[]>([]);
    const roomQueueRef = musicRef.child(`${roomID}/queue`);

    // initialize data with first tracks and watch for removals
    // since this is a queue, removals will occur on first item
    const createListener = async () => {
      roomQueueRef.on("child_removed", () => {
        if (musicQueue.value.length !== 0) {
          musicQueue.value.shift(); // remove first element
        }
      });
      roomQueueRef.limitToFirst(4).on("child_added", (snapshot) => {
        musicQueue.value.push({ id: snapshot.key, ...snapshot.val() });
      });
    };
    createListener();
    onBeforeUnmount(() => roomQueueRef.off());
    return { bandcampUrl, musicQueue, onAddSong };
  },
});
</script>