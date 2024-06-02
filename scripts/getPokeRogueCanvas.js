/*
    looks for a canvas element in the pokerogue body for 30secs or until it finds it then it passes
    a stringified object made from the canvas props back. Sending the full object was having issues
    with 'serialisation' so I couldnt see the object in the console just '{}'.
*/

new Promise((resolve) => {
    const interval = setInterval(() => {
        const findDeepCanvas = (parentElement) => {
            const children = Object.values(parentElement.children);
            let searchedChildren = 0;
            for (const child of children) {
                if(child.localName === 'canvas') return child;
                const found = findDeepCanvas(child);
                if(found) return found;
                searchedChildren++;
            }
        }
        const canvas = findDeepCanvas(document.body);
        if(!canvas)return;
        clearInterval(interval);
        const gl = canvas.getContext('webgl');
        // Read pixel data
        const width = canvas.width * 0.1;
        const height = canvas.height * 0.1;
        const pixelData = new Uint8Array(width * height * 4); // 4 components per pixel (RGBA)
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);


        resolve( JSON.stringify(
            {
                width:      canvas.width,
                height:     canvas.height,
                pixelData: Array.from(pixelData)
            }
        ));
    }, 3000);

    setTimeout(() => {
        clearInterval(interval);
        resolve('backupTimeout');
    }, 30000);
})