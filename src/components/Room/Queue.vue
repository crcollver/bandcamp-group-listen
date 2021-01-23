<template>
  <div class="mt-6">
    <input
      type="text"
      v-model="audioUrl"
      placeholder="Enter a bandcamp link."
      class="border"
    />
    <button @click="onAddSong" class="bg-green-500">Add Song!</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { convertRef } from "@/firebase";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "Queue",
  setup() {
    const audioUrl = ref<string>("");
    const route = useRoute();
    const onAddSong = async () => {
      try {
        // only need url attached to push id for now
        // could need more info for cloud function in future
        await convertRef.child(route.params.id.toString()).push(audioUrl.value);
        audioUrl.value = "";
      } catch (err) {
        console.log(err);
      }
    };
    return { audioUrl, onAddSong };
  },
});
</script>