const typingText = document.querySelector(".typing-text p"),
    inpField = document.querySelector(".input-field"),
    tryAgainBtn = document.querySelector(".content-btn button"),
    timeTag = document.querySelector(".time span b"),
    mistakeTag = document.querySelector(".mistake span"),
    wpmTag = document.querySelector(".wpm span"),
    cpmTag = document.querySelector(".cpm span"),
    keyboard = document.querySelector(".keyboard"),
    keys = document.querySelectorAll(".key"),
    // mainContent = document.querySelector(".main-content");
    mainContent = document.querySelector(".wrapper");

let timer,
    maxTime = 180,
    timeLeft = maxTime,
    charIndex = 0,
    mistakes = 0,
    isTyping = false,
    isCapsLock = false,
    isShift = false;

const paragraphText = typingText.innerText.trim();
let charactersArray = [];

function loadParagraph() {
    const ranIndex = Math.floor(Math.random() * paragraphs.length);
    typingText.innerHTML = "";
    paragraphs[ranIndex].split("").forEach(char => {
        typingText.innerHTML += `<span>${char}</span>`;
    });
    typingText.querySelectorAll("span")[0].classList.add("active");
    document.addEventListener("keydown", () => inpField.focus());
    typingText.addEventListener("click", () => inpField.focus());
}

function initTyping() {
    if (timeLeft <= 0) return;
    const characters = typingText.querySelectorAll("span");
    const typedChar = inpField.value.charAt(charIndex);

    if (charIndex < characters.length && timeLeft > 0) {
        if (!isTyping) {
            timer = setInterval(initTimer, 1000);
            isTyping = true;
        }

        if (typedChar == null) {
            return;
        }

        if (characters[charIndex].innerText === typedChar) {
            characters[charIndex].classList.add("correct");
        } else {
            characters[charIndex].classList.add("incorrect");
            mistakes++;
        }

        characters[charIndex].classList.remove("active");
        charIndex++;
        if (charIndex < characters.length) characters[charIndex].classList.add("active");

        updateStats();
    } else {
        clearInterval(timer);
        inpField.value = "";
    }
}

function updateStats() {
    const wpm = Math.round(((charIndex - mistakes) / 5) / ((maxTime - timeLeft) / 60));
    wpmTag.innerText = wpm > 0 && wpm !== Infinity ? wpm : 0;
    mistakeTag.innerText = mistakes;
    cpmTag.innerText = charIndex - mistakes;
}

function initTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timeTag.innerText = timeLeft;
    } else {
        clearInterval(timer);
        tryAgainBtn.style.display = "inline-block";
        tryAgainBtn.disabled = false;
        mainContent.classList.add("blur");
    }
}

function resetGame() {
    loadParagraph();
    clearInterval(timer);
    timeLeft = maxTime;
    charIndex = mistakes = 0;
    isTyping = false;
    inpField.value = "";
    timeTag.innerText = maxTime;
    mistakeTag.innerText = 0;
    wpmTag.innerText = 0;
    cpmTag.innerText = 0;
    tryAgainBtn.style.display = "none";
    tryAgainBtn.disabled = true;
    mainContent.classList.remove("blur");
}

function updateKeys() {
    keys.forEach(key => {
        if (key.textContent.length === 1) {
            key.textContent = (isCapsLock || isShift)
                ? key.textContent.toUpperCase()
                : key.textContent.toLowerCase();
        }
    });
}

// Virtual Keyboard Input
keys.forEach(key => {
    key.addEventListener("click", () => {
        const keyValue = key.dataset.key;

        if (keyValue === "Backspace") {
            const characters = typingText.querySelectorAll("span");
            if (charIndex > 0) {
                charIndex--;
                if (characters[charIndex].classList.contains("incorrect")) mistakes--;
                characters[charIndex].classList.remove("correct", "incorrect");
                characters.forEach(span => span.classList.remove("active"));
                characters[charIndex].classList.add("active");
                inpField.value = inpField.value.slice(0, -1);
                updateStats();
            }
        } else if (keyValue === " ") {
            inpField.value += " ";
        } else if (keyValue === "Tab") {
            inpField.value += "   ";
        } else if (keyValue === "Enter") {
            inpField.value += "\n";
        } else if (keyValue === "CapsLock") {
            isCapsLock = !isCapsLock;
            updateKeys();
        } else if (keyValue === "Shift") {
            isShift = true;
            updateKeys();
        } else {
            inpField.value += (isCapsLock || isShift) ? keyValue.toUpperCase() : keyValue.toLowerCase();
        }

        if (isShift && keyValue !== "Shift") {
            isShift = false;
            updateKeys();
        }

        inpField.focus();
        inpField.dispatchEvent(new Event("input"));
    });

    key.addEventListener("mousedown", () => key.classList.add("active"));
    key.addEventListener("mouseup", () => key.classList.remove("active"));
});

// Physical Keyboard Sync
document.addEventListener("keydown", event => {
    const key = event.key;
    if (key === "CapsLock") {
        isCapsLock = !isCapsLock;
        updateKeys();
    } else if (key === "Shift") {
        isShift = true;
        updateKeys();
    }

    const keyButton = Array.from(keys).find(k => k.dataset.key === key || k.dataset.key === key.toLowerCase());
    if (keyButton) keyButton.classList.add("active");

    if (["Tab", "Enter", " "].includes(key)) {
        event.preventDefault();
    }

    if (key === " ") {
        event.preventDefault();
        inpField.value += " ";
        inpField.dispatchEvent(new Event("input"));
    }

    if (key === "Backspace") {
        event.preventDefault();
        const characters = typingText.querySelectorAll("span");
        if (charIndex > 0) {
            charIndex--;
            if (characters[charIndex].classList.contains("incorrect")) mistakes--;
            characters[charIndex].classList.remove("correct", "incorrect");
            characters.forEach(span => span.classList.remove("active"));
            characters[charIndex].classList.add("active");
            inpField.value = inpField.value.slice(0, -1);
            updateStats();
        }
    }
});

document.addEventListener("keyup", event => {
    const key = event.key;
    if (key === "Shift") {
        isShift = false;
        updateKeys();
    }
    const keyButton = Array.from(keys).find(k => k.dataset.key === key || k.dataset.key === key.toLowerCase());
    if (keyButton) keyButton.classList.remove("active");
});

// Init
loadParagraph();
inpField.addEventListener("input", initTyping);
tryAgainBtn.addEventListener("click", resetGame);
