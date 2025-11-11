'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

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
  const router = useRouter()
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
          throw new Error(`РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё: ${response.status}`)
        }
        
        const data = await response.json()
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'РќРµРёР·РІРµСЃС‚РЅР°СЏ РѕС€РёР±РєР°')
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Р—Р°РіСЂСѓР·РєР° СЂРµР·СѓР»СЊС‚Р°С‚РѕРІ РїСЂРѕРІРµСЂРєРё...</p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md border border-slate-200">
          <div className="text-red-500 text-6xl mb-4 text-center">!</div>
          <h2 className="text-red-800 text-2xl font-bold mb-3 text-center">РћС€РёР±РєР°</h2>
          <p className="text-slate-600 text-center mb-6">{error || 'Р РµР·СѓР»СЊС‚Р°С‚ РЅРµ РЅР°Р№РґРµРЅ'}</p>
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Р’РµСЂРЅСѓС‚СЊСЃСЏ РЅР° РіР»Р°РІРЅСѓСЋ
          </button>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(result.created_at).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-200 overflow-hidden print:shadow-none">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-8 py-6 print:bg-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-slate-800 text-2xl font-bold">A</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">ANTIPLAGIAT</h1>
                  <p className="text-sm text-slate-300">РЎРёСЃС‚РµРјР° РїСЂРѕРІРµСЂРєРё СѓРЅРёРєР°Р»СЊРЅРѕСЃС‚Рё</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-300">ID РїСЂРѕРІРµСЂРєРё</p>
                <p className="text-sm font-mono">{result.task_id.substring(0, 8)}</p>
              </div>
            </div>
          </div>

          <div className="p-8 print:p-12">
            <div className="text-center mb-8 border-b-2 border-slate-200 pb-6">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">РЎРџР РђР’РљРђ</h2>
              <p className="text-slate-600">
                Рѕ СЂРµР·СѓР»СЊС‚Р°С‚Р°С… РїСЂРѕРІРµСЂРєРё С‚РµРєСЃС‚РѕРІРѕРіРѕ РґРѕРєСѓРјРµРЅС‚Р° РЅР° СѓРЅРёРєР°Р»СЊРЅРѕСЃС‚СЊ
              </p>
            </div>

            <div className="mb-8 space-y-3 bg-slate-50 p-6 rounded-lg border border-slate-200">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="font-semibold text-slate-700">РџСЂРѕРІРµСЂРєР° РІС‹РїРѕР»РЅРµРЅР° РІ СЃРёСЃС‚РµРјРµ:</span>
                <span className="text-slate-900 font-bold">ANTIPLAGIAT.AI</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="font-semibold text-slate-700">Р”Р°С‚Р° Рё РІСЂРµРјСЏ РїСЂРѕРІРµСЂРєРё:</span>
                <span className="text-slate-900 font-mono">{formattedDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="font-semibold text-slate-700">РљРѕР»РёС‡РµСЃС‚РІРѕ СЃР»РѕРІ:</span>
                <span className="text-slate-900 font-bold">{result.total_words}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="font-semibold text-slate-700">РљРѕР»РёС‡РµСЃС‚РІРѕ СЃРёРјРІРѕР»РѕРІ:</span>
                <span className="text-slate-900">{result.total_chars}</span>
              </div>
              {result.ai_powered && (
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-slate-700">РўРµС…РЅРѕР»РѕРіРёСЏ:</span>
                  <span className="text-blue-600 font-semibold">AI-РїСЂРѕРІРµСЂРєР° (Google Gemini 2.0)</span>
                </div>
              )}
            </div>

            <div className="mb-8 text-center py-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-300">
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                РџСЂРѕС†РµРЅС‚ СѓРЅРёРєР°Р»СЊРЅРѕСЃС‚Рё
              </p>
              <div className={`text-8xl font-black mb-4 ${
                result.originality >= 80 ? 'text-green-600' : 
                result.originality >= 60 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {result.originality.toFixed(2)}%
              </div>
              <div className="w-full max-w-md mx-auto bg-slate-200 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    result.originality >= 80 ? 'bg-green-500' : 
                    result.originality >= 60 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                  style={{ width: `${result.originality}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-200">
                РСЃС‚РѕС‡РЅРёРєРё СЃРѕРІРїР°РґРµРЅРёР№
              </h3>
              {result.sources && result.sources.length > 0 ? (
                <div className="space-y-3">
                  {result.sources.map((source, index) => (
                    <div key={source.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex items-start gap-3">
                        <span className="bg-slate-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline block mb-1"
                          >
                            {source.title || source.url}
                          </a>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="font-mono text-xs bg-slate-200 px-2 py-1 rounded">
                              {source.domain}
                            </span>
                            <span className="text-red-600 font-semibold">
                              РЎРѕРІРїР°РґРµРЅРёР№: {source.match_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                  <p className="text-green-700 font-semibold text-lg">РЎРѕРІРїР°РґРµРЅРёР№ РЅРµ РЅР°Р№РґРµРЅРѕ</p>
                  <p className="text-green-600 text-sm mt-2">РўРµРєСЃС‚ СЏРІР»СЏРµС‚СЃСЏ РїРѕР»РЅРѕСЃС‚СЊСЋ СѓРЅРёРєР°Р»СЊРЅС‹Рј</p>
                </div>
              )}
            </div>

            {result.matches && result.matches.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-200">
                  Р”РµС‚Р°Р»РёР·Р°С†РёСЏ СЃРѕРІРїР°РґРµРЅРёР№
                </h3>
                <div className="space-y-3">
                  {result.matches.slice(0, 20).map((match, index) => (
                    <div key={index} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <span className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-slate-700 leading-relaxed mb-2">
                            &quot;{match.text}&quot;
                          </p>
                          <div className="flex gap-4 text-xs">
                            <span className="bg-red-200 text-red-800 px-2 py-1 rounded font-semibold">
                              РЎС…РѕРґСЃС‚РІРѕ: {(match.similarity * 100).toFixed(0)}%
                            </span>
                            <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded">
                              РўРёРї: {match.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {result.matches.length > 20 && (
                  <p className="text-center text-slate-500 mt-4 text-sm">
                    ... Рё РµС‰Рµ {result.matches.length - 20} СЃРѕРІРїР°РґРµРЅРёР№
                  </p>
                )}
              </div>
            )}

            <div className="mt-12 pt-8 border-t-2 border-slate-200">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-500 mb-1">РЎРїСЂР°РІРєР° СЃРіРµРЅРµСЂРёСЂРѕРІР°РЅР° Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё</p>
                  <p className="text-xs text-slate-400">РќРµ С‚СЂРµР±СѓРµС‚ РїРѕРґРїРёСЃРё Рё РїРµС‡Р°С‚Рё</p>
                </div>
                <div className="text-right">
                  <div className="w-32 h-16 border-b-2 border-slate-300 mb-1"></div>
                  <p className="text-xs text-slate-500">РЎРёСЃС‚РµРјР° ANTIPLAGIAT</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4 justify-center print:hidden">
          <button 
            onClick={() => router.push('/')}
            className="bg-white border-2 border-slate-300 text-slate-700 px-8 py-3 rounded-lg hover:bg-slate-50 transition shadow-md font-semibold"
          >
            РќРѕРІР°СЏ РїСЂРѕРІРµСЂРєР°
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition shadow-md font-semibold"
          >
            РџРµС‡Р°С‚СЊ СЃРїСЂР°РІРєРё
          </button>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center print:hidden">
          <p className="text-sm text-blue-800">
            РЎРїСЂР°РІРєР° РѕС„РѕСЂРјР»РµРЅР° РІ РѕС„РёС†РёР°Р»СЊРЅРѕРј СЃС‚РёР»Рµ Рё РјРѕР¶РµС‚ Р±С‹С‚СЊ СЂР°СЃРїРµС‡Р°С‚Р°РЅР° РґР»СЏ РїСЂРµРґРѕСЃС‚Р°РІР»РµРЅРёСЏ
          </p>
        </div>
      </div>
    </div>
  )
}
