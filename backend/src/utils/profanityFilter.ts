import OpenAI from 'openai';
import { config } from '../config';

const openai = new OpenAI({
  apiKey: config.openai.apiKey
});

const commonOffensiveWords: string[] = [
  // Add your list of offensive words here
];

export const profanityFilter = async (text: string): Promise<boolean> => {
  try {
    // First check against common offensive words
    const hasCommonOffensiveWords = commonOffensiveWords.some(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );

    if (hasCommonOffensiveWords) {
      return true;
    }

    // If no common offensive words found, use OpenAI to check
    const response = await openai.moderations.create({
      input: text
    });

    const result = response.results[0];
    return result.flagged;
  } catch (error) {
    console.error('Error in profanity filter:', error);
    // If there's an error with OpenAI, fall back to common words check
    return commonOffensiveWords.some(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );
  }
};

// Optional: Local fallback profanity filter
const commonOffensiveWordsLocal = [
  // Add your list of words to filter
  // This is a basic implementation and should be enhanced for production
];

export const localProfanityFilter = (content: string): string => {
  let filteredContent = content.toLowerCase();
  commonOffensiveWordsLocal.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filteredContent = filteredContent.replace(regex, '*'.repeat(word.length));
  });
  return filteredContent;
}; 