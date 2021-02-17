<template>
  <div class="border">
    <div class="font-bold">{{ message.name }}</div>
    <div>{{ message.message }}</div>
    <div>{{ formattedTime }}</div>
  </div>
</template>

<script lang="ts">
import { Message } from "@/interfaces";
import { PropType, defineComponent, computed } from "vue";
export default defineComponent({
  name: "MessageBubble",
  props: {
    message: {
      type: Object as PropType<Message>,
      required: true,
    },
  },
  setup(props) {
    const formattedTime = computed(() => {
      const timestamp = props.message.sentAt;
      if (timestamp) {
        const sent = new Date(timestamp);
        return sent.toLocaleString();
      }
      return null;
    });
    return { formattedTime };
  },
});
</script>