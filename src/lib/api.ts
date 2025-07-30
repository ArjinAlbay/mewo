// src/lib/api.ts
const TEACHER_API_URL = process.env.NEXT_PUBLIC_TEACHER_API_URL

export interface Word {
  id: number
  en: string
  tr: string
}

export interface StudySession {
  totalWords: number
  studiedWords: number
  correctAnswers: number
  wrongAnswers: number
  sessionTime: number
  completedAt?: Date
}

// Teacher API'den aktif kelimeleri getir
export async function fetchActiveWords(): Promise<Word[]> {
  try {
    const response = await fetch(`${TEACHER_API_URL}/api/active-words`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch words')
    }

    const data = await response.json()
    return data.words || []
  } catch (error) {
    console.error('API Error:', error)
    // Fallback data for development
    return [
      { id: 1, en: "ability", tr: "kabiliyet" },
      { id: 2, en: "about", tr: "hakkında" },
      { id: 3, en: "above", tr: "yukarıda" },
      { id: 4, en: "accept", tr: "kabul etmek" },
      { id: 5, en: "access", tr: "erişim" },
      { id: 6, en: "accident", tr: "kaza" },
      { id: 7, en: "according", tr: "göre" },
      { id: 8, en: "account", tr: "hesap" },
      { id: 9, en: "accurate", tr: "doğru" },
      { id: 10, en: "achieve", tr: "başarmak" }
    ]
  }
}

// Local storage helpers
export const storage = {
  // Study progress
  getStudyProgress: (): Record<number, number> => {
    try {
      const progress = localStorage.getItem('study_progress')
      return progress ? JSON.parse(progress) : {}
    } catch {
      return {}
    }
  },

  setStudyProgress: (progress: Record<number, number>) => {
    try {
      localStorage.setItem('study_progress', JSON.stringify(progress))
    } catch (e) {
      console.error('Failed to save progress:', e)
    }
  },

  updateWordProgress: (wordId: number, correct: boolean) => {
    const progress = storage.getStudyProgress()
    const currentScore = progress[wordId] || 0
    
    // Correct: +1, Wrong: -1, Min: 0, Max: 5
    if (correct) {
      progress[wordId] = Math.min(currentScore + 1, 5)
    } else {
      progress[wordId] = Math.max(currentScore - 1, 0)
    }
    
    storage.setStudyProgress(progress)
    return progress[wordId]
  },

  // Session data
  getSessionStats: (): StudySession | null => {
    try {
      const session = localStorage.getItem('current_session')
      return session ? JSON.parse(session) : null
    } catch {
      return null
    }
  },

  setSessionStats: (session: StudySession) => {
    try {
      localStorage.setItem('current_session', JSON.stringify(session))
    } catch (e) {
      console.error('Failed to save session:', e)
    }
  },

  clearSession: () => {
    try {
      localStorage.removeItem('current_session')
    } catch (e) {
      console.error('Failed to clear session:', e)
    }
  },

  // Settings
  getSettings: () => {
    try {
      const settings = localStorage.getItem('app_settings')
      return settings ? JSON.parse(settings) : {
        showTurkishFirst: false,
        autoFlip: true,
        studyMode: 'flashcard' // flashcard, quiz, typing
      }
    } catch {
      return {
        showTurkishFirst: false,
        autoFlip: true,
        studyMode: 'flashcard'
      }
    }
  },

  setSettings: (settings: any) => {
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings))
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }
}