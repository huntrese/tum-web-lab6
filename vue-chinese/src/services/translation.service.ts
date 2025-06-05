import axios from 'axios';
import type { TranslationResponse, PinyinResponse } from '@/types/translation';

const API_URL = 'https://juansoft.online/api';

class TranslationService {
  async translateToChinese(text: string): Promise<TranslationResponse> {
    const response = await axios.post<TranslationResponse>(`${API_URL}/translate/to-chinese`, { text });
    return response.data;
  }

  async translateToEnglish(text: string): Promise<TranslationResponse> {
    const response = await axios.post<TranslationResponse>(`${API_URL}/translate/to-english`, { text });
    return response.data;
  }

  async getPinyin(text: string): Promise<PinyinResponse> {
    const response = await axios.post<PinyinResponse>(`${API_URL}/pinyin`, { text });
    return response.data;
  }
}

export default new TranslationService();
