"""
Advanced Plagiarism Detection (FREE)
Комбинация: Local algorithms + Google Search API
"""
import re
import hashlib
from typing import List, Dict, Tuple, Optional
from collections import Counter
import os

class AdvancedPlagiarismDetector:
    """
    Бесплатный детектор плагиата
    """
    
    def __init__(self):
        self.google_api_key = os.getenv("GOOGLE_SEARCH_API_KEY", "")
        self.google_cx = os.getenv("GOOGLE_SEARCH_CX", "")
        
    def analyze(self, text: str, use_google: bool = False) -> Dict:
        """Главный метод анализа"""
        
        # Разбиваем на предложения
        sentences = self._split_sentences(text)
        
        # N-gram анализ (локально, бесплатно)
        ngram_score = self._ngram_analysis(text)
        
        # Fingerprinting (локально, бесплатно)
        fingerprint_score = self._fingerprint_analysis(sentences)
        
        # Эвристики (бесплатно)
        heuristic_score = self._heuristic_analysis(text)
        
        # Комбинированная оценка
        local_suspicion = (ngram_score + fingerprint_score + heuristic_score) / 3
        
        matches = []
        sources = []
        
        # Если подозрительно И разрешен Google - проверяем в интернете
        if local_suspicion > 0.4 and use_google and self.google_api_key:
            google_results = self._google_search_check(sentences[:3])  # Только 3 предложения
            matches.extend(google_results['matches'])
            sources.extend(google_results['sources'])
        
        # Рассчитываем финальную оригинальность
        if matches:
            total_chars = len(text)
            matched_chars = sum(len(m['text']) for m in matches)
            originality = max(0, 100 - (matched_chars / total_chars * 100))
        else:
            # Если Google не использовали, оцениваем локально
            originality = max(0, 100 - (local_suspicion * 50))
        
        return {
            'originality': round(originality, 2),
            'matches': matches,
            'sources': sources,
            'local_suspicion': round(local_suspicion, 2),
            'google_used': use_google and bool(self.google_api_key)
        }
    
    def _split_sentences(self, text: str) -> List[str]:
        """Разбивка на предложения"""
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if len(s.strip()) > 30]
    
    def _ngram_analysis(self, text: str, n: int = 5) -> float:
        """
        N-gram анализ
        Находит повторяющиеся фрагменты (признак копипасты)
        """
        words = text.lower().split()
        if len(words) < n:
            return 0.0
        
        ngrams = [' '.join(words[i:i+n]) for i in range(len(words) - n + 1)]
        ngram_counts = Counter(ngrams)
        
        # Если много повторяющихся n-грамм - подозрительно
        repeated = sum(1 for count in ngram_counts.values() if count > 1)
        suspicion = min(repeated / len(ngrams), 1.0)
        
        return suspicion
    
    def _fingerprint_analysis(self, sentences: List[str]) -> float:
        """
        Fingerprinting
        Создает хэши предложений и ищет паттерны
        """
        if not sentences:
            return 0.0
        
        # Создаем хэши предложений
        fingerprints = []
        for sent in sentences:
            # Убираем стоп-слова и создаем хэш
            words = [w for w in sent.lower().split() if len(w) > 3]
            if words:
                fp = hashlib.md5(' '.join(sorted(words)).encode()).hexdigest()
                fingerprints.append(fp)
        
        # Проверяем уникальность хэшей
        unique_ratio = len(set(fingerprints)) / len(fingerprints)
        
        # Если мало уникальных - подозрительно
        return 1.0 - unique_ratio
    
    def _heuristic_analysis(self, text: str) -> float:
        """
        Эвристический анализ
        Проверяет паттерны, характерные для копипасты
        """
        scores = []
        
        # 1. Длина предложений (копипаста часто имеет однородные предложения)
        sentences = self._split_sentences(text)
        if sentences:
            lengths = [len(s.split()) for s in sentences]
            avg_len = sum(lengths) / len(lengths)
            variance = sum((l - avg_len) ** 2 for l in lengths) / len(lengths)
            
            # Малая вариативность = подозрительно
            if variance < 20:
                scores.append(0.6)
            else:
                scores.append(0.2)
        
        # 2. Словарное разнообразие
        words = text.lower().split()
        unique_words = len(set(words))
        lexical_diversity = unique_words / len(words) if words else 0
        
        # Слишком высокое разнообразие может быть признаком AI/копипасты
        if lexical_diversity > 0.7:
            scores.append(0.5)
        else:
            scores.append(0.2)
        
        # 3. Стоп-слова (копипаста часто имеет много стоп-слов)
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                      'и', 'в', 'на', 'с', 'по', 'для', 'что', 'как', 'это', 'все'}
        
        stop_word_count = sum(1 for w in words if w.lower() in stop_words)
        stop_word_ratio = stop_word_count / len(words) if words else 0
        
        if stop_word_ratio > 0.3:
            scores.append(0.4)
        else:
            scores.append(0.1)
        
        return sum(scores) / len(scores) if scores else 0.0
    
    def _google_search_check(self, sentences: List[str]) -> Dict:
        """
        Google Search проверка (только для подозрительных случаев)
        БЕСПЛАТНО: 100 запросов/день
        """
        if not self.google_api_key or not sentences:
            return {'matches': [], 'sources': []}
        
        import httpx
        
        matches = []
        sources_dict = {}
        
        # Проверяем только первые 3 предложения (экономим API)
        for i, sentence in enumerate(sentences[:3]):
            if len(sentence) < 50:
                continue
            
            # Google Custom Search API
            url = "https://www.googleapis.com/customsearch/v1"
            params = {
                'key': self.google_api_key,
                'cx': self.google_cx,
                'q': f'"{sentence[:200]}"',  # Точное совпадение
                'num': 3  # Только 3 результата
            }
            
            try:
                response = httpx.get(url, params=params, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    
                    if 'items' in data:
                        for item in data['items']:
                            # Нашли совпадение!
                            matches.append({
                                'start': 0,
                                'end': len(sentence),
                                'text': sentence,
                                'source_id': hash(item['link']) % 10000,
                                'similarity': 0.95,  # Точное совпадение
                                'type': 'google_exact'
                            })
                            
                            # Добавляем источник
                            source_id = hash(item['link']) % 10000
                            if source_id not in sources_dict:
                                sources_dict[source_id] = {
                                    'id': source_id,
                                    'title': item.get('title', 'Unknown'),
                                    'url': item.get('link', ''),
                                    'domain': item.get('displayLink', ''),
                                    'match_count': 0
                                }
                            sources_dict[source_id]['match_count'] += 1
                        
                        break  # Нашли - хватит проверять
            
            except Exception as e:
                print(f"Google Search error: {e}")
        
        return {
            'matches': matches,
            'sources': list(sources_dict.values())
        }

# Singleton
detector = AdvancedPlagiarismDetector()