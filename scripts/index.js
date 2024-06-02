const { ipcRenderer } = require('electron');

//--Util-Functions--------------------------------------------------------------------------------//
const getPixelData = () => {
    console.log('getting data');
    ipcRenderer.send('pixel-data');
    ipcRenderer.on('pixel-data-res', (event, res) => {
        console.log(res);
    })
}
//--Critical-Functions----------------------------------------------------------------------------//
const setupBtns = () => {
    const pixelDataBtn = document.getElementById('getPixelDataBtn');
    pixelDataBtn.addEventListener('click',getPixelData);
}

//--Execute---------------------------------------------------------------------------------------//
document.addEventListener('DOMContentLoaded', () => {
    setupBtns();
})