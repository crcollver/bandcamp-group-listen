<template>
  <router-link to="/login" class="mr-2 underline font-bold">Login</router-link>
  <router-link to="/" class="underline font-bold">Dashboard</router-link>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { auth } from "./firebase";

export default defineComponent({
  name: "App",
  setup() {
    const router = useRouter();
    auth.onAuthStateChanged((user) => {
      if (user) {
        router.push({ name: "Dashboard" });
      } else {
        router.push({ name: "Login" });
      }
    });
  },
});
</script>
