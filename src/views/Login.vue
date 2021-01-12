<template>
  <button @click="signInWithGoogle($router)" class="bg-red-500">
    Sign in with Google
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import useAuth from "@/hooks/useAuth";

export default defineComponent({
  name: "Login",
  setup() {
    const { signInWithGoogle } = useAuth();
    return {
      signInWithGoogle,
    };
  },
});
</script>
