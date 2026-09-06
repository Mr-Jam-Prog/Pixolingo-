import { FamilyProfile } from '../types';

export const DEFAULT_FAMILY_MEMBERS: FamilyProfile[] = [
  {
    id: 'fam-1',
    name: 'Léo',
    role: 'kid',
    age: 8,
    avatarEmoji: '🦊',
    customAvatar: {
      gender: 'boy',
      skinTone: '#FDDBB4',
      hairStyle: 'spiky',
      hairColor: '#4a3728',
      eyeExpression: 'sparkle',
      mouthExpression: 'big_grin',
      outfit: 'explorer',
      outfitColor: '#10b981',
      accessory: 'cap',
      petCompanion: 'fox',
      backgroundColor: '#d1fae5',
    },
    gems: 320,
    xp: 280,
    streak: 4,
    currentLanguage: 'es',
    isKidsModeEnabled: true,
    screenTimeLimitMinutes: 25,
    screenTimeUsedMinutes: 10,
    completedLessonIds: ['es-u1-l1'],
    mistakeBank: [],
    dailyGoals: {
      targetXP: 30,
      currentXP: 20,
    },
  },
  {
    id: 'fam-2',
    name: 'Emma',
    role: 'teen',
    age: 14,
    avatarEmoji: '🐱',
    customAvatar: {
      gender: 'girl',
      skinTone: '#FDDBB4',
      hairStyle: 'wavy',
      hairColor: '#b55239',
      eyeExpression: 'happy',
      mouthExpression: 'smile',
      outfit: 'hoodie',
      outfitColor: '#8b5cf6',
      accessory: 'headband',
      petCompanion: 'kitten',
      backgroundColor: '#ede9fe',
    },
    gems: 540,
    xp: 650,
    streak: 9,
    currentLanguage: 'en',
    isKidsModeEnabled: false,
    screenTimeLimitMinutes: 45,
    screenTimeUsedMinutes: 15,
    completedLessonIds: ['en-u1-l1'],
    mistakeBank: [],
    dailyGoals: {
      targetXP: 50,
      currentXP: 45,
    },
  },
  {
    id: 'fam-3',
    name: 'Sarah (Maman)',
    role: 'parent',
    age: 40,
    avatarEmoji: '🦉',
    customAvatar: {
      gender: 'neutral',
      skinTone: '#E0A370',
      hairStyle: 'curly',
      hairColor: '#2c1b18',
      eyeExpression: 'calm',
      mouthExpression: 'confident',
      outfit: 'wizard',
      outfitColor: '#3b82f6',
      accessory: 'glasses',
      petCompanion: 'owl',
      backgroundColor: '#dbeafe',
    },
    gems: 890,
    xp: 1420,
    streak: 21,
    currentLanguage: 'it',
    isKidsModeEnabled: false,
    screenTimeLimitMinutes: 120,
    screenTimeUsedMinutes: 20,
    completedLessonIds: ['it-u1-l1'],
    mistakeBank: [],
    dailyGoals: {
      targetXP: 60,
      currentXP: 60,
    },
  },
  {
    id: 'fam-noah',
    name: 'Noah (3-6 ans)',
    role: 'kid',
    age: 4,
    avatarEmoji: '🧸',
    customAvatar: {
      gender: 'boy',
      skinTone: '#FDDBB4',
      hairStyle: 'curly',
      hairColor: '#b55239',
      eyeExpression: 'sparkle',
      mouthExpression: 'big_grin',
      outfit: 'superhero',
      outfitColor: '#f59e0b',
      accessory: 'crown',
      petCompanion: 'puppy',
      backgroundColor: '#fef3c7',
    },
    gems: 250,
    xp: 90,
    streak: 3,
    currentLanguage: 'en',
    isKidsModeEnabled: true,
    learningTrack: 'early_3_6',
    screenTimeLimitMinutes: 20,
    screenTimeUsedMinutes: 5,
    completedLessonIds: [],
    mistakeBank: [],
    dailyGoals: {
      targetXP: 20,
      currentXP: 10,
    },
  },
];

const FAMILY_STORAGE_KEY = 'app_family_profiles';
const ACTIVE_MEMBER_ID_KEY = 'app_active_family_member_id';

export function getStoredFamilyMembers(): FamilyProfile[] {
  try {
    const raw = localStorage.getItem(FAMILY_STORAGE_KEY);
    if (raw) {
      const parsed: FamilyProfile[] = JSON.parse(raw);
      // Ensure default profiles like 'fam-noah' exist so the user can test immediately
      const missingDefaults = DEFAULT_FAMILY_MEMBERS.filter(
        (def) => !parsed.some((p) => p.id === def.id)
      );
      if (missingDefaults.length > 0) {
        const merged = [...parsed, ...missingDefaults];
        saveFamilyMembers(merged);
        return merged;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse family profiles', e);
  }
  return DEFAULT_FAMILY_MEMBERS;
}

export function saveFamilyMembers(members: FamilyProfile[]): void {
  localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(members));
}

export function getStoredActiveFamilyMemberId(): string {
  return localStorage.getItem(ACTIVE_MEMBER_ID_KEY) || DEFAULT_FAMILY_MEMBERS[0].id;
}

export function saveActiveFamilyMemberId(id: string): void {
  localStorage.setItem(ACTIVE_MEMBER_ID_KEY, id);
}
