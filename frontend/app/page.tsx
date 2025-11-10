'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

export default function Home() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'fast' | 'deep'>('fast')
  const [lang, setLang] = useState<'ru' | 'en' | 'kk'>('ru')
  const [excludeQuotes, setExcludeQuotes] = useState(true)
  const [excludeBibliography, setExcludeBibliography] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const charCount = text.length
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  const handleCheck = async () => {
    setError(null)
    setIsChecking(true)

    try {
      const result = await apiClient.createCheck({
        text,
        mode,
        lang,
        exclude_quotes: excludeQuotes,
        exclude_bibliography: excludeBibliography
      })

      router.push(`/report/${result.task_id}`)
    } catch (err: any) {
      setError(err.message)
      setIsChecking(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #ffffff, #f7fafc)' }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
            <span style={{ fontSize: '2rem' }}>🔍</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a202c' }}>Antiplagiat</span>
            <span style={{ 
              fontSize: '0.75rem', 
              background: '#48bb78', 
              color: 'white', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px',
              marginLeft: '0.5rem'
            }}>
              AI
            </span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <a href="#features" style={{ color: '#4a5568', textDecoration: 'none' }}>Возможности</a>
            <a href="https://antiplagiat-api.onrender.com/docs" target="_blank" style={{ color: '#4a5568', textDecoration: 'none' }}>API</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '800',
          lineHeight: '1.2',
          marginBottom: '1.5rem',
          color: '#1a202c'
        }}>
          Проверьте текст на уникальность{' '}
          <span style={{ color: '#3182ce' }}>с AI</span>
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: '#718096',
          marginBottom: '3rem'
        }}>
          Google Gemini 2.0 • Детекция парафраз • Кросс-языковая проверка
        </p>

        {/* Check Box */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          marginBottom: '4rem',
          textAlign: 'left'
        }}>
          {/* Settings Panel */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            background: '#f7fafc',
            borderRadius: '8px'
          }}>
            {/* Mode Selector */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4a5568', display: 'block', marginBottom: '0.5rem' }}>
                Режим проверки
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setMode('fast')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: mode === 'fast' ? '#3182ce' : 'white',
                    color: mode === 'fast' ? 'white' : '#4a5568',
                    border: `2px solid ${mode === 'fast' ? '#3182ce' : '#e2e8f0'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}
                >
                  ⚡ Fast
                </button>
                <button
                  onClick={() => setMode('deep')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: mode === 'deep' ? '#805ad5' : 'white',
                    color: mode === 'deep' ? 'white' : '#4a5568',
                    border: `2px solid ${mode === 'deep' ? '#805ad5' : '#e2e8f0'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}
                >
                  🤖 Deep AI
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4a5568', display: 'block', marginBottom: '0.5rem' }}>
                Язык текста
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                <option value="ru">🇷🇺 Русский</option>
                <option value="en">🇬🇧 English</option>
                <option value="kk">🇰🇿 Қазақ</option>
              </select>
            </div>

            {/* Exclude Options */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4a5568', display: 'block', marginBottom: '0.5rem' }}>
                Исключения
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={excludeQuotes}
                  onChange={(e) => setExcludeQuotes(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.875rem' }}>Цитаты</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={excludeBibliography}
                  onChange={(e) => setExcludeBibliography(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.875rem' }}>Библиография</span>
              </label>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Вставьте текст для проверки (минимум 100 символов)..."
            disabled={isChecking}
            style={{
              width: '100%',
              minHeight: '250px',
              padding: '1rem',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none'
            }}
          />
          
          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: '#fed7d7',
              color: '#c53030',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}>
              ❌ {error}
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ color: '#718096', fontSize: '0.875rem' }}>
                {charCount.toLocaleString()} символов • {wordCount.toLocaleString()} слов
              </div>
              {mode === 'deep' && (
                <div style={{ color: '#805ad5', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  🤖 AI-анализ с Google Gemini 2.0
                </div>
              )}
            </div>
            <button
              onClick={handleCheck}
              disabled={charCount < 100 || isChecking}
              style={{
                padding: '1rem 2rem',
                background: charCount < 100 || isChecking ? '#cbd5e0' : (mode === 'deep' ? 'linear-gradient(135deg, #805ad5, #6b46c1)' : 'linear-gradient(135deg, #3182ce, #2c5282)'),
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: charCount < 100 || isChecking ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {isChecking ? '⏳ Проверяем...' : `🚀 Проверить (${mode === 'fast' ? '~5 сек' : '~15 сек'})`}
            </button>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '1rem',
            fontSize: '0.875rem',
            color: '#38a169'
          }}>
            <span>✓ Без регистрации</span>
            <span>✓ 3 проверки в день</span>
            {mode === 'deep' && <span>✓ Детекция парафраз</span>}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'white', padding: '4rem 2rem' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          {[
            { number: '12,450+', label: 'Проверок выполнено', color: '#3182ce', icon: '📊' },
            { number: '94.2%', label: 'Точность AI-детекции', color: '#805ad5', icon: '🤖' },
            { number: '<15 сек', label: 'Среднее время', color: '#38a169', icon: '⚡' }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.3s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: stat.color,
                marginBottom: '0.5rem'
              }}>
                {stat.number}
              </div>
              <div style={{ color: '#718096' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 2rem'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          textAlign: 'center',
          marginBottom: '3rem',
          color: '#1a202c'
        }}>
          Как это работает
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {[
            { icon: '📄', title: 'Загрузите текст', desc: 'Вставьте текст или загрузите документ DOCX/PDF' },
            { icon: '🤖', title: 'AI-анализ', desc: 'Google Gemini 2.0 проверяет по миллионам источников и находит парафразы' },
            { icon: '📊', title: 'Получите отчёт', desc: 'Детальный отчёт с % уникальности, источниками и Справкой-PDF' }
          ].map((feature, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#1a202c'
              }}>
                {feature.title}
              </h3>
              <p style={{ color: '#718096', lineHeight: '1.6' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1a202c',
        color: '#a0aec0',
        padding: '3rem 2rem 1rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>🔍</span>
            <span style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginLeft: '0.5rem' }}>Antiplagiat</span>
            <span style={{ 
              fontSize: '0.75rem', 
              background: '#48bb78', 
              color: 'white', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px',
              marginLeft: '0.5rem'
            }}>
              AI-Powered
            </span>
          </div>
          <p style={{ fontSize: '0.875rem' }}>© 2025 Antiplagiat. Powered by Google Gemini 2.0 & TypeScript</p>
        </div>
      </footer>
    </div>
  )
}