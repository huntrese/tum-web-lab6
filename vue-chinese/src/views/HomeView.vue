<template>
  <div class="min-h-screen bg-base-200">
    <!-- Navigation -->
    <nav class="bg-base-100 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-accent">Chinese Learning App</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link 
                to="/"
                class="border-accent text-base-content inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </router-link>
              <router-link 
                to="/translate" 
                class="border-transparent text-base-content/60 hover:border-accent hover:text-accent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Translation
              </router-link>
            </div>
          </div>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <template v-if="currentUser">
                <span class="mr-4">Welcome, {{ currentUser.user.name }}</span>
                <button @click="handleLogout"
                  class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-base-100 bg-accent shadow-sm hover:bg-accent-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">
                  Logout
                </button>
              </template>
              <router-link v-else to="/login"
                class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-base-100 bg-accent shadow-sm hover:bg-accent-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">
                Login
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="py-10">
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="bg-base-100 overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="text-center">
                <h2 class="text-3xl font-extrabold text-base-content sm:text-4xl">
                  Learn Chinese with Ease
                </h2>
                <p class="mt-4 text-xl text-base-content/70">
                  Translate between English and Chinese, with Pinyin support
                </p>
              </div>

              <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div class="bg-base-200 overflow-hidden shadow rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                    <h3 class="text-lg font-medium text-base-content">Quick Translation</h3>
                    <p class="mt-2 text-sm text-base-content/70">
                      Instantly translate between English and Chinese
                    </p>
                    <div class="mt-4">
                      <router-link
                        to="/translate"
                        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-base-100 bg-accent hover:bg-accent-focus"
                      >
                        Start Translating
                      </router-link>
                    </div>
                  </div>
                </div>

                <div class="bg-base-200 overflow-hidden shadow rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                    <h3 class="text-lg font-medium text-base-content">Pronunciation Guide</h3>
                    <p class="mt-2 text-sm text-base-content/70">
                      Learn proper pronunciation with Pinyin
                    </p>
                    <div class="mt-4">
                      <router-link
                        to="/translate"
                        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-base-100 bg-accent hover:bg-accent-focus"
                      >
                        Try Pinyin
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/services/auth.service'
import type { User } from '@/types/user'

export default defineComponent({
  name: 'HomeView',
  setup() {
    const router = useRouter()
    const currentUser = ref<User | null>(null)
    const auth = new AuthService()

    onMounted(() => {
      currentUser.value = auth.getCurrentUser()
    })

    const handleLogout = () => {
      auth.logout()
      currentUser.value = null
      router.push('/login')
    }

    return {
      currentUser,
      handleLogout
    }
  }
})
</script>
