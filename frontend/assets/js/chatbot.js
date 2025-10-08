export function setupChatbot() {
    // === Elemen utama chatbot ===
    const chatbotBubble = document.getElementById("chatbot-bubble");
    const chatbotWindow = document.getElementById("chatbot-window");
    const closeChatbot = document.getElementById("close-chatbot");
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const chatSendBtn = document.getElementById("chat-send-btn");

    // ✅ URL backend Hugging Face (ganti sesuai nama Space kamu)
    const API_URL = "https://famazo-chatbot.hf.space/chatbot";

    // === Fungsi untuk menampilkan pesan ===
    function displayMessage(sender, message, type) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add(type);
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // === Fungsi untuk memproses input user dan mendapatkan balasan dari backend ===
    async function getBotResponse(input) {
        // tampilkan pesan "Thinking..." sementara menunggu respons
        displayMessage("Bot", "⏳ Thinking...", "bot-message");

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: input })
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const data = await res.json();

            // hapus pesan "Thinking..."
            chatMessages.lastChild.remove();

            // tampilkan jawaban dari backend (data.reply)
            displayMessage("Bot", data.reply || "⚠️ No reply from server.", "bot-message");

        } catch (error) {
            console.error("Fetch error:", error);
            chatMessages.lastChild.remove();
            displayMessage("Bot", "⚠️ Server error, coba lagi nanti.", "bot-message");
        }
    }

    // === Fungsi untuk mengirim pesan ===
    function handleSendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            displayMessage("You", message, "user-message");
            chatInput.value = "";
            getBotResponse(message);
        }
    }

    // === Event Listener ===
    chatSendBtn.addEventListener("click", handleSendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSendMessage();
    });

    chatbotBubble.addEventListener("click", () => {
        chatbotWindow.classList.toggle("open");
    });

    closeChatbot.addEventListener("click", () => {
        chatbotWindow.classList.remove("open");
    });
}
