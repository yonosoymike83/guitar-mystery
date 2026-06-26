let language = localStorage.getItem("language") || "ca";

let challengeData = null;
let found = 0;
let total = 0;

const solved = new Set();

let soundType = localStorage.getItem("soundType") || "triangle";

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const stringBaseFrequencies = [
    329.63, // 1ª E aguda
    246.94, // 2ª B
    196.00, // 3ª G
    146.83, // 4ª D
    110.00, // 5ª A
    82.41   // 6ª E grave
];

const resultTexts = {
    ca: "Repte resolt",
    es: "Reto resuelto",
    en: "Challenge solved"
};

const progressTexts = {
    ca: "Trobades",
    es: "Encontradas",
    en: "Found"
};

const copyTexts = {
    ca: "📋 Copiar coordenades",
    es: "📋 Copiar coordenadas",
    en: "📋 Copy coordinates"
};

function setLanguage(lang) {
    localStorage.setItem("language", lang);
    location.reload();
}

function setSound(type) {
    soundType = type;
    localStorage.setItem("soundType", type);
    document.querySelectorAll("#soundControls button").forEach(button => {
        button.classList.remove("active");
    });
    if (type === "triangle") {
        document.querySelector("#soundControls button:nth-child(1)").classList.add("active");
    }
    if (type === "sawtooth") {
        document.querySelector("#soundControls button:nth-child(2)").classList.add("active");
    }
    if (type === "square") {
        document.querySelector("#soundControls button:nth-child(3)").classList.add("active");
    }
}

document.getElementById("resultText").textContent = resultTexts[language];
document.getElementById("copyButton").textContent = copyTexts[language];
document.getElementById("progressLabel").textContent = progressTexts[language];

const params = new URLSearchParams(window.location.search);
const challengeId = params.get("id");

async function loadChallenge() {
    if (!challengeId) {
        alert("Challenge not found");
        return;
    }

    const response = await fetch(`challenges/${challengeId}.json`);
    challengeData = await response.json();

    document.getElementById("challengeTitle").textContent = challengeData.title[language];
    document.getElementById("instructions").textContent = challengeData.instructions[language];
    document.getElementById("coordsText").textContent =
        challengeData.coordinates.north + " " + challengeData.coordinates.east;

    total = challengeData.solution.length;
    document.getElementById("total").textContent = total;

    buildFretboard();
    setSound(soundType);
}

function buildFretboard() {
    const fretboard = document.getElementById("fretboard");
    const fretLabels = document.getElementById("fret-labels");

    fretboard.innerHTML = "";
    fretLabels.innerHTML = "";

    const strings = ["E", "A", "D", "G", "B", "E"];

    const emptyLabel = document.createElement("div");
    emptyLabel.className = "fret-label";
    fretLabels.appendChild(emptyLabel);

    strings.forEach(string => {
        const header = document.createElement("div");
        header.className = "string-header";
        header.textContent = string;
        fretboard.appendChild(header);
    });

    for (let fret = 0; fret <= 12; fret++) {
        const fretLabel = document.createElement("div");
        fretLabel.className = "fret-label";
        fretLabel.textContent = fret;
        fretLabels.appendChild(fretLabel);

        for (let string = 1; string <= 6; string++) {
            const note = document.createElement("div");
            note.className = "note" + (string === 1 ? " first-in-row" : "");

            const position = `${string}-${fret}`;

            note.addEventListener("click", () => {
                playNote(string, fret);

                if (challengeData.solution.includes(position)) {
                    if (!solved.has(position)) {
                        solved.add(position);
                        note.classList.add("correct");
                        found++;
                        document.getElementById("found").textContent = found;

                        if (found === total) {
                            document.getElementById("coordinates").style.display = "block";
                        }
                    }
                } else {
                    note.classList.add("wrong");
                    setTimeout(() => {
                        note.classList.remove("wrong");
                    }, 500);
                }
            });

            fretboard.appendChild(note);
        }
    }
}

function playNote(string, fret) {
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    const realString = 7 - string;
    const frequency = stringBaseFrequencies[realString - 1] * Math.pow(2, fret / 12);

    console.log("Cuerda:", string, "Traste:", fret, "Hz:", frequency);

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = soundType;
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.20, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
}

function copyCoords() {
    navigator.clipboard.writeText(
        document.getElementById("coordsText").textContent.trim()
    );

    const btn = document.getElementById("copyButton");
    btn.textContent = "📋 ✓";
    setTimeout(() => {
        btn.textContent = copyTexts[language];
    }, 2000);
}

loadChallenge();
