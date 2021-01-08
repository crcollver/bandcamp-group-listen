<template>
  <div v-if="!allRooms.loading && !allRooms.error">
    <RoomCard
      class="mt-4"
      v-for="room in allRooms.data"
      :key="room.id"
      :room="room"
    />
  </div>
  <div v-if="allRooms.loading">Loading rooms...</div>
  <div v-if="!allRooms.loading && allRooms.error">Error loading rooms.</div>
  <button @click="onUserLogout" class="bg-red-500 mt-4">Log Out</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { auth, roomsRef } from "../firebase";
import useSnapshotOnce from "../hooks/useSnapshotOnce";
import RoomCard from "../components/RoomCard.vue";

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
    const router = useRouter();
    const { fbState: allRooms, fetchFromFB } = useSnapshotOnce<Room>(roomsRef);
    fetchFromFB();
    const onUserLogout = async () => {
      try {
        await auth.signOut();
        router.push({ name: "Login" });
      } catch (err) {
        console.log("Unable to logout.");
      }
    };
    return {
      onUserLogout,
      allRooms,
    };
  },
});
</script>