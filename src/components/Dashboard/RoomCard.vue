<template>
  <div class="pa-4 border">
    <router-link :to="{ name: 'Room', params: { id: room.id } }">
      <h1>{{ room.title }}</h1>
      <p v-if="room.nowplaying">
        Listening to: {{ room.nowplaying.title }} | {{ room.nowplaying.artist }}
      </p>
      <p v-if="!room.nowplaying">Not listening to anything yet!</p>
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Room } from "@/interfaces";

export default defineComponent({
  props: {
    room: {
      type: Object as () => Room,
      required: true,
    },
  },
});
</script>