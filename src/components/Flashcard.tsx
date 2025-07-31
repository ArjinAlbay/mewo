

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  RotateCcw, 
  Check, 
  X, 
  Eye, 
  EyeOff,
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

export default function Flashcard({ word, totalWords, currentIndex, onCorrect, onIncorrect, onNext, progress }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [answered, setAnswered] = useState(false)
  useEffect(() => { setIsFlipped(false); setAnswered(false) }, [word.id])
  const wordProgress = progress[word.id] || 0
  const progressPercent = (wordProgress / 5) * 100
 
  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Badge variant="outline" className="text-sm">{currentIndex + 1} | {totalWords}</Badge>
        <Progress value={((currentIndex + 1) / totalWords) * 100} className="flex-1 mx-4 h-2" />
        <span className="text-sm text-gray-600">{wordProgress}/5</span>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Bu kelime için ilerleme</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all duration-500 ${wordProgress >= 4 ? 'bg-green-500' : wordProgress >= 2 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center mb-8">
        <div className={`flip-card w-full h-80 cursor-pointer ${isFlipped ? 'flipped' : ''}`} onClick={() => !answered && setIsFlipped(f => !f)}>
          <div className="flip-card-inner">
            <Card className="flip-card-front flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl border-0">
              <div className="text-center">
                <div className="text-4xl font-bold mb-4">{word.en}</div>
                
              </div>
              <div className="absolute bottom-4 text-sm opacity-75 flex items-center"><Eye className="w-4 h-4 mr-1" />Çeviriyi görmek için dokun</div>
            </Card>
            <Card className="flip-card-back flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-2xl border-0">
              <div className="text-center">
                <div className="text-4xl font-bold mb-4">{word.tr}</div>
                
              </div>
              <div className="absolute bottom-4 text-sm opacity-75 flex items-center"><EyeOff className="w-4 h-4 mr-1" />İngilizceyi görmek için dokun</div>
            </Card>
          </div>
        </div>
      </div>
     {!answered ? (
  <div className="flex space-x-3">
    <Button 
      onClick={() => { setAnswered(true); onIncorrect(); setTimeout(onNext, 1000) }} 
      size="lg" 
      className="flex-1 h-14 text-lg bg-red-500 text-white hover:bg-red-600 font-medium shadow-md"
    >
      <X className="w-6 h-6 mr-2" />
      Bilmiyorum
    </Button>
    <Button 
      onClick={() => { setAnswered(true); onCorrect(); setTimeout(onNext, 1000) }} 
      size="lg" 
      className="flex-1 h-14 text-lg bg-green-500 hover:bg-green-600 font-medium shadow-md"
    >
      <Check className="w-6 h-6 mr-2" />
      Biliyorum
    </Button>
  </div>
) : (
  <div className="text-center mt-4">
    <div className="text-lg font-semibold text-green-600">✓ Harika!</div>
    <div className="text-sm text-gray-500 mt-1">Bir sonraki kelimeye geçiliyor...</div>
  </div>
)}
      
    </div>
  )
}