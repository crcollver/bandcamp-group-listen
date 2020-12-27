<template>
  <h1>This is our dashboard</h1>
  <button @click="onUserLogout" class="bg-red-500">Logout</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { auth } from "../firebase";

export default defineComponent({
  name: "Dashboard",
  setup() {
    const onUserLogout = async () => {
      try {
        await auth.signOut();
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