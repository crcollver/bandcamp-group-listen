<template>
  <div class="pa-4 border">
    <h1>{{ room.title }}</h1>
    <p>{{ room.online }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface Room {
  id: string;
  title: string;
  online: number;
}

export default defineComponent({
  props: {
    room: {
      type: Object as () => Room,
      required: true,
    },
  },
});
</script>