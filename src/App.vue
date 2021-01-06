<template>
  <router-link to="/" class="underline font-bold">Dashboard</router-link>
  <router-view></router-view>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
});
</script>
