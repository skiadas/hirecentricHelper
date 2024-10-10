<script setup lang="ts">
import type {PropType} from 'vue';

defineProps({
  searches: {
    type: Array as unknown as PropType<{id: string; title: string}[]>,
    required: true,
  },
});
defineEmits(['load-search']);
</script>
<template>
  <ul>
    <li
      @click="$emit('load-search', search.id)"
      v-for="search in searches"
      :key="search.id"
    >
      <span>{{ search.title }}</span>
    </li>
  </ul>
</template>

<style scoped>
li {
  display: flex;
  margin: 0.2em;
  padding: 0.1em;
  border: 1px solid gray;
  border-radius: 3px;
  height: 3em;
  align-items: center;
}
li:hover {
  background-color: lightgray;
}
li span {
  flex: 1 1 auto;
}
</style>
