<template>
  <messaging class="w-1/2" />
  <queue />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Messaging from "@/components/Room/Messaging.vue";
import Queue from "@/components/Room/Queue.vue";

export default defineComponent({
  name: "Room",
  components: {
    Messaging,
    Queue,
  },
});
</script>