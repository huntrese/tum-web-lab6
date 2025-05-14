<template>
  <main class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold">每日智慧</h1>
        <p class="text-lg">Daily Chinese Idioms</p>
      </div>

      <div class="rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <!-- Idiom Display -->
        <div class="p-8">
          <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>

          <div v-else>
            <!-- Chinese Idiom -->
            <div class="mb-6">
              <p class="text-3xl font-serif text-center mb-2">{{ idiom.word }}</p>
              <p class="text-lg text-center">{{ idiom.pinyin }}</p>
            </div>

            <!-- Explanation -->
            <div class="mb-6">
              <h3 class="text-xl font-semibold mb-3">解释 (Explanation)</h3>
              <p class="leading-relaxed">{{ idiom.explanation }}</p>
              <p class="mt-2 italic text-gray-600" v-if="idiom.englishExplanation">
                {{ idiom.englishExplanation }}
              </p>
              <p v-else class="mt-2 italic text-gray-400">Loading translation...</p>
            </div>

            <!-- Example -->
            <div class="mb-6" v-if="idiom.example">
              <h3 class="text-xl font-semibold mb-3">例子 (Example)</h3>
              <p class="leading-relaxed">{{ idiom.example }}</p>
              <p class="mt-2 italic text-gray-600" v-if="idiom.englishExample">
                {{ idiom.englishExample }}
              </p>
            </div>

            <!-- Derivation -->
            <div class="mb-8" v-if="idiom.derivation">
              <h3 class="text-xl font-semibold mb-3">出处 (Derivation)</h3>
              <p class="leading-relaxed">{{ idiom.derivation }}</p>
              <p class="mt-2 italic text-gray-600" v-if="idiom.englishDerivation">
                {{ idiom.englishDerivation }}
              </p>
            </div>

            <!-- Image -->
            <div class="rounded-lg overflow-hidden">
              <img :src="idiom.image" :alt="'Illustration for: ' + idiom.word" class="w-full h-64 object-cover"
                @error="handleImageError" />
            </div>
          </div>
        </div>

        <!-- Refresh Button -->
        <div class="px-6 py-4 flex justify-end">
          <button @click="fetchIdiom"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clip-rule="evenodd" />
            </svg>
            New Idiom
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center text-sm">
        <p>Explore the wisdom of Chinese culture, one idiom at a time.</p>
      </div>
    </div>
  </main>
</template>

<script>
import idiomsData from '@/assets/idiom.json';

export default {
  name: 'ChineseIdiom',
  data() {
    return {
      loading: true,
      idiom: {
        word: '',
        pinyin: '',
        explanation: '',
        englishExplanation: '',
        example: '',
        englishExample: '',
        derivation: '',
        englishDerivation: '',
        image: ''
      },
      backupImages: [
        'https://picsum.photos/seed/china1/800/600',
        'https://picsum.photos/seed/china2/800/600',
        'https://picsum.photos/seed/china3/800/600',
        'https://picsum.photos/seed/china4/800/600',
        'https://picsum.photos/seed/china5/800/600'
      ],
      idioms: [],
      translationServer: 'http://localhost:5000' // Update this if your server is hosted elsewhere
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
        this.idioms = this.getPredefinedIdioms();
        this.fetchIdiom();
      }
    },
    
    async fetchIdiom() {
      this.loading = true;
      
      try {
        // Get a random idiom
        const randomIdiom = this.idioms[Math.floor(Math.random() * this.idioms.length)];
        
        // Get image
        const image = await this.getRelatedImage(randomIdiom);
        
        // Set idiom data (without translations first)
        this.idiom = {
          word: randomIdiom.word,
          pinyin: randomIdiom.pinyin,
          explanation: randomIdiom.explanation,
          englishExplanation: '',
          example: randomIdiom.example || '',
          englishExample: '',
          derivation: randomIdiom.derivation || '',
          englishDerivation: '',
          image
        };
        
        // Fetch translations in parallel
        await Promise.all([
          this.translateText(randomIdiom.explanation).then(trans => {
            this.idiom.englishExplanation = trans;
          }),
          randomIdiom.example && this.translateText(randomIdiom.example).then(trans => {
            this.idiom.englishExample = trans;
          }),
          randomIdiom.derivation && this.translateText(randomIdiom.derivation).then(trans => {
            this.idiom.englishDerivation = trans;
          })
        ]);
        
      } catch (error) {
        console.error('Error fetching idiom:', error);
        // Fallback idiom
        this.idiom = {
          word: '做张做智',
          pinyin: 'zuò zhāng zuò zhì',
          explanation: '犹言装模作样，装腔作势。',
          englishExplanation: 'Meaning pretending or putting on an act.',
          example: '[阮小七]提着双拳说道我老爷在此吃几杯酒儿，干你鸟事！～要来拿我！”★《水浒传》第一回',
          englishExample: '[Ruan Xiaoqi] raised his fists and said: "I\'m just having a few drinks here, what\'s it to you? Don\'t put on airs and try to arrest me!"',
          derivation: '《醒世恒言·卖油郎独占花魁》那些有势有力的不肯出钱，专要讨人便宜。及至肯出几两银子的，女儿又嫌好道歉，做张做智的不肯。”',
          englishDerivation: 'From "Stories to Awaken the World": Those with power refused to pay, only wanting to take advantage. When finally willing to pay a few taels of silver, the daughter still complained and those putting on airs refused.',
          image: this.backupImages[0]
        };
      } finally {
        this.loading = false;
      }
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
        return data.translation || '';
      } catch (error) {
        console.error('Translation error:', error);
        return this.generateFallbackTranslation(text);
      }
    },
    
    generateFallbackTranslation(text) {
      // Simple fallback translations for common patterns
      const translationMap = {
        '装模作样': 'pretending, putting on an act',
        '装腔作势': 'behaving affectedly, putting on airs',
        '形容': 'describes',
        '比喻': 'metaphorically refers to',
        '表示': 'indicates',
        '指': 'refers to',
        '出自': 'comes from',
        '意思是': 'means',
        '形容人': 'describes a person who',
        '形容事物': 'describes something that',
        '形容情况': 'describes a situation where',
        '鼠鼬类往来的小路': 'a path frequented by rodents and weasels',
        '引申为': 'extended to mean',
        '荒凉偏僻的小道': 'a desolate and remote path'
      };
      
      // Try to find exact matches first
      for (const [chinese, english] of Object.entries(translationMap)) {
        if (text.includes(chinese)) {
          return text.replace(chinese, english);
        }
      }
      
      // Fallback generic message
      return "Translation not available";
    },
    
    // Our predefined Chinese idioms as a fallback
    getPredefinedIdioms() {
      return [
        {
          word: '做张做智',
          pinyin: 'zuò zhāng zuò zhì',
          explanation: '犹言装模作样，装腔作势。',
          example: '[阮小七]提着双拳说道我老爷在此吃几杯酒儿，干你鸟事！～要来拿我！”★《水浒传》第一回',
          derivation: '《醒世恒言·卖油郎独占花魁》那些有势有力的不肯出钱，专要讨人便宜。及至肯出几两银子的，女儿又嫌好道歉，做张做智的不肯。”'
        },
        {
          word: '画蛇添足',
          pinyin: 'huà shé tiān zú',
          explanation: '画蛇时给蛇添上脚。比喻做了多余的事，非但无益，反而不合适。',
          example: '这篇文章的结构已经很完整了，再加一段反而～。',
          derivation: '《战国策·齐策二》："蛇固无足，子安能为之足？"'
        },
        {
          word: '守株待兔',
          pinyin: 'shǒu zhū dài tù',
          explanation: '原比喻希图不经过努力而得到成功的侥幸心理。现也比喻死守狭隘经验，不知变通。',
          example: '我们不能像～那样指望好运气，而应该努力工作。',
          derivation: '《韩非子·五蠹》记载：战国时宋国有一个农民，看见一只兔子撞在树根上死了，便放下锄头在树根旁等待，希望再得到撞死的兔子。'
        }
      ];
    },
    
    // Function to get a related image without CORS issues
    async getRelatedImage(idiom) {
      try {
        const keyword = this.getKeyword(idiom);
        const keywordHash = this.simpleHash(keyword);
        return `https://picsum.photos/seed/${keywordHash}/800/600`;
      } catch (error) {
        console.error('Error fetching image:', error);
        return this.backupImages[Math.floor(Math.random() * this.backupImages.length)];
      }
    },
    
    // Simple string hashing function for generating seed values
    simpleHash(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16);
    },
    
    // Helper to extract a keyword for image search
    getKeyword(idiom) {
      // First try to get a keyword from the idiom characters
      const charKeywords = {
        '画': 'painting,art',
        '蛇': 'snake,animal',
        '足': 'foot,step',
        '守': 'guard,protect',
        '兔': 'rabbit,animal',
        '做': 'acting,pretend',
        '张': 'stretch,exaggerate',
        '智': 'wisdom,intelligence'
      };
      
      for (const [char, keyword] of Object.entries(charKeywords)) {
        if (idiom.word.includes(char)) {
          return keyword + ',chinese';
        }
      }
      
      // Then try to get from explanation
      const explanationKeywords = {
        '装模作样': 'acting,pretend,theater',
        '装腔作势': 'acting,drama,theater',
        '比喻': 'metaphor,abstract',
        '形容': 'description,writing',
        '多余': 'excess,too much',
        '努力': 'effort,work',
        '侥幸': 'luck,fortune',
        '变通': 'flexibility,change'
      };
      
      for (const [term, keyword] of Object.entries(explanationKeywords)) {
        if (idiom.explanation.includes(term)) {
          return keyword + ',chinese';
        }
      }
      
      // Fallback to general Chinese culture terms
      const fallbackTerms = [
        'chinese,calligraphy', 
        'china,landscape', 
        'chinese,culture', 
        'asian,philosophy',
        'chinese,temple',
        'chinese,garden',
        'chinese,mountains',
        'chinese,art',
        'chinese,tradition'
      ];
      return fallbackTerms[Math.floor(Math.random() * fallbackTerms.length)];
    },
    
    // Handle image loading errors
    handleImageError() {
      this.idiom.image = this.backupImages[Math.floor(Math.random() * this.backupImages.length)];
    }
  }
}
</script>