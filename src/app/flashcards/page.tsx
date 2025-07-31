'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'

import { fetchActiveWords, storage, Word, StudySession } from '@/lib/api'
import Flashcard from '@/components/Flashcard'

// İç komponent - useSearchParams kullanıyor
function FlashcardsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isRandom = searchParams?.get('random') === 'true'
  
  const [words, setWords] = useState<Word[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<StudySession>({
    totalWords: 0,
    studiedWords: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    sessionTime: 0
  })
  const [progress, setProgress] = useState<Record<number, number>>({})
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)

  const loadWordsAndStartSession = useCallback(async () => {
    setLoading(true)
    try {
      const fetchedWords = await fetchActiveWords()
      
      if (fetchedWords.length === 0) {
        router.push('/')
        return
      }

      // Shuffle words if random mode
      const wordsToUse = isRandom 
        ? [...fetchedWords].sort(() => Math.random() - 0.5)
        : fetchedWords

      setWords(wordsToUse)
      
      // Start new session
      const newSession: StudySession = {
        totalWords: wordsToUse.length,
        studiedWords: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        sessionTime: 0
      }
      
      setSession(newSession)
      storage.setSessionStats(newSession)
      setSessionStartTime(Date.now())
      
    } catch (error) {
      console.error('Failed to load words:', error)
      router.push('/')
    }
    setLoading(false)
  }, [isRandom, router])

  useEffect(() => {
    loadWordsAndStartSession()
    setProgress(storage.getStudyProgress())
  }, [loadWordsAndStartSession])

  // Update session time
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (sessionStartTime > 0) {
      interval = setInterval(() => {
        const newSession = {
          ...session,
          sessionTime: Math.floor((Date.now() - sessionStartTime) / 1000)
        }
        setSession(newSession)
        storage.setSessionStats(newSession)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [sessionStartTime, session])

  const handleAnswer = (isCorrect: boolean) => {
    const currentWord = words[currentWordIndex]
    const newScore = storage.updateWordProgress(currentWord.id, isCorrect)
    setProgress(prev => ({
      ...prev,
      [currentWord.id]: newScore
    }))
    setSession(prev => {
      const updated = {
        ...prev,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        wrongAnswers: prev.wrongAnswers + (isCorrect ? 0 : 1),
        studiedWords: prev.studiedWords + 1
      }
      storage.setSessionStats(updated)
      return updated
    })
  }

  const handleCorrectAnswer = () => handleAnswer(true)
  const handleIncorrectAnswer = () => handleAnswer(false)

  const goToNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
    } else {
      // Session completed
      completeSession()
    }
  }

  const completeSession = () => {
    const completedSession = {
      ...session,
      completedAt: new Date(),
      sessionTime: Math.floor((Date.now() - sessionStartTime) / 1000)
    }
    
    storage.setSessionStats(completedSession)
    
    alert(`Tebrikler! ${session.correctAnswers}/${session.totalWords} doğru cevap verdiniz!`)
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Kelimeler yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Kelime bulunamadı</p>
          <Button onClick={() => router.push('/')}>
            <Home className="w-4 h-4 mr-2" />
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
   {/* Header */}
<div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white safe-top shadow-lg">
  <Button 
    variant="ghost" 
    size="sm" 
    onClick={() => router.push('/')}
    className="text-white hover:bg-white/20 font-medium p-3"
  >
    <ArrowLeft className="w-8 h-8 mr-2" />
    Geri
  </Button>
  
  <div className="text-center">
    <div className="text-sm font-semibold mb-1">
      {currentWordIndex + 1} / {words.length}
    </div>
    <div className="text-xs bg-white/20 px-3 py-1 rounded-full">
      <span className="text-green-200">✓ {session.correctAnswers}</span>
      <span className="mx-2">|</span>
      <span className="text-red-200">✗ {session.wrongAnswers}</span>
    </div>
  </div>
  
  <Button 
    variant="ghost" 
    size="sm" 
    onClick={() => router.push('/')}
    className="text-white hover:bg-white/20 font-medium p-3"
  >
    <Home className="w-8 h-8" />
  </Button>
</div>

      {/* Flashcard */}
      <Flashcard
        word={words[currentWordIndex]}
        totalWords={words.length}
        currentIndex={currentWordIndex}
        onCorrect={handleCorrectAnswer}
        onIncorrect={handleIncorrectAnswer}
        onNext={goToNextWord}
        progress={progress}
      />
    </div>
  )
}

// Ana komponent - Suspense wrapper
export default function FlashcardsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Sayfa yükleniyor...</div>
        </div>
      </div>
    }>
      <FlashcardsContent />
    </Suspense>
  )
}