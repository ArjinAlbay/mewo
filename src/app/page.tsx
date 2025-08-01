'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  RotateCcw, 
  Trophy, 
  Target, 
  Clock,
  BookOpen,
  Zap,
  Settings,
  TrendingUp
} from 'lucide-react'
import { fetchActiveWords, storage, Word, StudySession } from '@/lib/api'

export default function StudentDashboard() {
  const router = useRouter()
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<StudySession>({
    totalWords: 0,
    studiedWords: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    sessionTime: 0
  })
  const [progress, setProgress] = useState<Record<number, number>>({})

  useEffect(() => {
    loadWords()
    setProgress(storage.getStudyProgress())
    
    const existingSession = storage.getSessionStats()
    if (existingSession) {
      setSession(existingSession)
    }
  }, [])

  const loadWords = async () => {
    setLoading(true)
    try {
      const fetchedWords = await fetchActiveWords()
      setWords(fetchedWords)
      
      if (fetchedWords.length > 0) {
        setSession(prev => ({
          ...prev,
          totalWords: fetchedWords.length
        }))
      }
    } catch (error) {
      console.error('Failed to load words:', error)
    }
    setLoading(false)
  }

  const startStudySession = () => {
    // Reset session
    const newSession: StudySession = {
      totalWords: words.length,
      studiedWords: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      sessionTime: 0
    }
    storage.setSessionStats(newSession)
    
    // Flashcard sayfasına git
    router.push('/flashcards')
  }

  const resetProgress = () => {
    storage.setStudyProgress({})
    setProgress({})
    alert('İlerleme sıfırlandı!')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getOverallProgress = () => {
    if (words.length === 0) return 0
    const totalScore = words.reduce((sum, word) => sum + (progress[word.id] || 0), 0)
    const maxScore = words.length * 5
    return (totalScore / maxScore) * 100
  }

  const getMasteredWords = () => {
    return words.filter(word => (progress[word.id] || 0) >= 4).length
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
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-xl font-semibold mb-4">Henüz Kelime Yok</h2>
            <p className="text-gray-600 mb-6">
              Öğretmeniniz henüz sizin için kelime seçmemiş. 
              Lütfen öğretmeninizle iletişime geçin.
            </p>
            <Button onClick={loadWords} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen safe-top safe-bottom p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
       <div className="text-center mb-8">
  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-3">
    Oxford 3000
  </h1>
  <p className="text-gray-500 text-lg">Kelime Ezberleme Uygulaması</p>
</div>

       {/* Stats Overview */}
<div className="grid grid-cols-2 gap-4 mb-6">
  <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
    <CardContent className="p-6 text-center">
      <div className="text-3xl font-bold text-blue-600 mb-1">{words.length}</div>
      <div className="text-sm font-medium text-blue-700">Toplam Kelime</div>
    </CardContent>
  </Card>
  <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
    <CardContent className="p-6 text-center">
      <div className="text-3xl font-bold text-green-600 mb-1">{getMasteredWords()}</div>
      <div className="text-sm font-medium text-green-700">Öğrenilen</div>
    </CardContent>
  </Card>
</div>

       {/* Overall Progress */}
<Card className="mb-6 border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
  <CardHeader className="pb-3">
    <CardTitle className="flex items-center text-lg font-semibold">
      <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Genel İlerleme
      </span>
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-0">
    <div className="flex justify-between text-sm font-medium text-gray-700 mb-3">
      <span>İlerleme Durumu</span>
      <span className="text-indigo-600 font-bold">{Math.round(getOverallProgress())}%</span>
    </div>
    <Progress value={getOverallProgress()} className="h-4 mb-4" />
    <div className="flex justify-between text-sm text-gray-600 font-medium">
      <span className="text-green-600">✓ {getMasteredWords()} kelime öğrenildi</span>
      <span className="text-orange-600">{words.length - getMasteredWords()} kelime kaldı</span>
    </div>
  </CardContent>
</Card>
        {/* Current Session Stats */}
        {session.studiedWords > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2 text-purple-500" />
                Son Oturum
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-green-600">{session.correctAnswers}</div>
                  <div className="text-xs text-gray-500">Doğru</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-red-600">{session.wrongAnswers}</div>
                  <div className="text-xs text-gray-500">Yanlış</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-600">{formatTime(session.sessionTime)}</div>
                  <div className="text-xs text-gray-500">Süre</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-4 mb-6">
         <Button 
  onClick={startStudySession}
  size="lg" 
  className="w-full text-white h-16 text-lg font-semibold bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500 hover:from-blue-600 hover:via-purple-700 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
>
  <Play className="w-6 h-6 mr-3" />
  Çalışmaya Başla
</Button>
          
          <div className="grid grid-cols-2 gap-4">
           <Button 
  onClick={() => router.push('/flashcards?random=true')}
  size="lg"
  className="h-12 bg-amber-500 text-white hover:bg-amber-600 transform hover:scale-105 transition-all duration-200 font-medium shadow-md"
>
  <Zap className="w-5 h-5 mr-2" />
  Rastgele
</Button>
<Button 
  onClick={resetProgress}
  size="lg"
  className="h-12 bg-red-500 text-white hover:bg-red-600 transform hover:scale-105 transition-all duration-200 font-medium shadow-md"
>
  <RotateCcw className="w-5 h-5 mr-2" />
  Sıfırla
</Button>
          </div>
        </div>

        {/* Word Progress List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Target className="w-5 mr-2 text-orange-500" />
              Kelime Durumu
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0"> 
            <div className="max-h-60 overflow-y-auto space-y-2">
              {words.slice(0, 10).map((word) => {
                const wordScore = progress[word.id] || 0
                const getScoreColor = (score: number) => {
                  if (score >= 4) return 'text-green-600 bg-green-50'
                  if (score >= 2) return 'text-yellow-600 bg-yellow-50'
                  return 'text-red-600 bg-red-50'
                }
                
                const getScoreIcon = (score: number) => {
                  if (score >= 4) return <Trophy className="w-4 h-4" />
                  if (score >= 2) return <Target className="w-4 h-4" />
                  return <Zap className="w-4 h-4" />
                }

                return (
                  <div key={word.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{word.en}</div>
                      <div className="text-sm text-gray-500">{word.tr}</div>
                    </div>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getScoreColor(wordScore)}`}>
                      {getScoreIcon(wordScore)}
                      <span className="text-sm font-medium">{wordScore}/5</span>
                    </div>
                  </div>
                )
              })}
              {words.length > 10 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  ve {words.length - 10} kelime daha...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

       
      </div>
    </div>
  )
}