export function setupChatbot() {
    const chatbotBubble = document.getElementById("chatbot-bubble");
    const chatbotWindow = document.getElementById("chatbot-window");
    const closeChatbot = document.getElementById("close-chatbot");
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const chatSendBtn = document.getElementById("chat-send-btn");

    function displayMessage(sender, message, type) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add(type);
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function getBotResponse(input) {
        try {
            const res = await fetch("http://127.0.0.1:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: input })
            });
            const data = await res.json();
            displayMessage("Bot", data.response, "bot-message");
        } catch (error) {
            console.error(error);
            displayMessage("Bot", "Server error.", "bot-message");
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
