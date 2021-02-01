<template>
  <div class="mt-6">
    <input
      type="text"
      v-model="audioUrl"
      placeholder="Enter a bandcamp link."
      class="border"
    />
    <button class="bg-green-500">Add Song!</button>
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
import { queueRef } from "@/firebase";
import { defineComponent, onBeforeUnmount, ref } from "vue";
import { useRoute } from "vue-router";
import { Track } from "@/interfaces";

export default defineComponent({
  name: "Queue",
  setup() {
    const audioUrl = ref<string>("");
    const musicQueue = ref<Track[]>([]);
    const route = useRoute();
    const roomQueueRef = queueRef.child(route.params.id.toString());

    // initialize data with first tracks and watch for removals
    // since this is a queue, removals will occur on first item
    const createListener = async () => {
      roomQueueRef.on("child_removed", () => {
        if (musicQueue.value.length !== 0) {
          musicQueue.value.shift(); // remove first element
        }
      });
      roomQueueRef.limitToFirst(4).on("child_added", (snapshot) => {
        if (snapshot.val().status === "queued") {
          musicQueue.value.push({ id: snapshot.key, ...snapshot.val() });
        }
      });
    };
    createListener();
    onBeforeUnmount(() => roomQueueRef.off());
    return { audioUrl, musicQueue };
  },
});
</script>