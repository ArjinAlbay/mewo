'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'

import { fetchActiveWords, storage, Word, StudySession } from '@/lib/api'
import Flashcard from '@/components/Flashcard'

export default function FlashcardsPage() {
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

  useEffect(() => {
    loadWordsAndStartSession()
    setProgress(storage.getStudyProgress())
  }, [])

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

  const loadWordsAndStartSession = async () => {
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
  }

  const handleCorrectAnswer = () => {
    const currentWord = words[currentWordIndex]
    const newScore = storage.updateWordProgress(currentWord.id, true)
    
    setProgress(prev => ({
      ...prev,
      [currentWord.id]: newScore
    }))
    
    setSession(prev => {
      const updated = {
        ...prev,
        correctAnswers: prev.correctAnswers + 1,
        studiedWords: prev.studiedWords + 1
      }
      storage.setSessionStats(updated)
      return updated
    })
  }

  const handleIncorrectAnswer = () => {
    const currentWord = words[currentWordIndex]
    const newScore = storage.updateWordProgress(currentWord.id, false)
    
    setProgress(prev => ({
      ...prev,
      [currentWord.id]: newScore
    }))
    
    setSession(prev => {
      const updated = {
        ...prev,
        wrongAnswers: prev.wrongAnswers + 1,
        studiedWords: prev.studiedWords + 1
      }
      storage.setSessionStats(updated)
      return updated
    })
  }

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
      <div className="flex items-center justify-between p-4 bg-white border-b safe-top">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
        
        <div className="text-center">
          <div className="text-sm text-gray-600">
            {currentWordIndex + 1} / {words.length}
          </div>
          <div className="text-xs text-gray-500">
            ✓ {session.correctAnswers} | ✗ {session.wrongAnswers}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/')}
        >
          <Home className="w-4 h-4" />
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