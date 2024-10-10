<script setup lang="ts">
const props = defineProps({savePath: {type: String, required: true}});
defineEmits(['prompt-location']);
</script>
<template>
  <p
    >Documents saved in:
    <input
      v-if="props.savePath != ''"
      type="text"
      disabled
      :value="props.savePath"
    />
    <button
      v-else
      @click="$emit('prompt-location')"
      >Choose save location!</button
    >
  </p>
</template>
