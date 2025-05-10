<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'


</script>




<template>
  <div class="theme-controller flex flex-col items-center justify-start px-8 py-2 gap-8 min-h-full">
    <header class="flex flex-col items-center w-full">
      <div class="flex flex-row items-center justify-between mt-4 space-x-4 text-2xl">
        <div></div>
        <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="40" height="40" />
        <input type="checkbox" value="caramellatte" class="toggle theme-controller" />
      </div>
      <nav class="flex flex-row items-center justify-center mt-4 space-x-4 text-xl">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/stuff">stuff</RouterLink>
      </nav>
    </header>

    <RouterView />
  </div>
</template>

<style scoped></style>
