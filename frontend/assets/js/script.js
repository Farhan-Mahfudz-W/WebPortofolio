// assets/js/script.js
import { setupChatbot } from "./chatbot.js";

document.addEventListener("DOMContentLoaded", function () {
    // === Typewriter effect ===
    const typewriterElement = document.getElementById("typewriter-text");
    const phrases = [
        "AI Engineer.",
        "IT Support.",
        "Prompt Engineer.",
        "A Freelancer.",
        "I can code!",
        "Full Stack Developer.",
        "Machine Learning Engineer."
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

    // === Fade-in animation on scroll ===
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

    // === Mobile menu toggle ===
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    mobileMenuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
    });

    // === Chatbot init ===
    setupChatbot();
});
