<template>
  <img alt="Vue logo" src="./assets/logo.png" class="w-auto" />
  <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
  <button @click="signInWithGoogle" class="bg-red-500">
    Sign in with Google
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { auth, createAuthProvider } from "./firebase";
import HelloWorld from "./components/HelloWorld.vue";

export default defineComponent({
  name: "App",
  components: {
    HelloWorld,
  },
  setup() {
    const signInWithGoogle = async () => {
      const provider = createAuthProvider();
      try {
        const result = await auth.signInWithPopup(provider);
        console.log("Login successful", result);
      } catch (err) {
        console.log("Unsuccessful", err);
      }
    };
    return {
      signInWithGoogle,
    };
  },
});
</script>
