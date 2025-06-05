<template>
    <div
        class="absolute bottom-full z-999 left-1/2 bg-base-100 rounded-lg transform -translate-x-1/2 hidden group-hover:block w-96 max-w-md p-2">
        <div class="shadow-xl rounded-lg border overflow-hidden max-h-96 overflow-y-auto text-accent">
            <!-- Header -->
            <div class="p-3 sticky top-0 border-b z-10 bg-base-100">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-lg font-bold text-accent">{{ char }}</h3>
                        <p v-if="data && data.strokes && data.radicals" class="text-sm text-base-content/70">
                            {{ data.strokes }} strokes · Radical: {{ data.radicals }}
                        </p>
                    </div>
                    <span class="text-sm opacity-75 text-base-content/60">{{ pinyin }}</span>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center py-4">
                <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-accent"></div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="p-3 text-sm text-error">
                {{ error }}
            </div>

            <!-- Content with Tabs -->
            <div v-else-if="data" class="text-sm text-base-content">
                <!-- Tab Navigation -->
                <div class="flex border-b">
                    <button v-for="(tab, index) in availableTabs" :key="index" @click="activeTab = tab.id"
                        class="px-3 py-2 text-sm font-medium"
                        :class="activeTab === tab.id ? 'border-b-2 border-accent text-accent' : 'text-base-content/70'">
                        {{ tab.label }}
                    </button>
                </div>

                <!-- Tab Content -->
                <div class="p-3">
                    <!-- Dictionary Tab -->
                    <div v-if="activeTab === 'dictionary'" class="space-y-3">
                        <div class="relative">
                            <div :class="{ 'max-h-20 overflow-hidden': !expandedSections.dictionary }">
                                <div v-html="formatDefinition(data.explanation)"></div>
                            </div>
                            <div v-if="shouldShowExpand('explanation')"
                                @click="expandedSections.dictionary = !expandedSections.dictionary"
                                class="text-accent hover:text-accent cursor-pointer text-xs mt-1">
                                {{ expandedSections.dictionary ? 'Show less' : 'Show more' }}
                            </div>
                        </div>
                    </div>

                    <!-- Pronunciation Tab -->
                    <div v-if="activeTab === 'pronunciation'" class="space-y-3">
                        <div v-if="hasMultiplePronunciations">
                            <h4 class="font-semibold text-accent mb-2">Other Pronunciations</h4>
                            <div class="flex flex-wrap gap-2">
                                <span v-for="(p, index) in otherPronunciations" :key="index"
                                    class="px-2 py-1 rounded text-sm bg-base-200 text-base-content">
                                    {{ p }}
                                </span>
                            </div>
                        </div>
                        <div v-else class="text-warning italic">
                            No alternative pronunciations found.
                        </div>
                    </div>

                    <!-- Translation Tab -->
                    <div v-if="activeTab === 'translation'" class="space-y-3">
                        <div v-if="translatedContent.length > 0">
                            <div v-for="(item, index) in translatedContent" :key="index" class="mb-3">
                                <div class="font-medium text-accent">{{ item.original }}</div>
                                <div class="text-xs mb-1 text-base-content/70">{{ item.pinyin }}</div>
                                <div class="text-base-content">{{ item.translation }}</div>
                            </div>
                        </div>
                        <div v-else class="text-warning italic">
                            No translation available.
                        </div>
                    </div>

                    <!-- Detailed Info Tab -->
                    <div v-if="activeTab === 'details' && data.more" class="space-y-3">
                        <div class="relative">
                            <div :class="{ 'max-h-20 overflow-hidden': !expandedSections.details }">
                                <div v-html="formatDefinition(data.more)"></div>
                            </div>
                            <div v-if="shouldShowExpand('more')"
                                @click="expandedSections.details = !expandedSections.details"
                                class="text-accent hover:text-accent cursor-pointer text-xs mt-1">
                                {{ expandedSections.details ? 'Show less' : 'Show more' }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="px-3 pb-2 text-xs text-warning">From Chinese dictionary</div>
            </div>
        </div>
    </div>
</template>

<script>
import wordData from '@/assets/word.json';

export default {
    name: 'Tooltip',
    props: {
        char: {
            type: String,
            required: true
        },
        pinyin: {
            type: String,
            required: true
        },
        translateFn: {
            type: Function,
            required: true
        },
        pinyinFn: {
            type: Function,
            required: true
        }
    },
    data() {
        return {
            data: null,
            translatedContent: [],
            loading: false,
            error: null,
            activeTab: 'dictionary',
            expandedSections: {
                dictionary: false,
                details: false
            }
        };
    },
    computed: {
        hasMultiplePronunciations() {
            if (!this.data || !this.data.pinyin) return false;
            return this.data.pinyin.includes(';') || this.data.pinyin.includes('，');
        },
        otherPronunciations() {
            if (!this.hasMultiplePronunciations) return [];
            return this.data.pinyin.split(/[;，]/).filter(p => p.trim() !== this.pinyin);
        },
        availableTabs() {
            const tabs = [
                { id: 'dictionary', label: 'Dictionary' }
            ];

            if (this.hasMultiplePronunciations) {
                tabs.push({ id: 'pronunciation', label: 'Pronunciation' });
            }

            if (this.translatedContent.length > 0) {
                tabs.push({ id: 'translation', label: 'Translation' });
            }

            if (this.data && this.data.more) {
                tabs.push({ id: 'details', label: 'Details' });
            }

            return tabs;
        }
    },
    async mounted() {
        await this.lookupDefinition();
        await this.processContent();
    },
    methods: {
        lookupDefinition() {
            // Find exact match first
            let entry = wordData.find(item => item.word === this.char);

            // If no exact match, try oldword field
            if (!entry) {
                entry = wordData.find(item => item.oldword === this.char);
            }

            if (entry) {
                this.data = entry;
                return;
            }

            this.error = 'Dictionary entry not found';
        },
        async processContent() {
            if (!this.data) return;

            this.loading = true;
            try {
                // Process explanation
                if (this.data.explanation) {
                    const explanationParts = this.splitContent(this.data.explanation);
                    for (const part of explanationParts) {
                        if (part.trim()) {
                            const pinyin = await this.pinyinFn(part);
                            const translation = await this.translateFn(part);
                            this.translatedContent.push({
                                original: part,
                                pinyin: pinyin,
                                translation: translation
                            });
                        }
                    }
                }

                // Process more details if available
                if (this.data.more) {
                    const moreParts = this.splitContent(this.data.more);
                    for (const part of moreParts) {
                        if (part.trim()) {
                            const pinyin = await this.pinyinFn(part);
                            const translation = await this.translateFn(part);
                            this.translatedContent.push({
                                original: part,
                                pinyin: pinyin,
                                translation: translation
                            });
                        }
                    }
                }
            } catch (err) {
                console.error('Processing error:', err);
            } finally {
                this.loading = false;
            }
        },
        splitContent(text) {
            if (!text) return [];

            // Clean up the text first
            let cleaned = text.replace(/[⓪①②③④⑤⑥⑦⑧⑨⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛]/g, '')
                .replace(/\n+/g, '\n')
                .trim();

            // Split by numbered items or other logical breaks
            const parts = cleaned.split(/(?=\d+\.)/g);

            // Further split long paragraphs
            const result = [];
            parts.forEach(part => {
                if (part.length > 100) {
                    // Split long paragraphs by sentences
                    const sentences = part.split(/(?<=[。！？；])/g);
                    result.push(...sentences.filter(s => s.trim()));
                } else {
                    result.push(part);
                }
            });

            return result.filter(p => p.trim());
        },
        formatDefinition(text) {
            if (!text) return '';

            // Clean up special characters and formatting
            let formatted = text.replace(/[⓪①②③④⑤⑥⑦⑧⑨⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛]/g, '')
                .replace(/⒌/g, '5.')
                .replace(/⒍/g, '6.')
                .replace(/⒎/g, '7.')
                .replace(/⒏/g, '8.')
                .replace(/⒐/g, '9.');

            // Split by lines and format numbered items
            return formatted.split('\n')
                .map(item => {
                    // Format numbered items (1. 2. etc)
                    const numberedMatch = item.match(/^(\d+)\.(.*)/);
                    if (numberedMatch) {
                        return `<strong>${numberedMatch[1]}.</strong> ${numberedMatch[2].trim()}`;
                    }

                    // Format pinyin markers (háng, xíng etc)
                    const pinyinMatch = item.match(/行(\d+)\n\n(.*)/);
                    if (pinyinMatch) {
                        return `<div class="mt-2"><span class="font-bold">Pronunciation ${pinyinMatch[1]}</span><br>${pinyinMatch[2]}</div>`;
                    }

                    // Format section headers
                    if (item.includes('--《') || item.includes('》')) {
                        return `<em class="text-warning">${item}</em>`;
                    }

                    return item;
                })
                .join('<br>');
        },
        shouldShowExpand(field) {
            // Check if text is long enough to need expansion
            if (!this.data || !this.data[field]) return false;

            // Count number of lines or approximate length to decide
            const lines = this.data[field].split('\n');
            return lines.length > 3 || this.data[field].length > 150;
        }
    }
};
</script>

<style scoped>
.group-hover\:block {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

/* Custom scrollbar for the tooltip */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>