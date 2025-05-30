

<template>
  <div class="p-4 px-8">
    <header class="flex flex-col items-center justify-center">
      <div class="flex flex-row justify-center space-x-4 w-full">
        <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="40" height="40" />
      </div>

      <!-- Toggle Switch -->
      <input
        type="checkbox"
        class="toggle theme-controller fixed right-4"
        :checked="theme === 'sunset'"
        @change="toggleTheme"
      />

      <nav class="flex flex-row space-x-4">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/stuff">stuff</RouterLink>
      </nav>
    </header>

    <RouterView />
  </div>
</template>


<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

const theme = ref<'caramellatte' | 'sunset'>('caramellatte')

// Load stored theme or default
onMounted(() => {
  const storedTheme = localStorage.getItem('theme') as 'caramellatte' | 'sunset'
  theme.value = storedTheme || 'caramellatte'
  document.documentElement.setAttribute('data-theme', theme.value)
})

// Watch and apply theme changes
watch(theme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
})

// Toggle handler
function toggleTheme() {
  theme.value = theme.value === 'caramellatte' ? 'sunset' : 'caramellatte'
}
</script>
