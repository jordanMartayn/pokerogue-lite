//--Modules/Globals-------------------------------------------------------------------------------//
const { app, WebContentsView, BrowserWindow, ipcMain, desktopCapturer, Menu, ipcRenderer } = require('electron');
const path = require('node:path');
const fs = require('fs');

const devmode = true;
let rogueView;
let win;
let rogueViewBoundsRequestDebounce = false;

//--Utility Functions-----------------------------------------------------------------------------//
const updateRogueViewBounds = () => {
    const [mainWindowWidth, mainWindowHeight] = win.getContentSize();
    const aspectRatio = mainWindowWidth / mainWindowHeight;
    const desiredAspectRatio = 16 / 9;
    let scale;
    devmode ? scale = 0.5 : scale = 0.8; 
    let width = 500;
    let height = 1000;
    
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
    
    const bounds = {
        x: 0, 
        y: 0, 
        width,
        height, 
    }
    rogueView.setBounds(bounds);
    win.webContents.send('updated-rogueview-bounds', bounds);
}

const rogueViewBoundsRequest = () => {
    ipcMain.on('rogueview-bounds', (event) => {
        if(rogueViewBoundsRequestDebounce) return;
        rogueViewBoundsRequestDebounce = true;
        setTimeout( () => {
            rogueViewBoundsRequestDebounce = false;
            const bounds = rogueView.getBounds();
            event.reply('rogueview-bounds-res', bounds);
        },500);
    })
}
/*
didnt work, cant get right buffer, keeping around incase i need to try and access the canvas again
for other props
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
*/
//--Critical Functions----------------------------------------------------------------------------//
const createWindow = () => {
        win = new BrowserWindow({
            width: 960,
            height: 540,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: true,
                contextIsolation: false,
                devTools: true,
            },
        });
        win.setMenuBarVisibility(false);
        win.loadFile('index.html');

        //dev mode options
        if(devmode){
            win.webContents.openDevTools();
        }

        //Setup the pokerogue view ontop of the main window as a percentage of the main window
        rogueView = new WebContentsView({
                preload: path.join(__dirname, 'preloadrogueView.js'),
        });
        win.contentView.addChildView(rogueView)    
        rogueView.webContents.loadURL('https://pokerogue.net/')
        

        //set size of pokerogue
        setTimeout(updateRogueViewBounds,2000); //prevents a harmless border appearing on inital load
        win.on('resize',updateRogueViewBounds);

}

//--Intialise-------------------------------------------------------------------------------------//
app.whenReady().then(() => {
        createWindow();

        //ipc Listeners
        rogueViewBoundsRequest();
        ipcMain.on('capture-rect', async (event, boundsInstruction) => {
            //set bounds
            let windowBounds;

            /* viewBounds sets bounds reletive to the pokerouge view as a decimal percentage,
            i.e. if you want the a rectangle that takes the 20-40% of the width and 60-90& of the height
            viewBounds = [0.2, 0.4, 0.6, 0.9]
             */
            let viewBounds = [xStartP, xEndP, yStartP, yEndP] = [0, 0, 0, 0];    

            switch (boundsInstruction) {
                case 'battle-pokemon-1-type':
                    viewBounds = []
                    break
                default:
                    bounds = rogueView.getBounds();
            }

            //get the pokerouge window and take a screen shot of bounds
            const [winWidth, winHeight] = win.getSize();
            const sources = await desktopCapturer.getSources({ 
                types: ['window'], 
                thumbnailSize: {
                    width:winWidth,
                    height:winHeight,
                } 
            });

            for (const source of sources) {
                if(source.name === 'pokerogue-lite') {
                    const croppedImage = source.thumbnail.crop(windowBounds);
                    const data = croppedImage.toPNG();
                    fs.writeFileSync( path.join(__dirname, 'images', `${source.name}.png` ) , data);
                }
            }
            
            event.reply( 'capture-rect-res', 'image captured' );
        });

        //close
        app.on('window-all-closed', () => {
                if (process.platform !== 'darwin') app.quit();
        });
})
