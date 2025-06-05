<template>
  <div class="min-h-screen bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="bg-base-100 shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium leading-6 text-base-content">Translation</h3>
          
          <!-- Source Text Input -->
          <div class="mt-6">
            <label for="sourceText" class="block text-sm font-medium text-base-content">
              {{ direction === 'toChinese' ? 'English Text' : 'Chinese Text' }}
            </label>
            <div class="mt-1">
              <textarea
                id="sourceText"
                v-model="sourceText"
                rows="3"
                class="shadow-sm focus:ring-accent focus:border-accent block w-full sm:text-sm border border-base-300 rounded-md bg-base-100 text-base-content"
              />
            </div>
          </div>

          <!-- Direction Toggle -->
          <div class="mt-4 flex justify-center">
            <button
              @click="toggleDirection"
              class="inline-flex items-center p-2 rounded-full border border-transparent shadow-sm text-base-100 bg-accent hover:bg-accent-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          <!-- Translate Button -->
          <div class="mt-4">
            <button
              @click="translate"
              :disabled="loading"
              class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-base-100 bg-accent hover:bg-accent-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
              {{ loading ? 'Translating...' : 'Translate' }}
            </button>
          </div>

          <!-- Translation Result -->
          <div v-if="translation" class="mt-6">
            <label class="block text-sm font-medium text-base-content">Translation</label>
            <div class="mt-1 p-3 bg-base-200 rounded-md">
              <p class="text-lg text-base-content">{{ translation }}</p>
              <p v-if="pinyin" class="mt-2 text-sm text-base-content/70">{{ pinyin }}</p>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mt-4">
            <p class="text-sm text-error">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import TranslationService from '@/services/translation.service';

export default defineComponent({
  name: 'TranslationView',
  setup() {
    const sourceText = ref('');
    const translation = ref('');
    const pinyin = ref('');
    const loading = ref(false);
    const error = ref('');
    const direction = ref<'toChinese' | 'toEnglish'>('toChinese');

    const translate = async () => {
      if (!sourceText.value.trim()) return;
      
      loading.value = true;
      error.value = '';
      
      try {
        const result = direction.value === 'toChinese'
          ? await TranslationService.translateToChinese(sourceText.value)
          : await TranslationService.translateToEnglish(sourceText.value);
        
        translation.value = result.translation;
        pinyin.value = result.pinyin;
      } catch (e: any) {
        error.value = e.response?.data?.error || 'Translation failed';
      } finally {
        loading.value = false;
      }
    };

    const toggleDirection = () => {
      direction.value = direction.value === 'toChinese' ? 'toEnglish' : 'toChinese';
      sourceText.value = '';
      translation.value = '';
      pinyin.value = '';
      error.value = '';
    };

    return {
      sourceText,
      translation,
      pinyin,
      loading,
      error,
      direction,
      translate,
      toggleDirection
    };
  }
});
</script>
