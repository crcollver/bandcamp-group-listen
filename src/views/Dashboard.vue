<template>
  <div v-if="!allRooms.loading && !allRooms.error">
    <RoomCard
      class="mt-4"
      v-for="room in allRooms"
      :key="room.id"
      :room="room"
    />
  </div>
  <div v-if="allRooms.loading">Loading rooms...</div>
  <div v-if="!allRooms.loading && allRooms.error">Error loading rooms.</div>
  <button @click="onUserLogout($router)" class="bg-red-500 mt-4">
    Log Out
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import useAuth from "@/hooks/useAuth";
import useRooms from "@/hooks/useRooms";
import RoomCard from "@/components/RoomCard.vue";

export default defineComponent({
  name: "Dashboard",
  components: {
    RoomCard,
  },
  setup() {
    const { onUserLogout } = useAuth();
    const { fetchRooms, rooms: allRooms, loading, error } = useRooms();
    fetchRooms();
    return {
      onUserLogout,
      allRooms,
      loading,
      error,
    };
  },
});
</script>