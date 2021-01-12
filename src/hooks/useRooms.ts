import { ref } from "vue";
import { roomsRef } from "@/firebase";

interface Room {
  id: string;
  title: string;
  online: number;
}

export default function() {
  const rooms = ref<Room[]>([]);
  const loading = ref<boolean>(true);
  const error = ref<string>("");

  const fetchRooms = async () => {
    try {
      await roomsRef.once("value", snapshot => {
        snapshot.forEach(child => {
          rooms.value.push({ id: child.key, ...child.val() });
        });
      });
    } catch (err) {
      error.value = "";
    } finally {
      loading.value = false;
    }
  };
  return { rooms, loading, error, fetchRooms };
}
