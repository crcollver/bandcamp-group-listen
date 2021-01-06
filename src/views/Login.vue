<template>
  <HelloWorld msg="Welcome to Your Vue.js App" />
  <button @click="signInWithGoogle" class="bg-red-500">
    Sign in with Google
  </button>
</template>

<script lang="ts">
import HelloWorld from "@/components/HelloWorld.vue";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { auth, createAuthProvider } from "../firebase";

export default defineComponent({
  name: "Login",
  components: {
    HelloWorld,
  },
  setup() {
    const router = useRouter();
    const signInWithGoogle = async (): Promise<void> => {
      const provider = createAuthProvider();
      try {
        await auth.signInWithPopup(provider);
        router.push({ name: "Dashboard" });
      } catch (err) {
        console.log("Unsuccessful login, show UI element.", err);
      }
    };
    return {
      signInWithGoogle,
    };
  },
});
</script>
