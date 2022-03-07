<template>
  <div class="text-lg mt-6">User List</div>
  <div v-for="user in sortedUserList" :key="user.id">
    <p>{{ user.name }}</p>
    <img
      class="w-16 h-16 rounded-full"
      :src="user.photo"
      :alt="user.id"
      referrerpolicy="no-referrer"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref } from "vue";
import { statusRef } from "../../firebase";
import { useRoute } from "vue-router";
import { ListUser } from "../../interfaces";

export default defineComponent({
  name: "OnlineUsers",
  setup() {
    const userList = ref<Array<ListUser>>([]);
    const route = useRoute();
    const roomID = route.params.id.toString();
    const roomOnlineRef = statusRef.child(roomID);

    // TODO: apparently localeCompare is better for non a-z characters
    // sorts user list alphabetically
    // difficult with firebase query if we want to do per room status
    const sortedUserList = computed(() => {
      return [...userList.value].sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
        else return 0;
      });
    });

    onMounted(() => {
      roomOnlineRef.on("child_removed", (snapshot) => {
        const index = userList.value.findIndex(
          (user) => user.id === snapshot.key
        );
        userList.value.splice(index, 1);
      });
      roomOnlineRef.on("child_added", (snapshot) => {
        const firstDevice = Object.keys(snapshot.val())[0];
        userList.value.push({
          id: snapshot.key,
          ...snapshot.val()[firstDevice],
        });
      });
    });
    onUnmounted(() => {
      roomOnlineRef.off();
    });
    return {
      sortedUserList,
    };
  },
});
</script>