<template>
  <main class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold">收藏的成语</h1>
        <p class="text-lg">Favorite Idioms</p>
      </div>

      <div v-if="favorites.length === 0" class="text-center py-8">
        <p class="text-xl">No favorites yet</p>
        <RouterLink to="/stuff" class="btn btn-primary mt-4">
          Discover Idioms
        </RouterLink>
      </div>

      <div v-else class="grid gap-4">
        <div v-for="idiom in sortedFavorites" :key="idiom.word" 
             class="card bg-base-100 shadow-xl">
          <div class="card-body p-4">
            <!-- Header with expand/collapse -->
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h2 class="card-title text-2xl mb-2">
                  <ChineseText :text="idiom.word" />
                </h2>
                <p class="text-lg opacity-75">{{ idiom.pinyin }}</p>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-sm opacity-60">
                  {{ formatDate(idiom.timestamp) }}
                </span>
                <button @click="toggleExpand(idiom.word)" class="btn btn-circle btn-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" :class="{ 'rotate-180': expandedItems.includes(idiom.word) }" 
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button @click="removeFavorite(idiom)" class="btn btn-circle btn-sm btn-error">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Collapsible content -->
            <div v-show="expandedItems.includes(idiom.word)" 
                 class="mt-4 space-y-4 transition-all duration-200">
              <div class="divider"></div>
              
              <!-- Literal Translation -->
              <div class="space-y-1">
                <h3 class="font-semibold">Literal Meaning</h3>
                <p class="opacity-75">{{ idiom.englishLiteral }}</p>
              </div>

              <!-- Idiomatic Meaning -->
              <div class="space-y-1">
                <h3 class="font-semibold">Idiomatic Meaning</h3>
                <p>
                  <ChineseText :text="idiom.explanation" />
                </p>
                <p class="opacity-75">{{ idiom.englishExplanation }}</p>
              </div>

              <!-- Example -->
              <div v-if="idiom.example" class="space-y-1">
                <h3 class="font-semibold">Example Usage</h3>
                <p>
                  <ChineseText :text="idiom.example" />
                </p>
                <p class="opacity-75">{{ idiom.englishExample }}</p>
              </div>

              <!-- Origin -->
              <div v-if="idiom.derivation" class="space-y-1">
                <h3 class="font-semibold">Origin</h3>
                <p>
                  <ChineseText :text="idiom.derivation" />
                </p>
                <p class="opacity-75">{{ idiom.englishDerivation }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import ChineseText from '@/components/ChineseText.vue';

export default {
  name: 'FavoritesView',
  components: {
    ChineseText
  },
  data() {
    return {
      favorites: [],
      expandedItems: []
    }
  },
  computed: {
    sortedFavorites() {
      return [...this.favorites].sort((a, b) => b.timestamp - a.timestamp);
    }
  },
  mounted() {
    this.loadFavorites();
  },
  methods: {
    loadFavorites() {
      this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    },
    removeFavorite(idiom) {
      const index = this.favorites.findIndex(f => f.word === idiom.word);
      if (index !== -1) {
        this.favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.expandedItems = this.expandedItems.filter(id => id !== idiom.word);
      }
    },
    toggleExpand(id) {
      const index = this.expandedItems.indexOf(id);
      if (index === -1) {
        this.expandedItems.push(id);
      } else {
        this.expandedItems.splice(index, 1);
      }
    },
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
}
</script>

<style scoped>
.card {
  transition: all 0.3s ease;
}
.card:hover {
  transform: translateY(-2px);
}
</style>
