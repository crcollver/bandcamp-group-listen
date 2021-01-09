<template>
  <HelloWorld msg="Welcome to Your Vue.js App" />
  <button @click="signInWithGoogle($router)" class="bg-red-500">
    Sign in with Google
  </button>
</template>

<script lang="ts">
import HelloWorld from "@/components/HelloWorld.vue";
import { defineComponent } from "vue";
import useAuth from "@/hooks/useAuth";

export default defineComponent({
  name: "Login",
  components: {
    HelloWorld,
  },
  setup() {
    const { signInWithGoogle } = useAuth();
    return {
      signInWithGoogle,
    };
  },
});
</script>
