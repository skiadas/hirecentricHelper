<script lang="ts" setup>
defineProps({failedLogin: Boolean});
const emit = defineEmits(['login']);

async function submit(ev: Event) {
  ev.preventDefault();
  const data = new FormData(ev.srcElement as HTMLFormElement);
  const username = data.get('username') as string;
  const password = data.get('password') as string;
  emit('login', username, password);
}
</script>

<template>
  <form
    id="login"
    @submit="submit"
  >
    <fieldset>
      <legend>HireCentric Credentials</legend>
      <p v-if="$props.failedLogin">Login failed! Please try again.</p>
      <label for="username"
        >Username
        <input
          name="username"
          type="text" /></label
      ><br />
      <label for="password"
        >Password
        <input
          name="password"
          type="password" /></label
      ><br />
      <button type="submit">Submit</button>
    </fieldset>
  </form>
</template>
