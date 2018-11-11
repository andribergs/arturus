const canvasConfig = {
	width: 512,
	height: 512,
	strokeStyle: "#df4b26",
	zoomLevels: [0.1, 0.2, 0.5, 0.75, 0.8, 0.9, 1, 1.5, 2, 2.5, 3],
	zoomLevel: 6,
	offset: [0, 0],
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
};

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


function initEvents(context){
	const clearCanvasButton = document.getElementById('clear');
	clearCanvasButton.onclick = () => {
		canvasConfig.database.removeAllObjects();
	}

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
		console.log(canvasConfig.zoomLevel, canvasConfig.zoomLevels[canvasConfig.zoomLevel]);
		redraw(context);
	});

	addTool("-", ()=>{
		canvasConfig.zoomLevel = Math.max(0, canvasConfig.zoomLevel-1);
		console.log(canvasConfig.zoomLevel, canvasConfig.zoomLevels[canvasConfig.zoomLevel]);
		redraw(context);
	})
}

function initCanvasEvents(canvas, context){
	let paint = false;
	let drawingLine = false;

	let xs = [];
	let ys = [];
	let s = 1/canvasConfig.zoomLevels[canvasConfig.zoomLevel];


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
		console.log(s);
		drawingLine = true;
		paint = true;
		const x = s*(e.pageX - this.offsetLeft);
		const y = s*(e.pageY - this.offsetTop);
		xs.push(x);
		ys.push(y);
		addClick(x, y);

		redraw(context);
	};

	canvas.onmouseup = function(e) { 
		stopDrawing();
	};

	canvas.onmousemove = function(e) {
		const x = s*(e.pageX - this.offsetLeft);
		const y = s*(e.pageY - this.offsetTop);
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
	context.strokeStyle = object.color;
	context.lineCap = "round";
	context.lineWidth = 5*s;
	if(object.type === "line") {
		const points = object.points;
		context.beginPath();
		context.moveTo(s*points[0][0], s*points[1][0]);
		for(let i=1; i<points[0].length; i++){
			context.lineTo(s*points[0][i], s*points[1][i]);
		}
		context.stroke();
	}
}

function redraw(context){
	context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
	const s = canvasConfig.zoomLevels[canvasConfig.zoomLevel];

	context.strokeStyle = canvasConfig.strokeStyle;
	context.lineJoin = "round";
	context.lineWidth = 5*s;

	canvasConfig.database.getAllObjects().forEach(object => { drawObject(object, context); } );

	for(var i=0; i < clickX.length; i++) {
		context.beginPath();
		if(clickDrag[i] && i) {
			context.moveTo(s*clickX[i-1], s*clickY[i-1]);
		} else {
			context.moveTo(s*clickX[i]-1, s*clickY[i]);
		}
		context.lineTo(s*clickX[i], s*clickY[i]);
		context.closePath();
		context.stroke();
	}

}

