const { app, WebContentsView, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('fs');

const devmode = true;
let rogueView;

//--Utility Functions-----------------------------------------------------------------------------//
const getPokerogueCanvasPixelData = () => {
  return new Promise((resolve, reject) => {

    //Try and extract pixel data from the pokerogue canvas 
    (async () => {
      try {
        // Read the JavaScript code from getPokeRogueCanvas.js as string
        const scriptPath = path.join(__dirname, 'scripts', 'getPokeRogueCanvas.js');
        const getPokeRogueCanvas = fs.readFileSync(scriptPath, 'utf8');
        const canvasJson = await rogueView.webContents.executeJavaScript(getPokeRogueCanvas);
        resolve(canvasJson);
  
      } catch (err) {
        console.error('Failed to execute JavaScript in webContents:', err);
        reject(err);
      }
    })();

  });
}
//--critical Functions----------------------------------------------------------------------------//
const createWindow = () => {
    const win = new BrowserWindow({
      width: 960,
      height: 540,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: false,
        devTools: true,
      }
    });

    if(devmode){
      win.webContents.openDevTools();
    }

    //Setup the pokerogue view ontop of the main window as a percentage of the main window
    rogueView = new WebContentsView({
        preload: path.join(__dirname, 'preloadrogueView.js')
    });
    win.contentView.addChildView(rogueView)

    const updateRogueViewBounds = () => {
      const [mainWindowWidth, mainWindowHeight] = win.getContentSize();
      const aspectRatio = mainWindowWidth / mainWindowHeight;
      const desiredAspectRatio = 16 / 9;
      let scale;
      devmode ? scale = 0.5 : scale = 0.8; 
      let width = 500;
      let height = 1000;
      /*
      if(aspectRatio >= desiredAspectRatio){
        //use height as the setting dimention
        height = Math.floor(mainWindowHeight * scale);
        //derive width from set height & desired aspect ratio 
        width = Math.floor(desiredAspectRatio * height);        
      }else{
        //use width as setting dimention etc...
        width = Math.floor(mainWindowWidth * scale);
        height = Math.floor(width / desiredAspectRatio);
      }
      */
      rogueView.setBounds({
        x: 0, 
        y: 0, 
        width,
        height, 
      })
    }
    updateRogueViewBounds();
    win.on('resize',updateRogueViewBounds);
    rogueView.webContents.loadURL('https://pokerogue.net/')
    //



  
    win.loadFile('index.html');
}

app.whenReady().then(() => {
    //initalise
    createWindow();

    //ipc Listeners
    ipcMain.on('pixel-data', async (event) => {
      const data = await getPokerogueCanvasPixelData();
      event.reply( 'pixel-data-res', data );
    });

    //close
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });
})

//console.log('main.js - End');