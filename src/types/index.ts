export type LanguageCode =
  | 'es'
  | 'en'
  | 'fr'
  | 'de'
  | 'it'
  | 'ja'
  | 'pt'
  | 'ar'
  | 'zh'
  | 'ru'
  | 'ko'
  | 'nl';

export type ExerciseType =
  | 'multiple_choice'
  | 'translation'
  | 'listen_repeat'
  | 'fill_blank'
  | 'image_to_word'
  | 'audio_to_text'
  | 'oral';

export interface ExerciseOption {
  text: string;
  emoji?: string;
  audioPrompt?: string;
  phonetic?: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string; // The instruction/prompt in French
  spokenPrompt?: string; // Audio spoken instruction for pre-readers
  targetText?: string; // The phrase in the target language to speak or translate
  nativeText?: string; // French translation for clarity
  options?: string[]; // Multiple choice options or scrambled words
  optionsData?: ExerciseOption[]; // Rich visual/sound options for 3-6 years pre-readers
  correctAnswer: string | string[]; // Correct answer text or array of words
  audioPrompt?: string; // Target language text for SpeechSynthesis (BCP-47 clean)
  slowAudioPrompt?: string; // Slower/syllabified speech for ear training
  soundEffect?: string; // Onomatopoeia sound e.g. "Woof!" or "Meow!"
  explanation?: string; // Helpful explanation or grammar tip
  imageEmoji?: string; // Relevant visual emoji
  isEarlyLearner?: boolean; // Flag indicating visual/sound 3-6 format
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
  xpReward: number;
  completed?: boolean;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  color: string; // e.g., 'emerald', 'blue', 'purple', 'amber', 'rose'
  isEarlyLearner?: boolean; // 3-6 early childhood unit
  targetAge?: '3-6' | 'all';
  lessons: Lesson[];
  guidebook?: {
    grammarTips: { rule: string; explanation: string; example: string }[];
    keyVocabulary: { target: string; native: string; phonetic?: string }[];
  };
}

export interface Course {
  id: string;
  language: LanguageCode;
  languageName: string;
  flag: string;
  bcp47: string;
  units: Unit[];
}

export interface DiceBearAvatarConfig {
  style?: 'big-smile' | 'adventurer' | 'fun-emoji' | 'bottts' | 'avataaars';
  seed?: string;
  skinColor?: string;
  hairColor?: string;
  clothingColor?: string;
  accessories?: string;
  glasses?: string;
  backgroundColor?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarEmoji: string;
  avatarConfig?: DiceBearAvatarConfig;
  gems: number;
  xp: number;
  energy: number; // 0 to 5
  maxEnergy: number;
  streak: number;
  equippedOutfit?: string;
  ownedItems: string[];
  streakFreezeCount: number;
  activeBoostUntil?: number; // timestamp
  currentLanguage: LanguageCode;
  completedLessonIds: string[];
  mistakeBank: { exercise: Exercise; timestamp: number }[];
  dailyGoals: {
    targetXP: number;
    currentXP: number;
  };
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: 'boost' | 'hearts' | 'outfit' | 'freeze';
  outfitId?: string;
}

export type FamilyRole = 'parent' | 'kid' | 'teen';

export interface FamilyProfile {
  id: string;
  name: string;
  role: FamilyRole;
  age?: number;
  avatarEmoji: string;
  avatarConfig?: DiceBearAvatarConfig;
  customAvatar?: CustomAvatarConfig;
  gems: number;
  xp: number;
  streak: number;
  currentLanguage: LanguageCode;
  isKidsModeEnabled: boolean;
  learningTrack?: 'standard' | 'early_3_6';
  screenTimeLimitMinutes: number;
  screenTimeUsedMinutes: number;
  completedLessonIds: string[];
  mistakeBank: { exercise: Exercise; timestamp: number }[];
  dailyGoals: {
    targetXP: number;
    currentXP: number;
  };
}

export interface CustomAvatarConfig {
  gender?: 'neutral' | 'boy' | 'girl';
  skinTone: string; // e.g. '#FDDBB4', '#E0A370', '#8D5524'
  hairStyle: 'short' | 'curly' | 'long' | 'spiky' | 'braids' | 'wavy' | 'bald';
  hairColor: string; // e.g. '#2c1b18', '#b55239', '#e6be8a', '#4a3728'
  eyeExpression: 'happy' | 'sparkle' | 'focused' | 'wink' | 'calm';
  mouthExpression: 'smile' | 'big_grin' | 'laugh' | 'confident';
  outfit: 'tshirt' | 'hoodie' | 'explorer' | 'wizard' | 'superhero' | 'astronaut' | 'kimono';
  outfitColor: string;
  accessory: 'none' | 'glasses' | 'sunglasses' | 'headband' | 'scarf' | 'crown' | 'cap';
  petCompanion: 'none' | 'owl' | 'fox' | 'puppy' | 'kitten' | 'dragon' | 'robot';
  backgroundColor: string;
}

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'sapphire' | 'ruby' | 'diamond';

export interface LeaderboardUser {
  id: string;
  name: string;
  avatarEmoji: string;
  avatarConfig?: DiceBearAvatarConfig;
  xp: number;
  streak: number;
  isCurrentUser?: boolean;
  trend: 'up' | 'down' | 'same';
  countryFlag?: string;
}

export interface KidsSafeSettings {
  isKidsMode: boolean;
  parentalPin: string; // default e.g. "1234" or math challenge
  maxDailyMinutes: number;
  allowMicrophone: boolean;
  strictSoundEffects: boolean;
  encouragingVoiceovers: boolean;
}

