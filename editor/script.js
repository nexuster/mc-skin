const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sizeSelect = document.getElementById('size');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');

let pixelSize = 10;
let canvasSize = 64;
canvas.width = canvasSize * pixelSize;
canvas.height = canvasSize * pixelSize;

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ccc';
    for (let i = 0; i < canvasSize; i++) {
        for (let j = 0; j < canvasSize; j++) {
            ctx.strokeRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
        }
    }
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);
    ctx.fillStyle = '#000';
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
});

sizeSelect.addEventListener('change', (e) => {
    canvasSize = parseInt(e.target.value);
    canvas.width = canvasSize * pixelSize;
    canvas.height = canvasSize * pixelSize;
    drawGrid();
});

zoomInBtn.addEventListener('click', () => {
    pixelSize += 2;
    canvas.width = canvasSize * pixelSize;
    canvas.height = canvasSize * pixelSize;
    drawGrid();
});

zoomOutBtn.addEventListener('click', () => {
    if (pixelSize > 2) {
        pixelSize -= 2;
        canvas.width = canvasSize * pixelSize;
        canvas.height = canvasSize * pixelSize;
        drawGrid();
    }
});

drawGrid();