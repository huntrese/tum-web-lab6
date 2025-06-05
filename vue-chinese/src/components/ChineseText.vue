<template>
  <span class="chinese-text">
    <span 
      v-for="(char, index) in processedText" 
      :key="index" 
      class="relative group"
    >
      <span 
        class="hover:underline decoration-dotted cursor-help"
        :class="{'opacity-50': loading && !translations[char.display] && char.isChinese}"
      >
        {{ char.display }}
      </span>
      <span 
        v-if="loading && !translations[char.display] && char.isChinese" 
        class="absolute -top-2 -right-2 w-2 h-2 animate-ping bg-accent rounded-full"
      ></span>      <Tooltip 
        v-if="char.isChinese"
        :char="char.display" 
        :pinyin="char.pinyin || ''" 
        :translation="translations[char.display] || ''"
        :pinyinFn="() => this.fetchPinyinForText()"
        :translateFn="(text) => this.translateText(text)"
      />
    </span>
    <span v-if="error" class="text-error text-sm ml-2">{{ error }}</span>
  </span>
</template>

<script>
import Tooltip from './Tooltip.vue';
import { debounce } from 'lodash';
import TranslationService from '@/services/translation.service';

export default {
  name: 'ChineseText',
  components: {
    Tooltip
  },
  props: {
    text: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      characterPinyins: {},
      translations: {},
      loading: false,
      batchQueue: new Set(),
      processingQueue: false,
      error: null
    };
  },
  created() {
    // Create a debounced function that's bound to this component instance
    this.debouncedProcessQueue = debounce(() => this.processTranslationQueue(), 300);
  },

  computed: {
    processedText() {
      const chars = this.text.split('');
      
      return chars.map((char, index) => {
        const isChinese = this.isChineseChar(char);
        return {
          display: char,
          isChinese,
          pinyin: isChinese ? (this.characterPinyins[char] || '') : ''
        };
      });
    }
  },
  methods: {
    isChineseChar(char) {
      const charCode = char.charCodeAt(0);
      return charCode >= 0x4E00 && charCode <= 0x9FFF;
    },

    getCacheKey(text, type) {
      return `chinese_helper_${type}_${text}`;
    },    getFromCache(key) {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.value && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            return parsed.value;
          }
        }
      } catch (e) {
        console.error('Cache parse error:', e);
      }
      return null;
    },

    setInCache(key, value) {
      const cacheData = {
        value,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    },

    async fetchPinyinForText() {
      if (!this.text) return;
      
      const chineseChars = this.text.split('').filter(char => this.isChineseChar(char));
      if (chineseChars.length === 0) return;
      
      const cacheKey = this.getCacheKey(chineseChars.join(''), 'pinyin');
      const cached = this.getFromCache(cacheKey);
      
      if (cached) {
        const pinyinArray = cached.split(' ');
        chineseChars.forEach((char, index) => {
          if (index < pinyinArray.length) {
            this.characterPinyins[char] = pinyinArray[index];
          }
        });
        return;
      }

      this.loading = true;
      this.error = null;
        try {
        const result = await TranslationService.getPinyin(chineseChars.join(''));
        if (!result || typeof result.pinyin !== 'string') {
          throw new Error('Invalid pinyin response format');
        }
        
        this.setInCache(cacheKey, result.pinyin);
        const pinyinArray = result.pinyin.trim().split(/\s+/);
        
        chineseChars.forEach((char, index) => {
          if (index < pinyinArray.length) {
            this.characterPinyins[char] = pinyinArray[index];
          }
        });
      } catch (error) {
        console.error('Pinyin fetch error:', error);
        this.error = 'Failed to fetch pronunciation';
      } finally {
        this.loading = false;
      }
    },

    async processTranslationQueue() {
      if (this.processingQueue || this.batchQueue.size === 0) return;
      
      this.processingQueue = true;
      this.loading = true;
      this.error = null;
      const batch = Array.from(this.batchQueue);
      this.batchQueue.clear();      try {
        const result = await TranslationService.translateToEnglish(batch.join(''));
        if (!result || typeof result.translation !== 'string') {
          throw new Error('Invalid translation response format');
        }

        const translations = result.translation.trim().split(/\s+/);
        batch.forEach((char, index) => {
          if (translations[index]) {
            this.translations[char] = translations[index];
            this.setInCache(this.getCacheKey(char, 'translation'), translations[index]);
          }
        });
      } catch (error) {
        console.error('Batch translation error:', error);
        this.error = 'Failed to fetch translations';
        batch.forEach(char => this.batchQueue.add(char));
      } finally {
        this.processingQueue = false;
        this.loading = false;
        if (this.batchQueue.size > 0) {
          this.debouncedProcessQueue();
        }
      }
    },

    async queueForTranslation(char) {
      if (!this.translations[char]) {
        const cacheKey = this.getCacheKey(char, 'translation');
        const cached = this.getFromCache(cacheKey);
        
        if (cached) {
          this.translations[char] = cached;
        } else {
          this.batchQueue.add(char);
          this.debouncedProcessQueue();
        }
      }
    },

    processText() {
      if (!this.text) return;
      const chars = this.text.split('');
      chars.forEach(char => {
        if (this.isChineseChar(char)) {
          this.queueForTranslation(char);
        }
      });
    },

    async translateText(text) {
      if (!text) return '';
      
      try {
        const result = await TranslationService.translateToEnglish(text);
        if (!result || typeof result.translation !== 'string') {
          throw new Error('Invalid translation response format');
        }
        return result.translation;
      } catch (error) {
        console.error('Translation error:', error);
        return '';
      }
    }
  },

  watch: {
    text: {
      immediate: true,
      handler(newText) {
        this.fetchPinyinForText();
        this.processText();
      }
    }
  }
};
</script>

<style>
.chinese-text {
  display: inline;
}
</style>