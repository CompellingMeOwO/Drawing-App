const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let brushColor = "black";
let brushWidth = 3;
let undoIndex = -1;
let redoIndex = -1;
let drawingActions = [];
let startIndices = [];
let endIndices = [];
let index;
let eraserOn = false;
// setting up canvas size
function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
setCanvasSize();
window.addEventListener("resize", setCanvasSize);

//drawing on canvas
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;

  if (eraserOn) {
    eraser(e.offsetX, e.offsetY);
    return;
  }
  lastX = e.offsetX;
  lastY = e.offsetY;
  let startPoint = { x: lastX, y: lastY };
  recordDrawingAction({
    type: "start",
    startPoint: startPoint,
    strokeColor: brushColor,
  });

  draw(e);
  // removing the input range to select the pencil width when user clicks on canvas
  range.classList.add("toggle");
  colorPickerContainer.classList.add("toggle");
});
canvas.addEventListener("mousemove", draw);
window.addEventListener("mouseup", stopDrawing);

function draw(e) {
  if (eraserOn && isDrawing) {
    eraser(e.offsetX, e.offsetY);
    return;
  }

  if (!isDrawing) return;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = brushWidth;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.strokeStyle = brushColor;
  ctx.stroke();
  [lastX, lastY] = [e.offsetX, e.offsetY];
  // recording drawing actions
  let currentPoint = { x: e.offsetX, y: e.offsetY };
  recordDrawingAction({
    type: "draw",
    currentPoint: currentPoint,
    strokeColor: brushColor,
  });
}
function stopDrawing(e) {
  if (isDrawing) {
    let endPoint = { x: e.offsetX, y: e.offsetY };
    recordDrawingAction({
      type: "end",
      endPoint: endPoint,
      strokeColor: brushColor,
    });
  }
  isDrawing = false;

  ctx.beginPath();
}

// -------------- dark - light mode
let darkmode = false;
const colorBtn = document.querySelector(".color-mode");

colorBtn.addEventListener("click", (e) => {
  if (!darkmode) {
    canvas.style.setProperty("--dot-bg", "#0F0F0F");
    canvas.style.setProperty("--dot-color", "white");
    brushColor = "white";
    darkmode = true;
  } else {
    canvas.style.setProperty("--dot-bg", "#fcf5ed");
    canvas.style.setProperty("--dot-color", "black");
    brushColor = "black";
    darkmode = false;
  }
});
// ----------pencil width

const pencil = document.querySelector(".pencil");
const range = document.querySelector(".pencil-width");
// range.classList.add("toggle");
pencil.addEventListener("click", () => {
  eraserIcon.style.color = "#ce5a67";
  eraserOn = false;
  range.classList.toggle("toggle");
});
range.addEventListener("change", () => (brushWidth = range.value));

// ------implementing undo and redo
function recordDrawingAction(action) {
  // removing the lines after undo
  if (undoIndex < startIndices.length - 1) {
    drawingActions.splice(startIndices[undoIndex + 1]);
    startIndices.splice(undoIndex + 1);
    endIndices.splice(undoIndex + 1);
    console.log("undo Index in drawing action = ", undoIndex);

    console.log(
      "startIndices in drawing Action " + startIndices.slice(0, undoIndex + 1)
    );
  }
  drawingActions.push(action);
  if (action.type === "start") {
    startIndices.push(drawingActions.length - 1);
    undoIndex = startIndices.length - 1;
  } else if (action.type === "end") {
    endIndices.push(drawingActions.length - 1);
  } else {
    return;
  }
}

function redrawCanvas(index) {
  // Clear the entire canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < index; i++) {
    let action = drawingActions[i];
    switch (action.type) {
      case "start":
        // move to start point
        ctx.beginPath();
        ctx.moveTo(action.startPoint.x, action.startPoint.y);
        break;
      case "draw":
        ctx.lineTo(action.currentPoint.x, action.currentPoint.y);
        ctx.strokeStyle = action.strokeColor;
        ctx.stroke();
        break;
      case "end":
        //finish the line
        ctx.closePath();
        break;

      default:
        console.log("no type met");
        break;
    }
  }
}
// undo and redo
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "z") {
    undo();
  }
});
function undo() {
  // make sure drawingAction array is not empty
  if (undoIndex <= -1) return;
  redoIndex = undoIndex;
  // Redraw all actions up to the last startObject
  index = startIndices[undoIndex];
  redrawCanvas(index);
  undoIndex--;
}
function redo() {
  if (redoIndex <= endIndices.length - 1) {
    undoIndex = redoIndex;
    index = endIndices[redoIndex];
    redrawCanvas(index);
    redoIndex++;
  }
}
document.querySelector("#undo").addEventListener("click", undo);
document.querySelector("#redo").addEventListener("click", redo);

// brush color
const palatte = document.querySelector("#palatte");
const colorPickerContainer = document.querySelector(".color-picker-container");
palatte.addEventListener("click", () => {
  eraserOn = false;
  eraserIcon.style.color = "#ce5a67";
  colorPickerContainer.classList.toggle("toggle");
});

const colorButtons = document.querySelectorAll(".flex-item-color");

for (let div of colorButtons) {
  div.addEventListener("click", handleColorChange);
}
function handleColorChange(e) {
  const computedStyle = window.getComputedStyle(e.target);
  const colorOfButton = computedStyle.backgroundColor;
  brushColor = colorOfButton;
  palatte.style.color = colorOfButton;
}
const hexcode = document.querySelector("#hexcode");
hexcode.addEventListener("change", () => {
  brushColor = hexcode.value.trim();
});
// clear the canvas
document.querySelector("#clear").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawingActions = [];
});
// eraser
function eraser(x, y) {
  ctx.clearRect(x, y, 100, 100);
}

const eraserIcon = document.querySelector("#eraser");
eraserIcon.addEventListener("click", () => {
  if (!eraserOn) {
    eraserIcon.style.color = "white";
    eraserOn = true;
  } else {
    eraserIcon.style.color = "#ce5a67";
    eraserOn = false;
  }
});
// infinite canvas
// window.addEventListener("keydown", (e) => {
//   if (e.key === " ") {
//     ctx.translate(100, 100);
//     console.log("spacebar pressed");
//   }
// });
