<script setup lang="ts">
import UploadedFile from './UploadedFile.vue';
import {provide, ref, type PropType} from 'vue';
import type {LoadingAppInfo} from '../types';

import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {faCheck, faQuestion} from '@fortawesome/free-solid-svg-icons';

const props = defineProps({
  applicant: {
    type: Object as PropType<LoadingAppInfo>,
    required: true,
  },
});
const combinedName = `${props.applicant.id}-${props.applicant.name.replace(/\W+/g, '-')}`;
provide('applicant-folder', combinedName);

const hideFiles = ref(true);
function toggleCollapse() {
  hideFiles.value = !hideFiles.value;
}
</script>

<template>
  <div class="applicant">
    <p @click="toggleCollapse">
      <span>{{ applicant.name }}</span>
      <span :class="['load-status', applicant.loaded ? 'loaded' : ''].join(' ')">
        <FontAwesomeIcon
          v-if="applicant.loaded"
          :icon="faCheck"
        />
        <FontAwesomeIcon
          v-else
          :icon="faQuestion"
        />
        <!-- {{ applicant.loaded ? '✔' : '?' }} -->
      </span>
    </p>
    <div
      class="files"
      :hidden="hideFiles"
    >
      <UploadedFile
        v-for="file in applicant.files"
        :key="file.filename"
        :file="file"
      />
    </div>
  </div>
</template>

<style lang="css" scoped>
.applicant {
  border: 1px solid gray;
  border-radius: 4px;
  margin: 2px;
  padding: 0 5px;
}
div > p {
  display: flex;
  flex-direction: row;
}
div > p * {
  flex: 1 1 auto;
}
div > p .load-status {
  flex: 0 0 auto;
}

.load-status {
  color: #faba25;
}
.load-status.loaded {
  color: green;
}
</style>
