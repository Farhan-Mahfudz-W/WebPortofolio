document.addEventListener("DOMContentLoaded", function() {
    // Efek ketik
    const typewriterElement = document.getElementById("typewriter-text");
    const phrases = [
        "AI Engineer.",
        "IT Support.",
        "Full Stack Developer.",
        "Freelancer.",
        "Machine Learning Engineer.",
        "Prompt Engineer",
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

    // Animasi fade-in saat scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });

    // Menu mobile
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Chatbot
    const chatbotBubble = document.getElementById('chatbot-bubble');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeChatbot = document.getElementById('close-chatbot');

    chatbotBubble.addEventListener('click', () => {
        chatbotWindow.classList.toggle('open');
    });
    closeChatbot.addEventListener('click', () => {
        chatbotWindow.classList.remove('open');
    });
});
