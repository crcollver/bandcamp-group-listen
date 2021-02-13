<template>
  <div v-if="!loading && !error">
    <RoomCard
      class="mt-4"
      v-for="room in allRooms"
      :key="room.id"
      :room="room"
    />
  </div>
  <div v-if="loading">Loading rooms...</div>
  <div v-if="!loading && error">Error loading rooms.</div>
  <button @click="onUserLogout($router)" class="bg-red-500 mt-4">
    Log Out
  </button>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { roomsRef } from "@/firebase";
import useAuth from "@/composables/useAuth";
import RoomCard from "@/components/Dashboard/RoomCard.vue";
import { Room } from "@/interfaces";

export default defineComponent({
  name: "Dashboard",
  components: {
    RoomCard,
  },
  setup() {
    const { onUserLogout } = useAuth();
    const allRooms = ref<Room[]>([]);
    const loading = ref<boolean>(true);
    const error = ref<string>("");

    const fetchRooms = async () => {
      try {
        await roomsRef.once("value", (snapshot) => {
          snapshot.forEach((child) => {
            allRooms.value.push({ id: child.key, ...child.val() });
          });
        });
      } catch (err) {
        error.value = "";
      } finally {
        loading.value = false;
      }
    };
    fetchRooms();
    return { allRooms, loading, error, onUserLogout };
  },
});
</script>