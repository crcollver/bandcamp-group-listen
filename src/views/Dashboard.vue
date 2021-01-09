<template>
  <div v-if="!allRooms.loading && !allRooms.error">
    <RoomCard
      class="mt-4"
      v-for="room in allRooms.data"
      :key="room.id"
      :room="room"
    />
  </div>
  <router-link to="/room">To Room</router-link>
  <div v-if="allRooms.loading">Loading rooms...</div>
  <div v-if="!allRooms.loading && allRooms.error">Error loading rooms.</div>
  <button @click="onUserLogout($router)" class="bg-red-500 mt-4">
    Log Out
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { roomsRef } from "@/firebase";
import useAuth from "@/hooks/useAuth";
import useSnapshotOnce from "@/hooks/useSnapshotOnce";
import RoomCard from "@/components/RoomCard.vue";

interface Room {
  id: string;
  title: string;
  online: number;
}

export default defineComponent({
  name: "Dashboard",
  components: {
    RoomCard,
  },
  setup() {
    const { fbState: allRooms, fetchFromFB } = useSnapshotOnce<Room>(roomsRef);
    const { onUserLogout } = useAuth();
    fetchFromFB();
    return {
      onUserLogout,
      allRooms,
    };
  },
});
</script>