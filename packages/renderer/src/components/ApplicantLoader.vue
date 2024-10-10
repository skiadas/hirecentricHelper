<script setup lang="ts">
import {inject, provide, ref, type Ref} from 'vue';
import {getCandidateLinks, getDataForSearch, saveApplicants} from '#preload';
import ApplicantView from './ApplicantView.vue';
import type {LoadingAppInfo} from '../types';

const props = defineProps({
  searchId: {type: String, required: true},
});

type LoadingStates =
  | {status: 'starting'}
  | {status: 'loading'; count: number; max: number}
  | {status: 'loaded'};

const loadingInfo = ref<LoadingStates>({status: 'starting'});
const applicants = ref<LoadingAppInfo[]>([]);

const downloadAll = ref(false);
provide('download-all', downloadAll);
const pendingCount = ref(0); // How many downloads are pending
provide('pending-count', pendingCount);

const basePathRef = inject('base-path') as Ref<string>;

getDataForSearch(props.searchId).then(async applicantInfo => {
  loadingInfo.value = {status: 'loading', count: 0, max: applicantInfo.length};
  applicants.value = applicantInfo.map(({id, name}) => ({id, name, files: [], loaded: false}));
  for (const applicant of applicants.value) {
    applicant.files = await getCandidateLinks(applicant.id);
    applicant.loaded = true;
    loadingInfo.value.count += 1;
    if (loadingInfo.value.count > 3) break;
  }
  loadingInfo.value = {status: 'loaded'};
  createCSV();
});

async function createCSV() {
  const applicantsSimple = applicants.value.map(({id, name}) => ({id, name}));
  await saveApplicants(basePathRef.value, props.searchId, applicantsSimple);
}

function setDownloadAll() {
  downloadAll.value = true;
}
</script>
<template>
  <p v-if="loadingInfo.status == 'starting'">Getting applicant list ...</p>
  <p v-else-if="loadingInfo.status == 'loading'">
    Retrieving applicants ... {{ loadingInfo.count }} / {{ loadingInfo.max }}
  </p>
  <p v-else>
    Found {{ applicants.length }} applicants.
    <button
      @click="setDownloadAll"
      :disabled="downloadAll == true"
    >
      Download all!
    </button>
    <span class="badge" v-if="pendingCount > 0">{{ pendingCount }}</span>
  </p>
  <!-- <button @click="downloadAll">Download all files!</button>-->
  <div class="applicants">
    <ApplicantView
      v-for="applicant in applicants"
      :key="applicant.id"
      :applicant="applicant"
    >
    </ApplicantView>
  </div>
</template>

<style lang="css" scoped>
.applicants {
  display: flex;
  flex-direction: column;
}
.badge {
  background-color: bisque;
  border: 1px solid black;
  border-radius: 20px;
  min-width: 1.3em;
  display: inline-block;
  margin-left: 5px;
}
</style>
