//--Modules/Globals-------------------------------------------------------------------------------//
const { ipcRenderer } = require('electron');

let rogueViewBounds;
const LeftContent = document.getElementById('flexColLeft');
const rightContent = document.getElementById('flexColRight');

//--Util-Functions--------------------------------------------------------------------------------//
const captureRect = bounds => {
    /*bounds options:
    default is the full pokerogue view

    'battle-pokemon-1-type'
    */
    console.log('taking screenshot');
    ipcRenderer.send('capture-rect', bounds);
    ipcRenderer.on('capture-rect-res', (event, res) => {
        console.log(res);
    })
}
const addResizeUpdate = () => {
    window.addEventListener('resize', () => {
        ipcRenderer.send('rogueview-bounds');
    })
}
const addCursorPosPercentageListener = () => {
    const div = document.getElementById('cursorPosPercentageReadOut');
    window.addEventListener('mousemove', (event) => {
        const {clientX, clientY} = event;
        const xPerc = (clientX / rogueViewBounds?.width).toFixed(2);
        const yPerc = ( (clientY - rogueViewBounds?.height) / rogueViewBounds?.height ).toFixed(2);
        div.innerText = 
        `
        xStart%: ${xPerc}
        yStart%: ${yPerc}
        `
    })

}
const createDummyImage = () => {
    let dummy = document.getElementById('dummyImage');
    if(rogueViewBounds.width === 0 || rogueViewBounds.height === 0){
        console.error("rogueVueBounds arn't 0");
        return;
    }
    if(dummy) {
        LeftContent.removeChild(dummy);
        return;
    }
    dummy = document.createElement('img');
    dummy.id = 'dummyImage';
    dummy.src = './images/full.png';
    dummy.style.width = rogueViewBounds.width +'px';
    dummy.style.height = rogueViewBounds.height +'px'; 
    LeftContent.appendChild(dummy);
    addRectSizeToElem(dummy);
}
const addRectSizeToElem = (sadfsadfsadf) => {
    console.log(sadfsadfsadf)
    //TODO: cant seem to add a listener to it, image maybe, tried a delay, i was able to put
    //one on a button via this method, next try to do it on a div not img.
    
    elem.addEventListener('click', (event) => {
        //const {clientX, clientY} = event;
        console.log('mousemove:',event)
    })
    console.log('not failed')
    /*
    elem.addEventListener('mouseup', (event) => {
        //const {clientX, clientY} = event;
        console.log('mouseDown:',event)
    })
    */
}
//--Critical-Functions----------------------------------------------------------------------------//
const setupBtns = () => {
    const pixelDataBtn = document.getElementById('captureRectBtn');
    const bounds = 'battle-pokemon-1-type';
    pixelDataBtn.addEventListener('click', () => {captureRect(bounds)} );

    const dummyBtn = document.getElementById('dummyBtn');
    dummyBtn.addEventListener('click', createDummyImage);
}
const utilityInitaliser = () => {
    setTimeout( () => {
        ipcRenderer.send('rogueview-bounds');
    },2000)
    
    ipcRenderer.on('rogueview-bounds-res', (event, res) => {
        rogueViewBounds = res;

        const rogueviewSpacer = document.getElementById('rogueviewSpacer');

        rogueviewSpacer.style.width = rogueViewBounds.width +'px';
        rogueviewSpacer.style.height = rogueViewBounds.height +'px'; 
        rogueviewSpacer.style.top = rogueViewBounds.height +'px'; 
        LeftContent.style.width = rogueViewBounds.width +'px';
    })
} 

//--Execute---------------------------------------------------------------------------------------//
document.addEventListener('DOMContentLoaded', () => {
    utilityInitaliser();
    setupBtns();
    addResizeUpdate();
    //addCursorPosPercentageListener();
})