// Answer validation with fuzzy matching, accent normalization, and typo tolerance

export interface ValidationResult {
  isCorrect: boolean;
  isClose: boolean; // 1 minor typo, close enough
  matchedAnswer: string;
  feedbackMessage?: string;
}

/**
 * Clean and simplify text for fair comparison
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents for soft comparison
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'¡¿]/g, '') // remove punctuation
    .replace(/\s+/g, ' '); // collapse whitespace
}

/**
 * Keep accents but normalize punctuation & case
 */
export function cleanPunctuation(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'¡¿]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Calculate Levenshtein edit distance between two strings
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Validate user response against one or multiple accepted answers
 */
export function validateAnswer(userInput: string, expectedAnswer: string | string[]): ValidationResult {
  const userClean = cleanPunctuation(userInput);
  const userNormalized = normalizeText(userInput);

  const targets = Array.isArray(expectedAnswer) ? expectedAnswer : [expectedAnswer];

  // 1. Exact match (case/punctuation insensitive)
  for (const target of targets) {
    const targetClean = cleanPunctuation(target);
    if (userClean === targetClean) {
      return { isCorrect: true, isClose: false, matchedAnswer: target };
    }
  }

  // 2. Accent-insensitive match
  for (const target of targets) {
    const targetNormalized = normalizeText(target);
    if (userNormalized === targetNormalized) {
      return {
        isCorrect: true,
        isClose: false,
        matchedAnswer: target,
        feedbackMessage: "Attention aux accents, mais c'est bien la bonne réponse !",
      };
    }
  }

  // 3. Typo tolerance (Levenshtein distance <= 1 for words > 4 chars)
  for (const target of targets) {
    const targetNormalized = normalizeText(target);
    const distance = calculateLevenshteinDistance(userNormalized, targetNormalized);

    if (distance === 1 && targetNormalized.length >= 4) {
      return {
        isCorrect: true,
        isClose: true,
        matchedAnswer: target,
        feedbackMessage: `Presque parfait ! Attention à la petite faute de frappe : "${target}"`,
      };
    }
  }

  return {
    isCorrect: false,
    isClose: false,
    matchedAnswer: targets[0],
  };
}
