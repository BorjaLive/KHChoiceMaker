const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const {ipcMain} = require('electron');

let rawconf = fs.readFileSync(path.join(__dirname, 'conf.json'));
let conf = JSON.parse(rawconf);

function createWindow () {
    const win = new BrowserWindow({
        width: conf.resolucion==undefined?1280:conf.resolucion.ancho,
        height: conf.resolucion==undefined?1280:conf.resolucion.alto,
        fullscreen: conf.resolucion == undefined,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        autoHideMenuBar: true,
        title: conf.titulo,
        icon: path.join(__dirname, 'icon.ico')
    })

    win.on('page-title-updated', function(e) {
        e.preventDefault();
    });
    ipcMain.on('close-me', (evt, arg) => {
        app.quit();
    })
    win.loadFile('index.html');
    if(conf.debug)
        win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    })
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});