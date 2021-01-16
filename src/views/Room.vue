<template>
  <messaging />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Messaging from "@/components/Room/Messaging.vue";

export default defineComponent({
  name: "Room",
  components: {
    Messaging,
  },
});
</script>