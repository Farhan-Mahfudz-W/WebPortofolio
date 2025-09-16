import streamlit as st
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import os

# Fungsi untuk memuat model dan tokenizer.
@st.cache_resource
def load_model():
    # Menggunakan os.path.join untuk membuat jalur yang benar dan aman.
    # getcwd() mendapatkan direktori kerja saat ini.
    model_path = os.path.join(os.getcwd(), "models")
    tokenizer_path = os.path.join(os.getcwd(), "models", "bert-base-multilingual-cased")

    # Memuat tokenizer dari jalur lokal.
    tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)
    
    # Memuat model dari jalur lokal.
    # Ini akan mencari file seperti config.json, pytorch_model.bin, dll. di dalam folder 'models'.
    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    
    return tokenizer, model

# Fungsi untuk memuat dataframe jawaban.
@st.cache_data
def load_responses():
    file_path = "dataset_chatbot_template.xlsx"
    df = pd.read_excel(file_path)
    return df

# Memuat model, tokenizer, dan dataframe jawaban.
try:
    tokenizer, model = load_model()
    df_jawaban = load_responses()
except Exception as e:
    st.error(f"Gagal memuat model atau tokenizer: {e}")
    st.stop()

# Judul aplikasi Streamlit.
st.title("Chat with Zo Bot")

# Inisialisasi riwayat chat.
if "messages" not in st.session_state:
    st.session_state.messages = []

# Menampilkan pesan dari riwayat chat.
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Tanggapi input dari pengguna.
if prompt := st.chat_input("Apa yang bisa saya bantu?"):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # --- Bagian Inferensi ---
    # Tokenisasi input pengguna
    inputs = tokenizer(prompt, return_tensors="pt")

    # Jalankan inferensi
    with torch.no_grad():
        outputs = model(**inputs)

    # Dapatkan prediksi intent (argmax)
    logits = outputs.logits
    predicted_id = torch.argmax(logits, dim=1).item()
    
    # Ambil pemetaan dari model
    id2label = model.config.id2label
    intent_pred = id2label[predicted_id]

    # Ambil jawaban yang sesuai dari dataframe.
    try:
        jawaban = df_jawaban.loc[df_jawaban['Intent'] == intent_pred, 'Jawaban_ID'].iloc[0]
    except IndexError:
        jawaban = "Maaf, saya tidak mengerti. Silakan tanyakan hal lain."
        
    # Tampilkan respons bot.
    with st.chat_message("assistant"):
        st.markdown(jawaban)
    st.session_state.messages.append({"role": "assistant", "content": jawaban})