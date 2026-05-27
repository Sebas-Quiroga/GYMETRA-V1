import axios from 'axios';
export class TranslationService {
  private static BASE_URL = 'https://api.mymemory.translated.net/get';
  static async translateToSpanish(text: string): Promise<string> {
    if (!text || text.trim() === '') return text;
    try {
      const response = await axios.get(this.BASE_URL, {
        params: {
          q: text,
          langpair: 'en|es',
        },
      });
      if (response.data && response.data.responseData) {
        return response.data.responseData.translatedText;
      }
      return text;
    } catch {
      return text;
    }
  }
  static async translateArray(texts: string[]): Promise<string[]> {
    return Promise.all(texts.map(t => this.translateToSpanish(t)));
  }
}

