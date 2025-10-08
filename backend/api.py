from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import pandas as pd
from pathlib import Path

# === 1. Setup API dan CORS ===
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === 2. Global Setup (Model, Tokenizer, Data) ===
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "bert_chatbot_model"   # folder, bukan .onnx
DATASET_PATH = BASE_DIR / "dataset_chatbot_template.xlsx"

try:
    tokenizer = AutoTokenizer.from_pretrained(str(MODEL_DIR))
    model = AutoModelForSequenceClassification.from_pretrained(str(MODEL_DIR))
    df_jawaban = pd.read_excel(DATASET_PATH)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()
except Exception as e:
    print(f"❌ FATAL ERROR: {e}")

responses = {
    "about_me": "I am a passionate developer specializing in AI and web development.",
    "skills": "My main skills are HTML5, CSS3, JavaScript, Laravel, Node.js, Database, TensorFlow, PyTorch, Firebase, and Jupyter Notebook.",
    "projects": "Some of my projects are Mobile Apps Bald Detection and Jupyter Notebook Bald Detection.",
    "experience": "I have worked as IT Support, AI Engineer, and Freelancer on multiple projects.",
    "career_goal": "My career goal is to become a Full Stack Developer and Machine Learning Engineer.",
    "greeting": "Hello! How can I help you regarding this portfolio?",
    "fallback": "I'm sorry, I don't understand. Please ask another question."
}

class ChatRequest(BaseModel):
    text: str

@app.get("/")
async def root():
    return {"message": "🚀 Chatbot API running on Hugging Face"}

@app.post("/chatbot")
async def chat(req: ChatRequest):
    if 'model' not in globals():
        return {"response": responses["fallback"], "intent": "error_loading"}

    try:
        inputs = tokenizer(req.text, return_tensors="pt", padding=True, truncation=True, max_length=128).to(device)
        with torch.no_grad():
            outputs = model(**inputs)
            pred_id = torch.argmax(outputs.logits, dim=1).item()

        intent = model.config.id2label.get(pred_id, "fallback")

        try:
            jawaban = df_jawaban.loc[df_jawaban['Intent'] == intent, 'Jawaban_ID'].iloc[0]
        except IndexError:
            jawaban = responses.get(intent, responses["fallback"])

        return {"intent": intent, "response": jawaban}

    except Exception as e:
        print(f"❌ Runtime Error: {e}")
        return {"response": "Internal server error"}
