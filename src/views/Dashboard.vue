<template>
  <h1>This is our dashboard</h1>
  <button @click="onUserLogout" class="bg-red-500">Log Out</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../firebase";

export default defineComponent({
  name: "Dashboard",
  setup() {
    const router = useRouter();
    const onUserLogout = async (): Promise<void> => {
      try {
        await auth.signOut();
        router.push({ name: "Login" });
      } catch (err) {
        console.log("Unable to logout.");
      }
    };
    return {
      onUserLogout,
    };
  },
});
</script>