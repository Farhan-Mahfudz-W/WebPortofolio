document.addEventListener("DOMContentLoaded", function () {
    // Typewriter effect
    const typewriterElement = document.getElementById("typewriter-text");
    const phrases = [
        "AI Engineer.",
        "IT Support.",
        "Prompt Engineer.",
        "A Freelancer.",
        "I can code!",
        "Full Stack Developer.",
        "Machine Learning Engineer"

    ];
    let phraseIndex = 0;
    let charIndex = 0;

    function type() {
        if (charIndex < phrases[phraseIndex].length) {
            typewriterElement.textContent += phrases[phraseIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, 100);
        } else {
            setTimeout(erase, 1500);
        }
    }

    function erase() {
        if (charIndex > 0) {
            typewriterElement.textContent = phrases[phraseIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, 50);
        } else {
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(type, 500);
        }
    }
    type();

    // Fade-in animation on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".fade-in").forEach(element => {
        observer.observe(element);
    });

    // Toggle mobile menu
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    mobileMenuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
    });

    // Chatbot logic with ONNX Runtime Web
    const chatbotBubble = document.getElementById("chatbot-bubble");
    const chatbotWindow = document.getElementById("chatbot-window");
    const closeChatbot = document.getElementById("close-chatbot");
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const chatSendBtn = document.getElementById("chat-send-btn");

    let session = null;
    let isLoading = false;
    
    // Memuat model ONNX saat halaman dimuat
    const loadONNXModel = async () => {
        // Mencegah pemuatan berulang
        if (session || isLoading) {
            return;
        }

        isLoading = true;
        displayMessage("Bot", "Loading model... This might take a while.", "bot-message");

        try {
            // Perbaikan: Ubah path menjadi relatif
            session = await ort.InferenceSession.create("./bert_chatbot.onnx");
            console.log("✅ ONNX model loaded successfully.");
            displayMessage("Bot", "Model loaded! You can start chatting now.", "bot-message");
        } catch (e) {
            console.error("❌ Failed to load ONNX model:", e);
            displayMessage("Bot", `Sorry, the chatbot model failed to load. Please try again later. Error: ${e.message}`, "bot-message");
        } finally {
            isLoading = false;
        }
    };
    
    // Perbaikan: Memuat model saat gelembung diklik
    chatbotBubble.addEventListener("click", async () => {
        chatbotWindow.classList.toggle("open");
        if (chatbotWindow.classList.contains("open") && !session && !isLoading) {
            await loadONNXModel();
        }
    });

    // Display messages in the chat window
    const displayMessage = (sender, message, type) => {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add(type);
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // Get response from the ONNX model
    const getBotResponse = async (input) => {
        if (!session) {
            displayMessage("Bot", "Model is not ready yet. Please wait a moment.", "bot-message");
            return;
        }
        
        try {
            // 👉 TODO: ganti placeholder ini dengan tokenizer BERT asli
            const inputTensor = new ort.Tensor("float32", new Float32Array([1, 2, 3]), [1, 3]);

            const feeds = { input_ids: inputTensor }; // sesuaikan dengan nama input model
            const results = await session.run(feeds);

            console.log("Model output:", results);

            // 👉 TODO: ubah hasil ke jawaban nyata
            const botResponse = "This is a response from your ONNX model.";
            displayMessage("Bot", botResponse, "bot-message");
        } catch (e) {
            console.error("❌ Failed to run inference:", e);
            displayMessage("Bot", "Sorry, an error occurred while processing your request.", "bot-message");
        }
    };

    // Handle sending a message
    const handleSendMessage = () => {
        const message = chatInput.value.trim();
        if (message) {
            displayMessage("You", message, "user-message");
            chatInput.value = "";
            getBotResponse(message);
        }
    };

    chatSendBtn.addEventListener("click", handleSendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    });

    closeChatbot.addEventListener("click", () => {
        chatbotWindow.classList.remove("open");
    });
});