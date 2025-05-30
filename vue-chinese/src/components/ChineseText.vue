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
        :translateFn="translateFn" 
      />
    </span>
  </span>
</template>

<script>
import Tooltip from './Tooltip.vue';

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
      loading: false
    };
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
    async fetchPinyinForText() {
      if (!this.text) return;
      
      // Only process Chinese characters
      const chineseChars = this.text.split('').filter(char => this.isChineseChar(char));
      if (chineseChars.length === 0) return;
      
      this.loading = true;
      
      try {
        const response = await fetch('http://localhost:5000/pinyin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: chineseChars.join('') })
        });
        
        if (!response.ok) throw new Error('Pinyin fetch failed');
        
        const data = await response.json();
        const pinyinArray = data.pinyin.split(' ');
        
        // Map each Chinese character to its pinyin
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
    }
  },
  watch: {
    text: {
      immediate: true,
      handler: 'fetchPinyinForText'
    }
  }
};
</script>

<style>
.chinese-text {
  @apply inline;
}
</style>