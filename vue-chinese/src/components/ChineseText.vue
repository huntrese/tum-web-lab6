<template>
  <span class="chinese-text">
    <span 
      v-for="(char, index) in processedText" 
      :key="index" 
      class="relative group"
    >
      <span class="hover:underline decoration-dotted cursor-help">
        {{ char.display }}
      </span>
      <Tooltip 
        v-if="char.isChinese"
        :char="char.display" 
        :pinyin="char.pinyin || ''" 
        :translation="translations[char.display] || ''"
        :pinyinFn="fetchPinyinForText"
      />
    </span>
  </span>
</template>

<script>
import Tooltip from './Tooltip.vue';
import { debounce } from 'lodash'; // Add this import

export default {
  name: 'ChineseText',
  components: {
    Tooltip
  },
  props: {
    text: {
      type: String,
      required: true
    },
    translateFn: {
      type: Function,
      default: async function(text) {
        try {
          const response = await fetch('http://localhost:5000/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          });
          
          if (!response.ok) throw new Error('Translation failed');
          
          const data = await response.json();
          return data.translation;
        } catch (error) {
          console.error('Translation error:', error);
          return 'Translation unavailable';
        }
      }
    }
  },
  data() {
    return {
      characterPinyins: {},
      translations: {},
      loading: false,
      batchQueue: new Set(),
      processingQueue: false
    };
  },

  created() {
    this.debouncedProcessQueue = debounce(this.processTranslationQueue, 300);
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
    },

    getFromCache(key) {
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          const { value, timestamp } = JSON.parse(cached);
          // Cache expires after 24 hours
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            return value;
          }
        } catch (e) {
          console.error('Cache parse error:', e);
        }
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

    async getCachedTranslation(text) {
      const cacheKey = this.getCacheKey(text, 'translation');
      const cached = this.getFromCache(cacheKey);
      
      if (cached) {
        return cached;
      }

      try {
        const response = await fetch('http://localhost:5000/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        
        if (!response.ok) throw new Error('Translation failed');
        
        const data = await response.json();
        this.setInCache(cacheKey, data.translation);
        return data.translation;
      } catch (error) {
        console.error('Translation error:', error);
        return 'Translation unavailable';
      }
    },

    async fetchPinyinForText() {
      if (!this.text) return;
      
      const chineseChars = this.text.split('').filter(char => this.isChineseChar(char));
      if (chineseChars.length === 0) return;
      
      // Check cache first
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
      
      try {
        const response = await fetch('http://localhost:5000/pinyin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: chineseChars.join('') })
        });
        
        if (!response.ok) throw new Error('Pinyin fetch failed');
        
        const data = await response.json();
        this.setInCache(cacheKey, data.pinyin);
        
        const pinyinArray = data.pinyin.split(' ');
        chineseChars.forEach((char, index) => {
          if (index < pinyinArray.length) {
            this.characterPinyins[char] = pinyinArray[index];
          }
        });
      } catch (error) {
        console.error('Pinyin fetch error:', error);
      } finally {
        this.loading = false;
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

    async processTranslationQueue() {
      if (this.processingQueue || this.batchQueue.size === 0) return;
      
      this.processingQueue = true;
      const batch = Array.from(this.batchQueue);
      this.batchQueue.clear();

      try {
        const response = await fetch('http://localhost:5000/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: batch.join('') })
        });

        if (!response.ok) throw new Error('Translation failed');

        const data = await response.json();
        const translations = data.translation.split(' ');

        batch.forEach((char, index) => {
          if (translations[index]) {
            this.translations[char] = translations[index];
            this.setInCache(this.getCacheKey(char, 'translation'), translations[index]);
          }
        });
      } catch (error) {
        console.error('Batch translation error:', error);
        batch.forEach(char => this.batchQueue.add(char));
      } finally {
        this.processingQueue = false;
        if (this.batchQueue.size > 0) {
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
  @apply inline;
}
</style>