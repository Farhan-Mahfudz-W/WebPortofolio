import os
from fastapi import FastAPI, Request
from pydantic import BaseModel
from transformers import BertTokenizerFast, BertForSequenceClassification
import torch
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

# === Setup API ===
app = FastAPI()

# Tambahkan CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load tokenizer and model from the correct directories ---
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "bert-base-multilingual-cased"
TOKENIZER_PATH = BASE_DIR / "models" / "bert-base-multilingual-cased"
try:
    # Memuat tokenizer and model dari direktori yang disimpan
    tokenizer = BertTokenizerFast.from_pretrained(str(TOKENIZER_PATH))
    model = BertForSequenceClassification.from_pretrained(str(MODEL_PATH))
    print("✅ Model & tokenizer berhasil dimuat dari direktori lokal!")
except Exception as e:
    print(f"❌ Error saat memuat model: {e}")
    print("Pastikan Anda sudah menjalankan skrip pelatihan dan model telah disimpan ke ./bert_chatbot_model")
    exit()

# GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()

# --- Response dictionary (must match intents in your dataset) ---
responses = {
    "about_me": "I am a passionate developer specializing in AI and web development.",
    "skills": "My main skills are HTML5, CSS3, JavaScript, Laravel, Node.js, Database, TensorFlow, PyTorch, Firebase, and Jupyter Notebook.",
    "projects": "Some of my projects are Mobile Apps Bald Detection and Jupyter Notebook Bald Detection.",
    "experience": "I have worked as IT Support, AI Engineer, and Freelancer on multiple projects.",
    "career_goal": "My career goal is to become a Full Stack Developer and Machine Learning Engineer.",
    "greeting": "Hello! How can I help you regarding this portfolio?",
    "fallback": "I'm sorry, I don't understand. Please ask another question."
}

# --- Input schema ---
class ChatRequest(BaseModel):
    text: str

@app.post("/chat")
async def chat(req: ChatRequest):
    print(f"Received text: {req.text}")
    inputs = tokenizer(req.text, return_tensors="pt", padding=True, truncation=True, max_length=128).to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        pred_id = torch.argmax(outputs.logits, dim=1).item()

    print(f"Predicted ID: {pred_id}")
    
    # Retrieve intent from the model's saved id2label mapping
    intent = model.config.id2label.get(pred_id, "fallback")
    response = responses.get(intent, responses["fallback"])

    print(f"Intent: {intent}, Response: {response}")

    return {"intent": intent, "response": response}