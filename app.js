let language =
    localStorage.getItem("language") || "ca";

let challengeData = null;

let found = 0;
let total = 0;
let currentStep = 0;

const solved = new Set();

let soundType =
    localStorage.getItem("soundType") || "triangle";

const audioContext =
    new (
        window.AudioContext ||
        window.webkitAudioContext
    )();

const stringBaseFrequencies = [
    329.63,
    246.94,
    196.00,
    146.83,
    110.00,
    82.41
];

const resultTexts = {

    ca:"Repte resolt",
    es:"Reto resuelto",
    en:"Challenge solved"

};

const progressTexts = {

    ca:"Trobades",
    es:"Encontradas",
    en:"Found"

};

const sequenceTexts = {

    ca:"Progrés",
    es:"Progreso",
    en:"Progress"

};

const copyTexts = {

    ca:"📋 Copiar coordenades",
    es:"📋 Copiar coordenadas",
    en:"📋 Copy coordinates"

};

function resetSequence(){

    currentStep = 0;
    found = 0;

    solved.clear();

    document
        .getElementById("found")
        .textContent = 0;

    document
        .querySelectorAll(".note")
        .forEach(note=>{

            note.classList.remove(
                "correct"
            );

        });

}

function setLanguage(lang){

    localStorage.setItem(
        "language",
        lang
    );

    location.reload();

}

function setSound(type){

    soundType = type;

    localStorage.setItem(
        "soundType",
        type
    );

    document
        .querySelectorAll(
            "#soundControls button"
        )
        .forEach(button=>{

            button.classList.remove(
                "active"
            );

        });

    if(type==="triangle"){

        document
            .querySelector(
                "#soundControls button:nth-child(1)"
            )
            .classList.add("active");

    }

    if(type==="sawtooth"){

        document
            .querySelector(
                "#soundControls button:nth-child(2)"
            )
            .classList.add("active");

    }

    if(type==="square"){

        document
            .querySelector(
                "#soundControls button:nth-child(3)"
            )
            .classList.add("active");

    }

}

document.getElementById(
    "resultText"
).textContent =
    resultTexts[language];

document.getElementById(
    "copyButton"
).textContent =
    copyTexts[language];

const params =
    new URLSearchParams(
        window.location.search
    );

const challengeId =
    params.get("id");

async function loadChallenge(){

    if(!challengeId){

        alert(
            "Challenge not found"
        );

        return;

    }

    const response =
        await fetch(
            `challenges/${challengeId}.json`
        );

    challengeData =
        await response.json();

    document
        .getElementById(
            "challengeTitle"
        )
        .textContent =
            challengeData.title[language];

    document
        .getElementById(
            "instructions"
        )
        .textContent =
            challengeData.instructions[language];

    document
        .getElementById(
            "coordsText"
        )
        .textContent =
            challengeData.coordinates.north +
            " " +
            challengeData.coordinates.east;

    total =
        challengeData.solution.length;

    document
        .getElementById(
            "total"
        )
        .textContent =
            total;

    document
        .getElementById(
            "progressLabel"
        )
        .textContent =
            challengeData.mode==="sequence"
            ? sequenceTexts[language]
            : progressTexts[language];

    buildFretboard();

    setSound(soundType);

        }
function buildFretboard(){

    const fretboard =
        document.getElementById("fretboard");

    const fretLabels =
        document.getElementById("fret-labels");

    fretboard.innerHTML = "";
    fretLabels.innerHTML = "";

    const strings = [
        "E",
        "A",
        "D",
        "G",
        "B",
        "E"
    ];

    const empty =
        document.createElement("div");

    empty.className = "fret-label";

    fretLabels.appendChild(empty);

    strings.forEach(string=>{

        const header =
            document.createElement("div");

        header.className =
            "string-header";

        header.textContent =
            string;

        fretboard.appendChild(header);

    });

    for(let fret=0; fret<=12; fret++){

        const label =
            document.createElement("div");

        label.className =
            "fret-label";

        label.textContent =
            fret;

        fretLabels.appendChild(label);

        for(let string=1; string<=6; string++){

            const note =
                document.createElement("div");

            note.className =
                "note";

            if(string===1){

                note.classList.add(
                    "first-in-row"
                );

            }

            const position =
                `${string}-${fret}`;

            note.dataset.position =
                position;

            note.addEventListener(
                "click",
                ()=>{

                    playNote(
                        string,
                        fret
                    );

                    //---------------------------------
                    // MODO SEQUENCE
                    //---------------------------------

                    if(
                        challengeData.mode==="sequence"
                    ){

                        if(
                            position===
                            challengeData.solution[currentStep]
                        ){

                            note.classList.add(
                                "correct"
                            );

                            currentStep++;

                            found=currentStep;

                            document
                                .getElementById("found")
                                .textContent=found;

                            if(
                                currentStep===total
                            ){

                                document
                                    .getElementById(
                                        "coordinates"
                                    )
                                    .style.display="block";

                            }

                        }else{

                            note.classList.add(
                                "wrong"
                            );

                            setTimeout(()=>{

                                note.classList.remove(
                                    "wrong"
                                );

                                resetSequence();

                            },300);

                        }

                    }

                    //---------------------------------
                    // MODO FIND
                    //---------------------------------

                    else{

                        if(
                            challengeData.solution.includes(position)
                        ){

                            if(
                                !solved.has(position)
                            ){

                                solved.add(position);

                                note.classList.add(
                                    "correct"
                                );

                                found++;

                                document
                                    .getElementById("found")
                                    .textContent=found;

                                if(found===total){

                                    document
                                        .getElementById(
                                            "coordinates"
                                        )
                                        .style.display="block";

                                }

                            }

                        }else{

                            note.classList.add(
                                "wrong"
                            );

                            setTimeout(()=>{

                                note.classList.remove(
                                    "wrong"
                                );

                            },500);

                        }

                    }

                }

            );

            fretboard.appendChild(note);

        }

    }

                    }
function playNote(string, fret){

    if(audioContext.state==="suspended"){

        audioContext.resume();

    }

    // Invertimos la numeración visual:
    // cuerda 1 = E aguda
    // cuerda 6 = E grave

    const realString =
        7 - string;

    const frequency =
        stringBaseFrequencies[
            realString - 1
        ] *
        Math.pow(
            2,
            fret / 12
        );

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type =
        soundType;

    oscillator.frequency.value =
        frequency;

    oscillator.connect(gain);

    gain.connect(
        audioContext.destination
    );

    gain.gain.setValueAtTime(
        0,
        audioContext.currentTime
    );

    gain.gain.linearRampToValueAtTime(
        0.20,
        audioContext.currentTime + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.8
    );

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + 1
    );

}

function copyCoords(){

    navigator.clipboard.writeText(

        document
            .getElementById(
                "coordsText"
            )
            .textContent
            .trim()

    );

    const btn =
        document.getElementById(
            "copyButton"
        );

    btn.textContent =
        "📋 ✓";

    setTimeout(()=>{

        btn.textContent =
            copyTexts[language];

    },2000);

}

loadChallenge();
