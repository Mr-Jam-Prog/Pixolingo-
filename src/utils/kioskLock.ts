// Kiosk & Parental Gate helper utilities

export interface MathChallenge {
  num1: number;
  num2: number;
  operation: '×' | '+' | '-';
  answer: number;
  questionText: string;
}

export function generateMathChallenge(): MathChallenge {
  const opChoice = Math.random();
  if (opChoice > 0.4) {
    // Multiplication (standard parental gate)
    const n1 = Math.floor(Math.random() * 6) + 4; // 4 to 9
    const n2 = Math.floor(Math.random() * 6) + 3; // 3 to 8
    return {
      num1: n1,
      num2: n2,
      operation: '×',
      answer: n1 * n2,
      questionText: `Combien font ${n1} × ${n2} ?`,
    };
  } else {
    // Addition
    const n1 = Math.floor(Math.random() * 40) + 25;
    const n2 = Math.floor(Math.random() * 40) + 15;
    return {
      num1: n1,
      num2: n2,
      operation: '+',
      answer: n1 + n2,
      questionText: `Combien font ${n1} + ${n2} ?`,
    };
  }
}

const PARENT_PIN_KEY = 'app_parent_pin';
const KIOSK_MODE_KEY = 'app_kids_kiosk_active';

export function getStoredParentPin(): string {
  return localStorage.getItem(PARENT_PIN_KEY) || '1234';
}

export function setStoredParentPin(pin: string): void {
  localStorage.setItem(PARENT_PIN_KEY, pin);
}

export function isKioskActive(): boolean {
  return localStorage.getItem(KIOSK_MODE_KEY) === 'true';
}

export function setKioskActive(active: boolean): void {
  localStorage.setItem(KIOSK_MODE_KEY, active ? 'true' : 'false');
}

export function checkKioskExitPermission(input: string, challengeAnswer: number): boolean {
  const trimmed = input.trim();
  return parseInt(trimmed, 10) === challengeAnswer || trimmed === getStoredParentPin();
}

