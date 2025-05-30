<template>
  <main class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold">每日成语</h1>
        <p class="text-lg">Daily Chinese Idioms</p>
      </div>

      <div class="rounded-xl shadow overflow-hidden transition-all duration-300 hover:shadow-md">
        <!-- Idiom Display -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-0">
          <!-- Left Column - Image -->
          <div class="md:col-span-1 flex items-center justify-center p-4">
            <img :src="idiom.image" :alt="'Illustration for: ' + idiom.word"
              class="w-full h-64 md:h-full object-cover rounded-lg" @error="handleImageError" />
          </div>

          <!-- Right Column - Content -->
          <div class="md:col-span-2 p-6">
            <div v-if="loading" class="flex justify-center items-center h-64">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"></div>
            </div>

            <div v-else>
              <!-- Add Favorite Button -->
              <div class="flex justify-end mb-4">
                <button @click="toggleFavorite" class="btn btn-circle">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" :class="{ 'text-yellow-500': isFavorite }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>

              <!-- Chinese Idiom -->
              <div class="mb-6 text-center mt-80">
                <p class="text-4xl font-serif mb-2">
                  <ChineseText :text="idiom.word" />
                </p>
                <p class="text-xl">{{ idiom.pinyin }}</p>
              </div>

              <!-- Literal Translation -->
              <div class="mb-6 p-4 rounded">
                <h3 class="text-lg font-semibold mb-2">Literal Meaning</h3>
                <p>
                  <ChineseText :text="idiom.literalTranslation" />
                </p>
                <p class="mt-1 italic">{{ idiom.englishLiteral }}</p>
              </div>

              <!-- Idiomatic Meaning -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold mb-2">Idiomatic Meaning</h3>
                <p>
                  <ChineseText :text="idiom.explanation" />
                </p>
                <p class="mt-1 italic">{{ idiom.englishExplanation }}</p>
              </div>

              <!-- Example -->
              <div class="mb-6 border-t pt-4" v-if="idiom.example">
                <h3 class="text-lg font-semibold mb-2">Example Usage</h3>
                <ChineseText :text="processExample(idiom.example, idiom.word)" />
                
                <p class="mt-1 italic">{{ idiom.englishExample }}</p>
              </div>

              <!-- Derivation -->
              <div class="mb-4 border-t pt-4" v-if="idiom.derivation">
                <h3 class="text-lg font-semibold mb-2">Origin</h3>
                <ChineseText :text="idiom.derivation" />
                <p class="mt-1 italic">{{ idiom.englishDerivation }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Refresh Button -->
        <div class="px-6 py-4 border-t flex justify-center">
          <button @click="fetchIdiom"
            class="inline-flex items-center px-6 py-3 border text-base font-medium rounded-md shadow-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clip-rule="evenodd" />
            </svg>
            Discover Another Idiom
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center text-sm">
        <p>Explore the richness of Chinese culture through its colorful idioms.</p>
      </div>
    </div>
  </main>
</template>

<script>
import idiomsData from '@/assets/idiom.json';
import ciData from '@/assets/ci.json';
import ChineseText from '@/components/ChineseText.vue';
// Local image imports
import image1 from '@/assets/images/idiom1.jpg';
import image2 from '@/assets/images/idiom2.jpg';
import image3 from '@/assets/images/idiom3.jpg';
import image4 from '@/assets/images/idiom4.jpg';
import image5 from '@/assets/images/idiom5.jpg';



export default {
  components: {
    ChineseText
  },
  name: 'ChineseIdiom',
  data() {
    return {
      loading: true,
      idiom: {
        word: '',
        pinyin: '',
        literalTranslation: '',
        englishLiteral: '',
        explanation: '',
        englishExplanation: '',
        example: '',
        englishExample: '',
        derivation: '',
        englishDerivation: '',
        image: ''
      },
      localImages: [image1, image2, image3, image4, image5],
      idioms: [],
      ciDictionary: ciData || [],
      translationServer: 'http://localhost:5000',
      isFavorite: false
    }
  },
  mounted() {
    this.loadIdioms();
  },
  methods: {
    loadIdioms() {
      try {
        this.idioms = idiomsData;
        this.fetchIdiom();
      } catch (error) {
        console.error('Error loading idioms:', error);
        this.fetchIdiom();
      }
    },

    processExample(example, idiom) {
      if (!example) return '';
      // Replace ~ with the actual idiom
      return example.replace(/～/g, idiom);
    },

    async fetchIdiom() {
      this.loading = true;

      try {
        const randomIdiom = this.idioms[Math.floor(Math.random() * this.idioms.length)];

        // Set basic data
        this.idiom = {
          word: randomIdiom.word,
          pinyin: randomIdiom.pinyin,
          literalTranslation: randomIdiom.word,
          englishLiteral: '',
          explanation: randomIdiom.explanation,
          englishExplanation: '',
          example: randomIdiom.example || '',
          englishExample: '',
          derivation: randomIdiom.derivation || '',
          englishDerivation: '',
          image: this.getLocalImage(randomIdiom.word)
        };

        // Process example to include the actual idiom
        if (this.idiom.example) {
          this.idiom.example = this.processExample(this.idiom.example, this.idiom.word);
        }

        // Get literal translation for each character
        const literalParts = [];
        for (const char of randomIdiom.word) {
          const translation = await this.translateText(char);
          literalParts.push(`${char}: ${translation}`);
        }
        this.idiom.englishLiteral = literalParts.join(', ');

        // Fetch remaining translations in parallel
        await Promise.all([
          this.translateText(randomIdiom.explanation).then(trans => {
            this.idiom.englishExplanation = trans;
          }),
          randomIdiom.example && this.translateText(this.idiom.example).then(trans => {
            this.idiom.englishExample = trans;
          }),
          randomIdiom.derivation && this.translateText(randomIdiom.derivation).then(trans => {
            this.idiom.englishDerivation = trans;
          })
        ]);
        this.checkIfFavorite();
      } catch (error) {
        console.error('Error fetching idiom:', error);
      } finally {
        this.loading = false;
      }
    },

    getLocalImage(idiomWord) {
      // Simple hash function to map words to images consistently
      let hash = 0;
      for (let i = 0; i < idiomWord.length; i++) {
        hash = (hash << 5) - hash + idiomWord.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      const index = Math.abs(hash) % this.localImages.length;
      return this.localImages[index];
    },

    async translateText(text) {
      if (!text) return '';

      try {
        const response = await fetch(`${this.translationServer}/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text })
        });

        if (!response.ok) throw new Error('Translation failed');
        const data = await response.json();
        return data.translation || 'Translation failed';
      } catch (error) {
        console.error('Translation error:', error);
        return 'Translation failed';
      }
    },

    handleImageError() {
      // Fallback to another local image if there's an error
      this.idiom.image = this.localImages[Math.floor(Math.random() * this.localImages.length)];
    },

    toggleFavorite() {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const idiomData = { ...this.idiom, timestamp: Date.now() };
      
      if (this.isFavorite) {
        // Remove from favorites
        const index = favorites.findIndex(f => f.word === this.idiom.word);
        if (index !== -1) {
          favorites.splice(index, 1);
        }
      } else {
        // Add to favorites
        favorites.push(idiomData);
      }
      
      localStorage.setItem('favorites', JSON.stringify(favorites));
      this.isFavorite = !this.isFavorite;
    },

    checkIfFavorite() {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      this.isFavorite = favorites.some(f => f.word === this.idiom.word);
    },
  }
}
</script>
