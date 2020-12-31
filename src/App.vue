<template>
  <router-link to="/login" class="mr-2 underline font-bold">Login</router-link>
  <router-link to="/" class="underline font-bold">Dashboard</router-link>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
});
</script>
