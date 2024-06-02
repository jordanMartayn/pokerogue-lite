window.addEventListener('DOMContentLoaded', () => {
  console.log('preloadView1.js')
  const findCanvas = () => {
    const canvases = document.getElementsByTagName('canvas');
    alert(canvases);
  }
  findCanvas();
})