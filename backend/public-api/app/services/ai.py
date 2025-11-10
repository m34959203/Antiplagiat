"""
AI Service - OpenRouter Integration
Reads API key from environment variables
"""
import aiohttp
import json
from typing import List, Dict
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class OpenRouterAI:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.AI_BASE_URL
        self.model = settings.AI_MODEL
        self.timeout = settings.AI_TIMEOUT
        self.max_retries = settings.AI_MAX_RETRIES
        
        if not self.api_key:
            logger.warning("⚠️  OPENROUTER_API_KEY not set!")
        else:
            logger.info(f"✓ AI Service initialized with model: {self.model}")
        
    async def detect_paraphrase(self, text1: str, text2: str) -> Dict:
        """
        Определить, является ли text2 парафразом text1
        """
        if not self.api_key:
            return {"is_paraphrase": False, "similarity": 0.0, "explanation": "API key not configured"}
        
        prompt = f"""Сравни два текста и определи, является ли второй текст парафразом первого.

Текст 1: {text1}

Текст 2: {text2}

Ответь в формате JSON:
{{
  "is_paraphrase": true/false,
  "similarity": 0.0-1.0,
  "explanation": "краткое объяснение"
}}"""

        for attempt in range(self.max_retries):
            try:
                timeout = aiohttp.ClientTimeout(total=self.timeout)
                async with aiohttp.ClientSession(timeout=timeout) as session:
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
                            "max_tokens": 500
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
                                return result
                            except:
                                return {
                                    "is_paraphrase": "парафраз" in content.lower(),
                                    "similarity": 0.7 if "похож" in content.lower() else 0.3,
                                    "explanation": content
                                }
                        else:
                            logger.error(f"OpenRouter error: {response.status}")
                            if attempt < self.max_retries - 1:
                                continue
            except Exception as e:
                logger.error(f"AI detection error (attempt {attempt+1}): {e}")
                if attempt < self.max_retries - 1:
                    continue
        
        return {"is_paraphrase": False, "similarity": 0.0, "explanation": "API unavailable"}
    
    async def extract_key_ideas(self, text: str) -> List[str]:
        """
        Извлечь ключевые идеи
        """
        if not self.api_key:
            return []
        
        prompt = f"""Извлеки 5-7 ключевых идей из текста. Каждая идея - одно предложение.

Текст: {text}

Ответь в JSON: {{"key_ideas": ["идея 1", "идея 2", ...]}}"""

        try:
            timeout = aiohttp.ClientTimeout(total=self.timeout)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
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
                            result = json.loads(content[start:end])
                            return result.get("key_ideas", [])
                        except:
                            return []
        except Exception as e:
            logger.error(f"Key ideas error: {e}")
        
        return []

# Singleton
ai_service = OpenRouterAI()