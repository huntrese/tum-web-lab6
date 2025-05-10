<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'

import { computed } from 'vue'

const isDarkMode = computed(() => window.matchMedia('(prefers-color-scheme: dark)').matches)

document.documentElement.classList.toggle('dark', isDarkMode.value)
</script>




<template>
  <div class="flex flex-col items-center justify-start pt-2 gap-8" :class="{ 'dark': isDarkMode }">
    <header class="flex flex-col items-center justify-start ">
      <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="40" height="40" />


      <nav class="flex flex-row items-center justify-center mt-4 space-x-4 text-xl">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/stuff">stuff</RouterLink>
      </nav>
    </header>

    <RouterView />
  </div>
</template>

<style scoped></style>
