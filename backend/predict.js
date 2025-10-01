import * as ort from "onnxruntime-node";
import { Tokenizer } from "@huggingface/tokenizers";
import path from "path";
import fs from "fs";

let session;
let tokenizer;

async function init() {
  if (!session) {
    const modelPath = path.resolve("backend/models/bert_chatbot_quantized.onnx");
    const tokenizerPath = path.resolve("backend/models/bert-base-multilingual-cased/tokenizer.json");

    // pastikan file ada
    if (!fs.existsSync(modelPath)) throw new Error("Model tidak ditemukan!");
    if (!fs.existsSync(tokenizerPath)) throw new Error("Tokenizer tidak ditemukan!");

    session = await ort.InferenceSession.create(modelPath);
    tokenizer = await Tokenizer.fromFile(tokenizerPath);

    console.log("✅ Model & tokenizer berhasil dimuat");
  }
  return { session, tokenizer };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const { session, tokenizer } = await init();

    // Tokenisasi input teks
    const encoded = tokenizer.encode(text);
    const input_ids = BigInt64Array.from(encoded.ids.map(x => BigInt(x)));
    const attention_mask = BigInt64Array.from(encoded.attentionMask.map(x => BigInt(x)));

    // Bentuk tensor untuk ONNX Runtime
    const feeds = {
      input_ids: new ort.Tensor("int64", input_ids, [1, input_ids.length]),
      attention_mask: new ort.Tensor("int64", attention_mask, [1, attention_mask.length]),
    };

    // Jalankan inferensi
    const results = await session.run(feeds);
    const logits = results.logits.data;

    // 🚀 TODO: mapping logits → intent → jawaban
    // untuk sekarang balikin logits mentah
    res.status(200).json({
      reply: `Prediksi berhasil ✅ (logit pertama: ${logits[0]})`
    });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Inference failed", detail: err.message });
  }
}
