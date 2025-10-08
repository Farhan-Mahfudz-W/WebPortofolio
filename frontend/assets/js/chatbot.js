export function setupChatbot() {
    const chatbotBubble = document.getElementById("chatbot-bubble");
    const chatbotWindow = document.getElementById("chatbot-window");
    const closeChatbot = document.getElementById("close-chatbot");
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const chatSendBtn = document.getElementById("chat-send-btn");

    // ✅ Ganti dengan URL backend kamu di Vercel
    const API_URL = "https://famazo-chatbot.hf.space/chatbot";

    function displayMessage(sender, message, type) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add(type);
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function getBotResponse(input) {
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: input })
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const data = await res.json();
            // asumsi backend balikan { reply: "...pesan..." }
            displayMessage("Bot", data.reply, "bot-message");
        } catch (error) {
            console.error(error);
            displayMessage("Bot", "⚠️ Server error, coba lagi nanti.", "bot-message");
        }
    }

    function handleSendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            displayMessage("You", message, "user-message");
            chatInput.value = "";
            getBotResponse(message);
        }
    }

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
