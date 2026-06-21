let language =
    localStorage.getItem("language")
    || "ca";

let challengeData = null;
let found = 0;
let total = 0;

const solved =
    new Set();

const chromaticNotes =
[
    "C","C#","D","D#",
    "E","F","F#","G",
    "G#","A","A#","B"
];

const tuningNotes =
[
    "E",
    "A",
    "D",
    "G",
    "B",
    "E"
];

const noteFrequencies = {

    "C":261.63,
    "C#":277.18,
    "D":293.66,
    "D#":311.13,
    "E":329.63,
    "F":349.23,
    "F#":369.99,
    "G":392.00,
    "G#":415.30,
    "A":440.00,
    "A#":466.16,
    "B":493.88

};

const resultTexts = {

    ca:"Repte resolt",

    es:"Reto resuelto",

    en:"Challenge solved"

};

const copyTexts = {

    ca:"📋 Copiar coordenades",

    es:"📋 Copiar coordenadas",

    en:"📋 Copy coordinates"

};

function setLanguage(lang){

    localStorage.setItem(
        "language",
        lang
    );

    location.reload();
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

    document.getElementById(
        "challengeTitle"
    ).textContent =
        challengeData.title[
            language
        ];

    document.getElementById(
        "instructions"
    ).textContent =
        challengeData.instructions[
            language
        ];

    document.getElementById(
        "coordsText"
    ).textContent =
        challengeData.coordinates.north +
        " " +
        challengeData.coordinates.east;

    total =
        challengeData.solution.length;

    document.getElementById(
        "total"
    ).textContent =
        total;

    buildFretboard();
}

function buildFretboard(){

    const fretboard =
        document.getElementById(
            "fretboard"
        );

    fretboard.innerHTML = "";

    fretboard.appendChild(
        document.createElement("div")
    );

    const strings =
    [
        "E",
        "A",
        "D",
        "G",
        "B",
        "E"
    ];

    strings.forEach(string=>{

        const header =
            document.createElement(
                "div"
            );

        header.className =
            "string-header";

        header.textContent =
            string;

        fretboard.appendChild(
            header
        );

    });

    for(let fret=0; fret<=12; fret++){

        const fretLabel =
            document.createElement(
                "div"
            );

        fretLabel.className =
            "fret-number";

        fretLabel.textContent =
            fret;

        fretboard.appendChild(
            fretLabel
        );

        for(let string=1; string<=6; string++){

            const note =
                document.createElement(
                    "div"
                );

            note.className =
                "note";

            const position =
                `${string}-${fret}`;

            note.addEventListener(
                "click",
                ()=>{

                    playNote(
                        string,
                        fret
                    );

                    if(
                        challengeData.solution.includes(
                            position
                        )
                    ){
                                                if(
                            !solved.has(
                                position
                            )
                        ){

                            solved.add(
                                position
                            );

                            note.classList.add(
                                "correct"
                            );

                            found++;

                            document
                            .getElementById(
                                "found"
                            )
                            .textContent =
                                found;

                            if(
                                found === total
                            ){

                                document
                                .getElementById(
                                    "coordinates"
                                )
                                .style.display =
                                    "block";
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
            );

            fretboard.appendChild(
                note
            );

        }

    }

}

function getNote(string,fret){

    const openNote =
        tuningNotes[
            string - 1
        ];

    const index =
        chromaticNotes.indexOf(
            openNote
        );

    return chromaticNotes[
        (index + fret) % 12
    ];

}

function playNote(string,fret){

    const noteName =
        getNote(
            string,
            fret
        );

    const frequency =
        noteFrequencies[
            noteName
        ];

    const audioContext =
        new (
            window.AudioContext ||
            window.webkitAudioContext
        )();

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type =
        "triangle";

    oscillator.frequency.value =
        frequency;

    oscillator.connect(
        gain
    );

    gain.connect(
        audioContext.destination
    );

    gain.gain.setValueAtTime(
        0.15,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.4
    );

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + 0.4
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
