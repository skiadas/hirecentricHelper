<script lang="ts" setup>
import LoginForm from '/@/components/LoginForm.vue';
import SaveLocation from '/@/components/SaveLocation.vue';
import PositionsList from '/@/components/PositionsList.vue';
import ApplicantLoader from '/@/components/ApplicantLoader.vue';
import {provide, ref} from 'vue';
import {loginWithCredentials, getSearches, chooseDownloadLocation} from '#preload';

const APP_VERSION = import.meta.env.VITE_APP_VERSION;

// The result of the login attempt:
// null: no attempt yet
// false: failed attempt
// true: successful login
const loggedIn = ref<null | boolean>(null);
// Path on computer where the information is to be stored
const savePath = ref('');
const searches = ref<null | {id: string; title: string}[]>(null);
const selectedSearch = ref<null | string>(null);

provide('search-id', selectedSearch);
provide('base-path', savePath);

async function handleLogin(username: string, password: string) {
  const successful = await loginWithCredentials(username, password);
  if (successful) {
    getSearches().then(v => (searches.value = v));
  }
  loggedIn.value = successful;
}

async function promptSaveLocation() {
  const downloadLocation = await chooseDownloadLocation();
  console.log(downloadLocation);
  savePath.value = downloadLocation || '';
  console.log(savePath.value);
}

async function showSearchData(searchId: string) {
  selectedSearch.value = searchId;
}
</script>

<template>
  <h1
    >HireCentric Helper
    <span class="small">(v. {{ APP_VERSION }})</span>
  </h1>
  <SaveLocation
    :save-path="savePath"
    @prompt-location="promptSaveLocation"
  />
  <LoginForm
    v-if="!loggedIn && savePath != ''"
    @login="handleLogin"
    :failed-login="loggedIn == false"
  ></LoginForm>
  <PositionsList
    v-if="searches != null"
    :searches="searches"
    @load-search="showSearchData"
  />
  <ApplicantLoader
    v-if="selectedSearch"
    :search-id="selectedSearch"
  />
  <p v-else-if="searches != null">Select a position to view applicant information.</p>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 60px auto;
  max-width: 700px;
}

fieldset {
  margin: 2rem;
  padding: 1rem;
}

.small {
  font-size: 50%;
  font-weight: normal;
}
</style>
