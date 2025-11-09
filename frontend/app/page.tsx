'use client'

import { useState } from 'react'

export default function Home() {
  const [text, setText] = useState('')
  const charCount = text.length
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🔍</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a202c' }}>Antiplagiat</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <a href="#features" style={{ color: '#4a5568', textDecoration: 'none' }}>Возможности</a>
            <a href="#pricing" style={{ color: '#4a5568', textDecoration: 'none' }}>Цены</a>
            <button style={{
              padding: '0.5rem 1.5rem',
              background: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Войти
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '800',
          lineHeight: '1.2',
          marginBottom: '1.5rem',
          color: '#1a202c'
        }}>
          Проверьте текст на уникальность{' '}
          <span style={{ color: '#3182ce' }}>за 30 секунд</span>
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: '#718096',
          marginBottom: '3rem'
        }}>
          AI-powered детекция плагиата с точностью до 94%
        </p>

        {/* Check Box */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          marginBottom: '4rem'
        }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Вставьте текст для проверки (минимум 100 символов)..."
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '1rem',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3182ce'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <div style={{ color: '#718096', fontSize: '0.875rem' }}>
              {charCount} символов • {wordCount} слов
            </div>
            <button
              disabled={charCount < 100}
              style={{
                padding: '1rem 2rem',
                background: charCount < 100 ? '#cbd5e0' : 'linear-gradient(135deg, #3182ce, #2c5282)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: charCount < 100 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                if (charCount >= 100) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(49, 130, 206, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              🚀 Проверить бесплатно
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
            <span>✓ Результат за 30 секунд</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        background: 'white',
        padding: '4rem 2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          {[
            { number: '12,450+', label: 'Проверок выполнено', color: '#3182ce' },
            { number: '94.2%', label: 'Точность детекции', color: '#38a169' },
            { number: '<15 сек', label: 'Среднее время', color: '#805ad5' }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.3s, box-shadow 0.3s'
            }}>
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
            { icon: '📄', title: 'Загрузите текст', desc: 'Скопируйте текст или загрузите документ' },
            { icon: '🔍', title: 'AI-анализ', desc: 'Проверка по миллионам источников' },
            { icon: '📊', title: 'Получите отчёт', desc: 'Подробный отчёт с процентом уникальности' }
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
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              🔍 Antiplagiat
            </div>
            <p style={{ fontSize: '0.875rem' }}>Профессиональная проверка текстов</p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem' }}>Продукт</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <a href="#" style={{ color: '#a0aec0', textDecoration: 'none' }}>Возможности</a>
              <a href="#" style={{ color: '#a0aec0', textDecoration: 'none' }}>Цены</a>
              <a href="/docs" style={{ color: '#a0aec0', textDecoration: 'none' }}>API</a>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem' }}>Поддержка</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <a href="#" style={{ color: '#a0aec0', textDecoration: 'none' }}>Справка</a>
              <a href="#" style={{ color: '#a0aec0', textDecoration: 'none' }}>Документация</a>
              <a href="#" style={{ color: '#a0aec0', textDecoration: 'none' }}>Контакты</a>
            </div>
          </div>
        </div>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '2rem',
          borderTop: '1px solid #2d3748',
          textAlign: 'center',
          fontSize: '0.875rem'
        }}>
          © 2025 Antiplagiat. Powered by AI & TypeScript
        </div>
      </footer>
    </div>
  )
}