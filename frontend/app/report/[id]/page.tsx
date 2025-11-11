'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface CheckResult {
  task_id: string
  status: string
  originality: number
  total_words: number
  total_chars: number
  matches: Array<{
    start: number
    end: number
    text: string
    source_id: number
    similarity: number
    type: string
  }>
  sources: Array<{
    id: number
    title: string
    url: string
    domain: string
    match_count: number
  }>
  ai_powered: boolean
  created_at: string
}

export default function ReportPage() {
  const params = useParams()
  const taskId = params.id as string
  
  const [result, setResult] = useState<CheckResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/v1/check/${taskId}`)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (taskId) {
      fetchResult()
    }
  }, [taskId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка результатов...</p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 text-xl font-bold mb-2">Ошибка</h2>
          <p className="text-red-600">{error || 'Результат не найден'}</p>
          <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Вернуться на главную
          </a>
        </div>
      </div>
    )
  }

  const getOriginalityColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Результат проверки</h1>
            <p className="text-gray-500 text-sm">ID: {result.task_id}</p>
          </div>

          {/* Originality Score */}
          <div className="mt-8 text-center">
            <div className={`text-7xl font-bold ${getOriginalityColor(result.originality)}`}>
              {result.originality.toFixed(1)}%
            </div>
            <p className="text-gray-600 mt-2">Оригинальность</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-800">{result.total_words}</div>
              <div className="text-gray-600 text-sm">Слов</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-800">{result.total_chars}</div>
              <div className="text-gray-600 text-sm">Символов</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-800">{result.matches?.length || 0}</div>
              <div className="text-gray-600 text-sm">Совпадений</div>
            </div>
          </div>

          {result.ai_powered && (
            <div className="mt-4 text-center text-sm text-blue-600">
              🤖 Проверено с помощью AI
            </div>
          )}
        </div>

        {/* Matches */}
        {result.matches && result.matches.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-4">Найденные совпадения</h2>
            <div className="space-y-4">
              {result.matches.map((match, index) => (
                <div key={index} className="border-l-4 border-red-400 pl-4 py-2">
                  <p className="text-gray-800">{match.text}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>Сходство: {(match.similarity * 100).toFixed(0)}%</span>
                    <span>Тип: {match.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {result.sources && result.sources.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Источники</h2>
            <div className="space-y-3">
              {result.sources.map((source) => (
                <div key={source.id} className="border-b pb-3 last:border-b-0">
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {source.title}
                  </a>
                  <div className="text-sm text-gray-600 mt-1">
                    <span>{source.domain}</span>
                    <span className="mx-2">•</span>
                    <span>Совпадений: {source.match_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            ← Новая проверка
          </a>
        </div>
      </div>
    </div>
  )
}