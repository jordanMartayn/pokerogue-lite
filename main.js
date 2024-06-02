const { app, WebContentsView, BrowserWindow } = require('electron');
const path = require('node:path');
const fs = require('fs');

const createWindow = () => {
    const win = new BrowserWindow({
      width: 960,
      height: 540,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    });

    //Setup the pokerogue view ontop of the main window as a percentage of the main window
    const rogueView = new WebContentsView({
        preload: path.join(__dirname, 'preloadrogueView.js')
    });
    win.contentView.addChildView(rogueView)
    const updateRogueViewBounds = () => {
      const [mainWindowWidth, mainWindowHeight] = win.getContentSize();
      rogueView.setBounds({
        x: 0, 
        y: 0, 
        width: Math.floor(mainWindowWidth * 0.8), 
        height: Math.floor(mainWindowHeight * 0.8) 
      })
    }
    updateRogueViewBounds();
    win.on('resize',updateRogueViewBounds);
    

    rogueView.webContents.loadURL('https://pokerogue.net/')
    rogueView.webContents.addListener('did-finish-load', async (event) => {
        console.log("finished load");        
        try {
          // Read the JavaScript code from getPokeRogueCanvas.js as string
          const scriptPath = path.join(__dirname, 'scripts', 'getPokeRogueCanvas.js');
          const getPokeRogueCanvas = fs.readFileSync(scriptPath, 'utf8');
          const canvasJson = await rogueView.webContents.executeJavaScript(
            getPokeRogueCanvas
          );

          console.log('canvas:', canvasJson);
        } catch (err) {
          console.error('Failed to execute JavaScript in webContents:', err);
        }
    });


  
    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });
})




console.log('hello world');