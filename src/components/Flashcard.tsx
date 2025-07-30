'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  RotateCcw, 
  Check, 
  X, 
  Volume2, 
  Eye, 
  EyeOff,
  Trophy,
  Target,
  Zap
} from 'lucide-react'
import { Word } from '@/lib/api'

interface FlashcardProps {
  word: Word
  totalWords: number
  currentIndex: number
  onCorrect: () => void
  onIncorrect: () => void
  onNext: () => void
  progress: Record<number, number>
}

export default function Flashcard({
  word,
  totalWords,
  currentIndex,
  onCorrect,
  onIncorrect,
  onNext,
  progress
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [answered, setAnswered] = useState(false)

  const wordProgress = progress[word.id] || 0
  const progressPercent = (wordProgress / 5) * 100

  // Reset card state when word changes
  useEffect(() => {
    setIsFlipped(false)
    setShowAnswer(false)
    setAnswered(false)
  }, [word.id])

  const handleFlip = () => {
    if (!answered) {
      setIsFlipped(!isFlipped)
      setShowAnswer(!showAnswer)
    }
  }

  const handleCorrect = () => {
    setAnswered(true)
    onCorrect()
    setTimeout(() => {
      onNext()
    }, 1000)
  }

  const handleIncorrect = () => {
    setAnswered(true)
    onIncorrect()
    setTimeout(() => {
      onNext()
    }, 1000)
  }

  const speakWord = (text: string, lang: 'en' | 'tr' = 'en') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang === 'en' ? 'en-US' : 'tr-TR'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const getProgressColor = (score: number) => {
    if (score >= 4) return 'bg-green-500'
    if (score >= 2) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getProgressIcon = (score: number) => {
    if (score >= 4) return <Trophy className="w-4 h-4 text-green-600" />
    if (score >= 2) return <Target className="w-4 h-4 text-yellow-600" />
    return <Zap className="w-4 h-4 text-red-600" />
  }

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {currentIndex + 1} / {totalWords}
          </Badge>
          <div className="flex items-center space-x-1">
            {getProgressIcon(wordProgress)}
            <span className="text-sm text-gray-600">{wordProgress}/5</span>
          </div>
        </div>
        <Progress 
          value={((currentIndex + 1) / totalWords) * 100} 
          className="flex-1 mx-4 h-2"
        />
      </div>

      {/* Word Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Bu kelime için ilerleme</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(wordProgress)}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="flex-1 flex items-center justify-center mb-8">
        <div 
          className={`flip-card w-full h-80 cursor-pointer ${isFlipped ? 'flipped' : ''}`}
          onClick={handleFlip}
        >
          <div className="flip-card-inner">
            {/* Front - English */}
            <Card className="flip-card-front flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl border-0">
              <div className="text-center">
                <div className="text-4xl font-bold mb-4">{word.en}</div>
                <div className="text-lg opacity-90 mb-6">İngilizce</div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    speakWord(word.en, 'en')
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Dinle
                </Button>
              </div>
              <div className="absolute bottom-4 text-sm opacity-75 flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                Çeviriyi görmek için dokun
              </div>
            </Card>

            {/* Back - Turkish */}
            <Card className="flip-card-back flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-2xl border-0">
              <div className="text-center">
                <div className="text-4xl font-bold mb-4">{word.tr}</div>
                <div className="text-lg opacity-90 mb-6">Türkçe</div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    speakWord(word.tr, 'tr')
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Dinle
                </Button>
              </div>
              <div className="absolute bottom-4 text-sm opacity-75 flex items-center">
                <EyeOff className="w-4 h-4 mr-1" />
                İngilizce'yi görmek için dokun
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Answer Buttons */}
      {showAnswer && !answered && (
        <div className="space-y-3">
          <div className="text-center text-gray-600 mb-4">
            Bu kelimeyi biliyor musunuz?
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={handleIncorrect}
              variant="outline"
              size="lg"
              className="flex-1 h-14 text-lg border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <X className="w-6 h-6 mr-2 text-red-500" />
              Bilmiyorum
            </Button>
            <Button
              onClick={handleCorrect}
              size="lg"
              className="flex-1 h-14 text-lg bg-green-500 hover:bg-green-600"
            >
              <Check className="w-6 h-6 mr-2" />
              Biliyorum
            </Button>
          </div>
        </div>
      )}

      {/* Show Answer Button */}
      {!showAnswer && !answered && (
        <div className="space-y-3">
          <Button
            onClick={() => {
              setShowAnswer(true)
              if (!isFlipped) {
                setIsFlipped(true)
              }
            }}
            variant="outline"
            size="lg"
            className="w-full h-14 text-lg"
          >
            <Eye className="w-5 h-5 mr-2" />
            Cevabı Göster
          </Button>
          <div className="text-center text-sm text-gray-500">
            Veya kartı çevirmek için üzerine dokun
          </div>
        </div>
      )}

      {/* Feedback Message */}
      {answered && (
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">
            ✓ Harika!
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Bir sonraki kelimeye geçiliyor...
          </div>
        </div>
      )}

      {/* Reset Card Button */}
      <div className="mt-4 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsFlipped(false)
            setShowAnswer(false)
            setAnswered(false)
          }}
          className="text-gray-500"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Kartı Sıfırla
        </Button>
      </div>
    </div>
  )
}