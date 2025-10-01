from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import os
from pathlib import Path
import pandas as pd

# === 1. Setup API dan CORS ===
app = FastAPI()

# Tambahkan CORS Middleware untuk mengizinkan frontend mengakses backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Mengizinkan semua domain (untuk pengembangan lokal)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === 2. Global Setup (Model, Tokenizer, Data) ===
# Tentukan BASE_DIR sebagai folder 'backend' tempat api.py berada
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "bert_chatbot_quantized.onnx"
TOKENIZER_DIR = BASE_DIR / "bert_chatbot_tokenizer"
DATASET_PATH = BASE_DIR / "dataset_chatbot_template.xlsx" # Asumsi dataset.xlsx ada di folder backend

try:
    # Memuat tokenizer dari jalur lokal
    tokenizer = AutoTokenizer.from_pretrained(str(TOKENIZER_DIR))
    
    # Memuat model dari jalur lokal
    model = AutoModelForSequenceClassification.from_pretrained(str(MODEL_DIR))
    
    # Memuat dataframe jawaban
    df_jawaban = pd.read_excel(DATASET_PATH)

    # Menentukan perangkat (GPU jika tersedia)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()

except Exception as e:
    print(f"❌ FATAL ERROR: Gagal memuat model, tokenizer, atau dataset: {e}")
    # Kami tidak menggunakan exit() agar Uvicorn bisa berjalan untuk logging
    pass # Biarkan Uvicorn berjalan untuk menampilkan error

# Kamus respons (Responses)
responses = {
    "about_me": "I am a passionate developer specializing in AI and web development.",
    "skills": "My main skills are HTML5, CSS3, JavaScript, Laravel, Node.js, Database, TensorFlow, PyTorch, Firebase, and Jupyter Notebook.",
    "projects": "Some of my projects are Mobile Apps Bald Detection and Jupyter Notebook Bald Detection.",
    "experience": "I have worked as IT Support, AI Engineer, and Freelancer on multiple projects.",
    "career_goal": "My career goal is to become a Full Stack Developer and Machine Learning Engineer.",
    "greeting": "Hello! How can I help you regarding this portfolio?",
    "fallback": "I'm sorry, I don't understand. Please ask another question."
}

# Input schema
class ChatRequest(BaseModel):
    text: str

# === 3. API Endpoint ===
@app.post("/chatbot")
async def chat(req: ChatRequest):
    """Menerima pesan dari frontend, memprediksi intent, dan mengembalikan respons."""
    
    # Jika model gagal dimuat saat startup
    if 'model' not in globals():
        return {"response": responses["fallback"], "intent": "error_loading"}

    user_input = req.text
    
    try:
        # Tokenisasi dan Inferensi
        inputs = tokenizer(user_input, return_tensors="pt", padding=True, truncation=True, max_length=128).to(device)

        with torch.no_grad():
            outputs = model(**inputs)
            pred_id = torch.argmax(outputs.logits, dim=1).item()

        # Mapping intent (Ambil dari konfigurasi model)
        intent = model.config.id2label.get(pred_id, "fallback")
        
        # Ambil jawaban dari DataFrame atau gunakan respons default
        try:
            # Menggunakan loc untuk mencari baris di DataFrame
            jawaban = df_jawaban.loc[df_jawaban['Intent'] == intent, 'Jawaban_ID'].iloc[0]
        except IndexError:
            # Jika intent tidak ada di DataFrame, gunakan kamus responses
            jawaban = responses.get(intent, responses["fallback"])

        return {"intent": intent, "response": jawaban}

    except Exception as e:
        print(f"❌ Runtime Error during inference: {e}")
        return {"response": "Internal server error during processing."}

# === 4. Cara Menjalankan Server ===
# Jalankan dari terminal di folder 'backend' dengan: uvicorn api:app --reload