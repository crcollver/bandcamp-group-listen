<template>
  <RoomCard class="mt-4" v-for="room in allRooms" :key="room.id" :room="room" />
  <button @click="onUserLogout($router)" class="bg-red-500 mt-4">
    Log Out
  </button>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref } from "vue";
import { roomsRef } from "../firebase";
import useAuth from "../composables/useAuth";
import RoomCard from "../components/Dashboard/RoomCard.vue";
import { Room } from "../interfaces";

export default defineComponent({
  name: "Dashboard",
  components: {
    RoomCard,
  },
  setup() {
    const { onUserLogout } = useAuth();
    const allRooms = ref<Room[]>([]);

    roomsRef.on("child_added", (snapshot) => {
      allRooms.value.push({ id: snapshot.key, ...snapshot.val() });
    });
    roomsRef.on("child_changed", (snapshot) => {
      const idx = allRooms.value.findIndex((room) => room.id === snapshot.key);
      allRooms.value[idx] = { id: snapshot.key, ...snapshot.val() };
    });

    onUnmounted(() => {
      roomsRef.off();
    });

    return { allRooms, onUserLogout };
  },
});
</script>