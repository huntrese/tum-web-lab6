from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deep_translator import GoogleTranslator
from pypinyin import lazy_pinyin
from functools import lru_cache
import asyncio

app = FastAPI()

# Allow specific frontend origin (Vite default)
origins = [
    "http://localhost:5173",  # Vite
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # Explicitly allow Vite dev server
    allow_credentials=True,
    allow_methods=["*"],             # Allow all HTTP methods (POST, GET, etc.)
    allow_headers=["*"],             # Allow all headers (especially Content-Type)
)


# Pydantic model
class TextInput(BaseModel):
    text: str

# Global translator instance
translator = GoogleTranslator(source='zh-CN', target='en')

# Cached translation function
@lru_cache(maxsize=1000)
def cached_translate(text: str) -> str:
    return translator.translate(text)

@app.post("/translate")
async def translate_text(data: TextInput):
    text = data.text.strip()
    if not text:
        return {"error": "No text provided"}

    loop = asyncio.get_event_loop()
    translated = await loop.run_in_executor(None, cached_translate, text)

    return {
        "original": text,
        "translation": translated
    }

@app.post("/pinyin")
async def get_pinyin(data: TextInput):
    text = data.text.strip()
    if not text:
        return {"error": "No text provided"}

    # Pinyin conversion is fast and sync
    pinyin = ' '.join(lazy_pinyin(text))

    return {
        "original": text,
        "pinyin": pinyin
    }
