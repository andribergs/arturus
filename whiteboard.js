const canvasConfig = {
	width: 512,
	height: 512,
	strokeStyle: "#df4b26",
	zoomLevels: [0.1, 0.2, 0.5, 0.75, 0.8, 0.9, 1, 1.5, 2, 2.5, 3],
	zoomLevel: 6,
	centerPos: [0, 0],
	scrollSpeed: 10,
	keyStates: {},
	redrawScheduled: true,
}

function keyIsDown(keyName) {
	return (canvasConfig.keyStates[keyName] === undefined) ? false : canvasConfig.keyStates[keyName];
}

function setKey(keyName, state){
	canvasConfig.keyStates[keyName] = state;
}

document.addEventListener("DOMContentLoaded", main);

function main() {
	const canvas = document.getElementById('whiteboard');
	const context = initCanvas(canvas);
	canvas.width = window.innerWidth || document.body.clientWidth;
	canvas.height = window.innerHeight || document.body.clientHeight;

	canvasConfig.database = new Database(config, ()=>{redraw(context);});

	initCanvasEvents(canvas, context);
	initEvents(context);

	gameLoop(1, context);
};

let old_timestamp = undefined;

function gameLoop(du, context) {
	updateOffset(du);
	if(canvasConfig.redrawScheduled) {
		redraw(context);
	}
	requestAnimationFrame(timestamp => {
		if (old_timestamp === undefined) {
			old_timestamp = timestamp;
			gameLoop(1, context);
		} else {
			const new_du = timestamp - old_timestamp;
			old_timestamp = timestamp;
			gameLoop(new_du, context);
		}
	});
}

function initCanvas(canvas){
	canvas.setAttribute('width', canvasConfig.width);
	canvas.setAttribute('height', canvasConfig.height);
	return canvas.getContext("2d");
}

function addTool(name, callback){
	const toolsContainer = document.getElementById("tools");
	const button = document.createElement("button");
	button.textContent = name;
	button.addEventListener("click", callback);
	toolsContainer.appendChild(button);
}

function scheduleRedraw() {
	canvasConfig.redrawScheduled = true;
}

function updateOffset(du) {
	if(keyIsDown("ArrowLeft")) {
			canvasConfig.centerPos[0] -= canvasConfig.scrollSpeed;
			scheduleRedraw();
	}

	if(keyIsDown("ArrowUp")) {
			canvasConfig.centerPos[1] -= canvasConfig.scrollSpeed;
			scheduleRedraw();
	}
	
	if(keyIsDown("ArrowRight")) {
			canvasConfig.centerPos[0] += canvasConfig.scrollSpeed;
			scheduleRedraw();
	}

	if(keyIsDown("ArrowDown")) {
			canvasConfig.centerPos[1] += canvasConfig.scrollSpeed;
			scheduleRedraw();
	}
}

function initEvents(context) {
	const clearCanvasButton = document.getElementById('clear');
	clearCanvasButton.onclick = () => {
		canvasConfig.database.removeAllObjects();
	}

	document.addEventListener("keyup", e=>{
		const keyName = e.key;
		setKey(keyName, false);
	});

	document.addEventListener("keydown", e=>{
		const keyName = e.key;
		setKey(keyName, true);
	});

	const colorSelect = document.getElementById('colorpicker');
	colorSelect.addEventListener("change", e => {
		const color = e.target.value;
		switch (color) {
			case "black":
				canvasConfig.strokeStyle = "#000000"
				break;
			case "green":
				canvasConfig.strokeStyle = "#00FF00"
				break;
			case "red":
				canvasConfig.strokeStyle = "#df4b26"
				break;
			case "yellow":
				canvasConfig.strokeStyle = "#999900"
				break;
			default:
				break;
		}
	});

	addTool("+", () => {
		canvasConfig.zoomLevel = Math.min(canvasConfig.zoomLevel+1, canvasConfig.zoomLevels.length);
		redraw(context);
	});

	addTool("-", () => {
		canvasConfig.zoomLevel = Math.max(0, canvasConfig.zoomLevel-1);
		redraw(context);
	});
}

function initCanvasEvents(canvas, context){
	let paint = false;
	let drawingLine = false;

	let xs = [];
	let ys = [];
	let s = 1/canvasConfig.zoomLevels[canvasConfig.zoomLevel];
	let c = canvasConfig.centerPos;
	let cx = c[0];
	let cy = c[1];

	const addLineToDatabase = function() {
		const line = {
			type: "line",
			points: [xs, ys],
			color: canvasConfig.strokeStyle,
		}
		canvasConfig.database.addObject(line);
		xs = [];
		ys = [];
	}

	const stopDrawing = function() {
		paint = false;
		clickX = [];
		clickY = [];
		clickDrag = [];
		if(drawingLine)	addLineToDatabase();
		drawingLine = false;
		redraw(context);
	}

	canvas.onmousedown = function(e) {
		s = 1/canvasConfig.zoomLevels[canvasConfig.zoomLevel];
	  c = canvasConfig.centerPos;
	  cx = c[0];
	  cy = c[1];
		drawingLine = true;
		paint = true;
		const x = -cx + s * (e.pageX - this.offsetLeft);
		const y = -cy + s * (e.pageY - this.offsetTop);
		xs.push(x);
		ys.push(y);
		addClick(x, y);

		redraw(context);
	};

	canvas.onmouseup = function(e) { 
		stopDrawing();
	};

	canvas.onmousemove = function(e) {
		const x = -cx + s * (e.pageX - this.offsetLeft);
		const y = -cy + s * (e.pageY - this.offsetTop);
		if(paint) {
			addClick(x, y, true);
			redraw(context);
		}

		if(drawingLine) {
			xs.push(x);
			ys.push(y);
		}
	};


	canvas.onmouseleave = function(e) {
		stopDrawing();
	};
}

let clickX = [];
let clickY = [];
let clickDrag = [];

function addClick(x, y, dragging) {
	clickX.push(x);
	clickY.push(y);
	clickDrag.push(dragging);
}

function drawObject(object, context) {
	const s = canvasConfig.zoomLevels[canvasConfig.zoomLevel];
	const o = canvasConfig.centerPos;
	const cx = o[0];
	const cy = o[1];
	context.strokeStyle = object.color;
	context.lineCap = "round";
	context.lineWidth = 5*s;
	if(object.type === "line") {
		const points = object.points;
		context.beginPath();
		context.moveTo(cx + s * points[0][0], cy + s * points[1][0]);
		for(let i=1; i<points[0].length; i++){
			context.lineTo(cx + s * points[0][i], cy + s * points[1][i]);
		}
		context.stroke();
	}
}

function redraw(context){
	context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
	const s = canvasConfig.zoomLevels[canvasConfig.zoomLevel];
	const o = canvasConfig.centerPos;
	const cx = o[0];
	const cy = o[1];

	context.strokeStyle = canvasConfig.strokeStyle;
	context.lineJoin = "round";
	context.lineWidth = 5*s;

	canvasConfig.database.getAllObjects().forEach(object => { drawObject(object, context); } );

	for(var i=0; i < clickX.length; i++) {
		context.beginPath();
		if(clickDrag[i] && i) {
			context.moveTo(cx + s * clickX[i-1], cy + s * clickY[i-1]);
		} else {
			context.moveTo(cx + s * clickX[i]-1, cy + s * clickY[i]);
		}
		context.lineTo(cx + s * clickX[i], cy + s * clickY[i]);
		context.closePath();
		context.stroke();
	}

	canvasConfig.redrawScheduled = false;
}

