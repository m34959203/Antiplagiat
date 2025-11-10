"""
AI Service - OpenRouter Integration
Google Gemini 2.0 Flash для семантического анализа
"""
import aiohttp
import json
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class OpenRouterAI:
    def __init__(self):
        self.api_key = "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"
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.model = "google/gemini-2.0-flash-exp:free"
        
    async def detect_paraphrase(self, text1: str, text2: str) -> Dict:
        """
        Определить, является ли text2 парафразом text1
        """
        prompt = f"""Сравни два текста и определи, является ли второй текст парафразом первого.

Текст 1: {text1}

Текст 2: {text2}

Ответь в формате JSON:
{{
  "is_paraphrase": true/false,
  "similarity": 0.0-1.0,
  "explanation": "краткое объяснение"
}}"""

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://antiplagiat-api.onrender.com",
                        "X-Title": "Antiplagiat AI Detection"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.3,
                        "max_tokens": 500
                    }
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        content = data["choices"][0]["message"]["content"]
                        
                        # Извлечь JSON из ответа
                        try:
                            # Найти JSON в ответе
                            start = content.find("{")
                            end = content.rfind("}") + 1
                            json_str = content[start:end]
                            result = json.loads(json_str)
                            return result
                        except:
                            # Fallback
                            return {
                                "is_paraphrase": "парафраз" in content.lower() or "похож" in content.lower(),
                                "similarity": 0.7 if "похож" in content.lower() else 0.3,
                                "explanation": content
                            }
                    else:
                        logger.error(f"OpenRouter error: {response.status}")
                        return {"is_paraphrase": False, "similarity": 0.0, "explanation": "API error"}
        except Exception as e:
            logger.error(f"AI detection error: {e}")
            return {"is_paraphrase": False, "similarity": 0.0, "explanation": str(e)}
    
    async def extract_key_ideas(self, text: str) -> List[str]:
        """
        Извлечь ключевые идеи из текста для семантического сравнения
        """
        prompt = f"""Извлеки 5-7 ключевых идей из следующего текста. Каждая идея - одно предложение.

Текст: {text}

Ответь списком в формате JSON:
{{
  "key_ideas": ["идея 1", "идея 2", ...]
}}"""

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://antiplagiat-api.onrender.com",
                        "X-Title": "Antiplagiat AI Detection"
                    },
                    json={
                        "model": self.model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.3,
                        "max_tokens": 800
                    }
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        content = data["choices"][0]["message"]["content"]
                        
                        try:
                            start = content.find("{")
                            end = content.rfind("}") + 1
                            json_str = content[start:end]
                            result = json.loads(json_str)
                            return result.get("key_ideas", [])
                        except:
                            return []
                    return []
        except Exception as e:
            logger.error(f"Key ideas extraction error: {e}")
            return []
    
    async def translate_and_compare(self, text_ru: str, text_en: str) -> Dict:
        """
        Кросс-языковое сравнение (RU <-> EN)
        """
        prompt = f"""Compare these two texts (one in Russian, one in English) and determine if they have the same meaning.

Russian text: {text_ru}

English text: {text_en}

Response in JSON format:
{{
  "same_meaning": true/false,
  "similarity": 0.0-1.0,
  "explanation": "brief explanation"
}}"""

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.3
                    }
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        content = data["choices"][0]["message"]["content"]
                        
                        try:
                            start = content.find("{")
                            end = content.rfind("}") + 1
                            result = json.loads(content[start:end])
                            return result
                        except:
                            return {"same_meaning": False, "similarity": 0.0}
                    return {"same_meaning": False, "similarity": 0.0}
        except Exception as e:
            logger.error(f"Translation compare error: {e}")
            return {"same_meaning": False, "similarity": 0.0}

# Singleton
ai_service = OpenRouterAI()