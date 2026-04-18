import axios from 'axios';

/**
 * Service to handle translations using MyMemory API (Free)
 */
export class TranslationService {
  private static BASE_URL = 'https://api.mymemory.translated.net/get';

  /**
   * Translates a string from English to Spanish
   */
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
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text on error
    }
  }

  /**
   * Translates an array of strings to Spanish (sequentially for reliability)
   */
  static async translateArray(texts: string[]): Promise<string[]> {
    return Promise.all(texts.map(t => this.translateToSpanish(t)));
  }
}
