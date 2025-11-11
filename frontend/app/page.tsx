'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (text.trim().length < 100) {
      setError('РњРёРЅРёРјР°Р»СЊРЅР°СЏ РґР»РёРЅР° С‚РµРєСЃС‚Р°: 100 СЃРёРјРІРѕР»РѕРІ')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/v1/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          mode: 'deep',
          lang: 'auto',
          exclude_quotes: true,
          exclude_bibliography: false
        }),
      })

      if (!response.ok) {
        throw new Error(`РћС€РёР±РєР° СЃРµСЂРІРµСЂР°: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.task_id) {
        router.push(`/report/${data.task_id}`)
      } else {
        throw new Error('РќРµ РїРѕР»СѓС‡РµРЅ ID РїСЂРѕРІРµСЂРєРё')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'РќРµРёР·РІРµСЃС‚РЅР°СЏ РѕС€РёР±РєР°')
    } finally {
      setLoading(false)
    }
  }

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length
  const charCount = text.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">ANTIPLAGIAT</h1>
                <p className="text-sm text-slate-500">РџСЂРѕРІРµСЂРєР° СѓРЅРёРєР°Р»СЊРЅРѕСЃС‚Рё С‚РµРєСЃС‚Р°</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Powered by</p>
              <p className="text-sm font-semibold text-slate-600">Google AI & Custom Search</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">i</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  РџСЂРѕРІРµСЂРєР° СЃ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµРј РёСЃРєСѓСЃСЃС‚РІРµРЅРЅРѕРіРѕ РёРЅС‚РµР»Р»РµРєС‚Р°
                </p>
                <p className="text-xs text-slate-500">
                  РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРѕРµ РѕРїСЂРµРґРµР»РµРЅРёРµ СЏР·С‹РєР° вЂў Р“Р»СѓР±РѕРєРёР№ Р°РЅР°Р»РёР· вЂў РџРѕРёСЃРє РІ СЂРµР°Р»СЊРЅС‹С… РёСЃС‚РѕС‡РЅРёРєР°С…
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                РўРµРєСЃС‚ РґР»СЏ РїСЂРѕРІРµСЂРєРё
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-96 px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none font-mono text-sm"
                placeholder="Р’СЃС‚Р°РІСЊС‚Рµ РёР»Рё РІРІРµРґРёС‚Рµ С‚РµРєСЃС‚ РґР»СЏ РїСЂРѕРІРµСЂРєРё РЅР° СѓРЅРёРєР°Р»СЊРЅРѕСЃС‚СЊ...

РњРёРЅРёРјР°Р»СЊРЅР°СЏ РґР»РёРЅР°: 100 СЃРёРјРІРѕР»РѕРІ
РЇР·С‹Рє РѕРїСЂРµРґРµР»СЏРµС‚СЃСЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё"
                disabled={loading}
              />
              
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="flex gap-6">
                  <span className={`${charCount >= 100 ? 'text-green-600' : 'text-slate-400'} font-medium`}>
                    РЎРёРјРІРѕР»РѕРІ: {charCount}
                  </span>
                  <span className="text-slate-600">
                    РЎР»РѕРІ: {wordCount}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {charCount < 100 ? `РћСЃС‚Р°Р»РѕСЃСЊ: ${100 - charCount} СЃРёРјРІРѕР»РѕРІ` : 'Р“РѕС‚РѕРІРѕ Рє РїСЂРѕРІРµСЂРєРµ'}
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <span className="text-red-500 text-xl">!</span>
                <div>
                  <p className="text-sm font-semibold text-red-800">РћС€РёР±РєР°</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || text.trim().length < 100}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>РџСЂРѕРІРµСЂРєР° С‚РµРєСЃС‚Р°...</span>
                </>
              ) : (
                <>
                  <span>РџСЂРѕРІРµСЂРёС‚СЊ С‚РµРєСЃС‚</span>
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-slate-400">
              РџСЂРѕРІРµСЂРєР° Р·Р°Р№РјС‘С‚ 10-20 СЃРµРєСѓРЅРґ РІ Р·Р°РІРёСЃРёРјРѕСЃС‚Рё РѕС‚ РѕР±СЉРµРјР° С‚РµРєСЃС‚Р°
            </p>
          </form>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">AI</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">AI-С‚РµС…РЅРѕР»РѕРіРёСЏ</h3>
            <p className="text-sm text-slate-600">
              РСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ Google Gemini 2.0 РґР»СЏ РіР»СѓР±РѕРєРѕРіРѕ Р°РЅР°Р»РёР·Р° Рё РїРѕРёСЃРєР° СЃРµРјР°РЅС‚РёС‡РµСЃРєРёС… СЃРѕРІРїР°РґРµРЅРёР№
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">WEB</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Р РµР°Р»СЊРЅС‹Рµ РёСЃС‚РѕС‡РЅРёРєРё</h3>
            <p className="text-sm text-slate-600">
              РџРѕРёСЃРє СЃРѕРІРїР°РґРµРЅРёР№ РІ РёРЅРґРµРєСЃРµ Google СЃ РјРёР»Р»РёР°СЂРґР°РјРё РІРµР±-СЃС‚СЂР°РЅРёС† Рё РґРѕРєСѓРјРµРЅС‚РѕРІ
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">DOC</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Р”РµС‚Р°Р»СЊРЅС‹Р№ РѕС‚С‡РµС‚</h3>
            <p className="text-sm text-slate-600">
              РџРѕРґСЂРѕР±РЅР°СЏ СЃРїСЂР°РІРєР° СЃ РїСЂРѕС†РµРЅС‚РѕРј СѓРЅРёРєР°Р»СЊРЅРѕСЃС‚Рё, РёСЃС‚РѕС‡РЅРёРєР°РјРё Рё РІС‹РґРµР»РµРЅРЅС‹РјРё СЃРѕРІРїР°РґРµРЅРёСЏРјРё
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-400">
            2025 Antiplagiat. Р’СЃРµ РїСЂР°РІР° Р·Р°С‰РёС‰РµРЅС‹.
          </p>
        </div>
      </footer>
    </div>
  )
}
