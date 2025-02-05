const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sizeSelect = document.getElementById('size');
const colorPicker = document.getElementById('colorPicker');
const brushTool = document.getElementById('brushTool');
const bucketTool = document.getElementById('bucketTool');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const historyContainer = document.getElementById('history');

let pixelSize = 10;
let canvasSize = 64;
let currentTool = 'brush';
let currentColor = '#000000';
let history = [];
let redoStack = [];
let isMouseDown = false;

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

function saveState() {
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    history.push(state);
    if (history.length > 100) history.shift();  // Limit history to 100 states
    redoStack = []; // Clear redo stack
    updateHistoryDisplay();
}

function undo() {
    if (history.length > 1) {
        redoStack.push(history.pop());
        let lastState = history[history.length - 1];
        ctx.putImageData(lastState, 0, 0);
        updateHistoryDisplay();
    }
}

function redo() {
    if (redoStack.length > 0) {
        let lastRedoState = redoStack.pop();
        history.push(lastRedoState);
        ctx.putImageData(lastRedoState, 0, 0);
        updateHistoryDisplay();
    }
}

function updateHistoryDisplay() {
    historyContainer.innerHTML = '';
    history.forEach((state, index) => {
        const canvasThumbnail = document.createElement('canvas');
        canvasThumbnail.width = canvas.width / 10;
        canvasThumbnail.height = canvas.height / 10;
        const thumbnailCtx = canvasThumbnail.getContext('2d');
        thumbnailCtx.putImageData(state, 0, 0, 0, 0, canvasThumbnail.width, canvasThumbnail.height);

        const img = new Image();
        img.src = canvasThumbnail.toDataURL();
        img.classList.add('history-thumbnail');
        img.addEventListener('click', () => {
            ctx.putImageData(state, 0, 0);
            history = history.slice(0, index + 1);
            redoStack = [];
            updateHistoryDisplay();
        });

        historyContainer.appendChild(img);
    });
}

function fillBucket(x, y, targetColor) {
    const fillColor = hexToRgb(currentColor);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const stack = [[x, y]];
    const baseColor = getPixelColor(data, x, y);

    if (colorsMatch(baseColor, fillColor)) return;

    while (stack.length) {
        const [x, y] = stack.pop();
        const currentColor = getPixelColor(data, x, y);

        if (colorsMatch(currentColor, baseColor)) {
            setPixelColor(data, x, y, fillColor);

            stack.push([x + 1, y]);
            stack.push([x - 1, y]);
            stack.push([x, y + 1]);
            stack.push([x, y - 1]);
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function getPixelColor(data, x, y) {
    const index = (y * canvas.width + x) * 4;
    return [data[index], data[index + 1], data[index + 2], data[index + 3]];
}

function setPixelColor(data, x, y, color) {
    const index = (y * canvas.width + x) * 4;
    data[index] = color[0];
    data[index + 1] = color[1];
    data[index + 2] = color[2];
    data[index + 3] = 255;
}

function colorsMatch(color1, color2) {
    return color1[0] === color2[0] &&
           color1[1] === color2[1] &&
           color1[2] === color2[2] &&
           color1[3] === color2[3];
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);

    if (currentTool === 'brush') {
        ctx.fillStyle = currentColor;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    } else if (currentTool === 'bucket') {
        fillBucket(x, y, currentColor);
    }

    saveState();
});

canvas.addEventListener('mousemove', (e) => {
    if (isMouseDown && currentTool === 'brush') {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / pixelSize);
        const y = Math.floor((e.clientY - rect.top) / pixelSize);
        ctx.fillStyle = currentColor;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
    saveState();
});

canvas.addEventListener('mouseout', () => {
    isMouseDown = false;
});

sizeSelect.addEventListener('change', (e) => {
    canvasSize = parseInt(e.target.value);
    canvas.width = canvasSize * pixelSize;
    canvas.height = canvasSize * pixelSize;
    drawGrid();
    saveState();
});

zoomInBtn.addEventListener('click', () => {
    pixelSize += 2;
    canvas.width = canvasSize * pixelSize;
    canvas.height = canvasSize * pixelSize;
    drawGrid();
    saveState();
});

zoomOutBtn.addEventListener('click', () => {
    if (pixelSize > 2) {
        pixelSize -= 2;
        canvas.width = canvasSize * pixelSize;
        canvas.height = canvasSize * pixelSize;
        drawGrid();
        saveState();
    }
});

colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
});

brushTool.addEventListener('click', () => {
    currentTool = 'brush';
});

bucketTool.addEventListener('click', () => {
    currentTool = 'bucket';
});

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        if (e.shiftKey) {
            redo();
        } else {
            undo();
        }
    } else if (e.ctrlKey && e.key === 'y') {
        redo();
    }
});

drawGrid();
saveState();