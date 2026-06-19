const tuning = [
    "E",
    "A",
    "D",
    "G",
    "B",
    "E"
];

const notes = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B"
];

const pentatonic = [
    "A",
    "C",
    "D",
    "E",
    "G"
];

const fretboard =
    document.getElementById("fretboard");

let found = 0;
let totalCorrect = 0;

function getNote(openString, fret){

    let index =
        notes.indexOf(openString);

    return notes[
        (index + fret) % 12
    ];
}

for(let string=0; string<6; string++){

    for(let fret=0; fret<=12; fret++){

        const noteName =
            getNote(
                tuning[string],
                fret
            );

        const div =
            document.createElement("div");

        div.classList.add("note");

        div.dataset.note =
            noteName;

        if(
            pentatonic.includes(
                noteName
            )
        ){
            totalCorrect++;
        }

        div.addEventListener(
            "click",
            ()=>{

                playTone(noteName);

                if(
                    pentatonic.includes(
                        noteName
                    )
                ){

                    if(
                        !div.classList.contains(
                            "correct"
                        )
                    ){

                        div.classList.add(
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
                            found === totalCorrect
                        ){

                            document
                            .getElementById(
                                "coordinates"
                            )
                            .classList.remove(
                                "hidden"
                            );
                        }
                    }

                }else{

                    div.classList.add(
                        "wrong"
                    );

                    setTimeout(()=>{
                        div.classList.remove(
                            "wrong"
                        );
                    },500);
                }

            }
        );

        fretboard.appendChild(div);
    }
}

document
.getElementById("total")
.textContent =
    totalCorrect;

function playTone(note){

    const audio =
        new Audio(
            "audio/" +
            note +
            ".mp3"
        );

    audio.play();
}

document
.getElementById("resetBtn")
.addEventListener(
    "click",
    ()=>{
        location.reload();
    }
);
