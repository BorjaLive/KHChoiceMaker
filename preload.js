const {ipcRenderer} = require('electron');
const path = require('path');
const fs = require('fs');

const TIMER_INTERVAL = 2;

let rawconf = fs.readFileSync(path.join(__dirname, "conf.json"));
let conf = JSON.parse(rawconf);

document.title = conf.titulo;
var cTramo = null;
var tramos = {};
conf.tramos.forEach(t => tramos[t.id] = t);

var canChoose = false;
var pasoTiempo = null;
var timeout = 0;


window.addEventListener('DOMContentLoaded', () => {
    console.log(tramos);

    var video = document.getElementById("video");
    var audio = document.getElementById("audio");
    var choseLayer = document.getElementById("choseLayer");
    var timerA = document.getElementById("timerA");
    var timerB = document.getElementById("timerB");
    var choisesDiv = document.getElementById("choisesDiv");

    video.onended = function () {
        videoEnd();
    };
    loadVideo(conf.inicial);
});


function loadVideo(id) {
    choseLayer.style.display = "none";
    if (pasoTiempo != null) {
        clearInterval(pasoTiempo);
        pasoTiempo = null;
    }
    canChoose = false;

    cTramo = id;
    video.src = path.join(__dirname, "video/" + tramos[cTramo].video);
    video.classList.remove("blur");
    video.play();
    audio.pause();
}

function videoEnd() {
    canChoose = true;
    if (tramos[cTramo].opciones == undefined) {
        if(tramos[cTramo].default == undefined){
            gotoEnd();
        }else{
            console.log("Continuar");
            loadVideo(tramos[cTramo].default);
        }
    } else {
        let html = "";
        let n = 1;
        tramos[cTramo].opciones.forEach(o => {
            html += `
                <div style="display: flex;align-items: center;justify-content: center;flex-direction: row;margin:2em;" >
                    <div style="height: 1.5em;width: 1.5em;border: white;border-style: solid;font-size: 1.5em;margin-right: 1em;display: flex;align-items: center;justify-content: center;">${n++}</div>
                    <span style="font-size: 2em;">${o.texto}</span>
                </div>
            `;
        });
        choisesDiv.innerHTML = html;

        if (tramos[cTramo].sonido != undefined) {
            audio.src = path.join(__dirname, "audio/" + tramos[cTramo].sonido);
            audio.play();
        }

        setTimers(1);
        if (tramos[cTramo].timeout != undefined) {
            timeout = tramos[cTramo].timeout * 1000;
            pasoTiempo = setInterval(() => {
                timeout -= TIMER_INTERVAL;
                setTimers(timeout / (tramos[cTramo].timeout * 1000.0));
                if(timeout <= 0) selectOption();
            }, TIMER_INTERVAL)
        }

        choseLayer.style.display = "block";
        video.classList.add("blur");
    }

}

function setTimers(percent) {
    timerA.style.width = (percent * 90) + "%";
    timerB.style.width = (percent * 90) + "%";
}

function gotoEnd() {
    console.log("Terminar. Salir del programa");
    ipcRenderer.send('close-me');
}

document.onkeydown = function (e) {
    if(!canChoose) return;
    let opt = null;
    switch (e.key) {
        case "1":
            opt = 1;
            break;
        case "2":
            opt = 2;
            break;
        case "3":
            opt = 3;
            break;
        case "4":
            opt = 4;
            break;
    }
    selectOption(opt);
}

function selectOption(opt = null){
    if(opt == null || opt > tramos[cTramo].opciones.length){
        if(tramos[cTramo].default == undefined){
            console.log("No se puede continuar");
            gotoEnd();
            return;
        }else{
            opt = tramos[cTramo].default;
        }
    }else{
        opt = tramos[cTramo].opciones[opt-1].siguiente;
    }
    loadVideo(opt);
}