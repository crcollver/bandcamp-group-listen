<template>
  <router-link to="/" class="underline font-bold" v-if="initialized">
    Dashboard
  </router-link>
  <router-view v-if="initialized"></router-view>
  <div v-if="!initialized">Loading animation...</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import useAuth from "@/composables/useAuth";

export default defineComponent({
  name: "App",
  setup() {
    const { initialized } = useAuth();
    return {
      initialized,
    };
  },
});
</script>
