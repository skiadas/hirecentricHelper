<script setup lang="ts">
import {inject, ref, type Ref, type PropType, watch} from 'vue';
import type {FileInfo} from '../types';
import {downloadFile, checkFile} from '#preload';

import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {faCheck, faDownload, faSpinner} from '@fortawesome/free-solid-svg-icons';

const props = defineProps({
  file: {type: Object as PropType<FileInfo>, required: true},
});

const basePath = (inject('base-path') as Ref<string>).value;
const searchId = (inject('search-id') as Ref<string>).value;
const applicantFolder = inject('applicant-folder') as string;
const shouldDownloadRef = inject('download-all') as Ref<boolean>;
const pendingCountRef = inject('pending-count') as Ref<number>;

const status = ref<'pending' | 'exists' | 'download'>('pending');

checkFile(basePath, searchId, applicantFolder, props.file.filename).then(exists => {
  status.value = exists ? 'exists' : 'download';
});

watch(shouldDownloadRef, shouldDownload => {
  if (shouldDownload) download();
});

async function download() {
  if (status.value == 'exists') return;
  pendingCountRef.value += 1;
  status.value = 'pending';
  downloadFile(basePath, searchId, applicantFolder, props.file.filename, props.file.href).then(
    () => {
      status.value = 'exists';
      pendingCountRef.value -= 1;
    },
  );
}
</script>
<template>
  <p class="file">
    <span class="filename">{{ file.filename }}</span>
    <button
      v-if="status == 'download'"
      @click="download"
    >
      <FontAwesomeIcon :icon="faDownload" />
    </button>
    <FontAwesomeIcon
      v-else-if="status == 'exists'"
      :icon="faCheck"
    />
    <FontAwesomeIcon
      v-else
      :icon="faSpinner"
    />
  </p>
</template>

<style scoped>
.file {
  display: flex;
  flex-direction: row;
}
.file * {
  flex: 0 0 2em;
}
.file .filename {
  flex: 1 1 auto;
}
</style>
