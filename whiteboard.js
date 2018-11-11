const canvasConfig = {
	width: 512,
	height: 512,
	strokeStyle: "#df4b26",
}

document.addEventListener("DOMContentLoaded", main);

function main() {
	const canvas = document.getElementById('whiteboard');
	canvas.style.border = "1px solid black";
	const context = initCanvas(canvas);

	canvasConfig.database = new Database(config, ()=>{redraw(context);});

	initCanvasEvents(canvas, context)
	initEvents()
};

function initCanvas(canvas){
	canvas.setAttribute('width', canvasConfig.width);
	canvas.setAttribute('height', canvasConfig.height);
	return canvas.getContext("2d");
}

function initEvents(){
	const clearCanvasButton = document.getElementById('clear');
	const colorSelect = document.getElementById('colorpicker');
	clearCanvasButton.onclick = () => {
		canvasConfig.database.removeAllObjects();
	}
	colorSelect.onchange = (e) => {
		const color = e.target.selectedOptions[0].value;
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
	}
}

function initCanvasEvents(canvas, context){
	let paint = false;
	let drawingLine = false;

	let xs = [];
	let ys = [];

	const addLineToDatabase = function() {
		const line = {
			type: "line",
			points: [xs, ys],
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
		drawingLine = true;
		paint = true;
		const x = e.pageX - this.offsetLeft;
		const y = e.pageY - this.offsetTop;
		xs.push(x);
		ys.push(y);
		addClick(x, y);

		redraw(context);
	};

	canvas.onmouseup = function(e) { 
		stopDrawing();
	};

	canvas.onmousemove = function(e) {
		const x = e.pageX - this.offsetLeft;
		const y = e.pageY - this.offsetTop;
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
	context.strokeStyle = canvasConfig.strokeStyle;
	context.lineJoin = "round";
	context.lineWidth = 5;
	if(object.type === "line") {
		const points = object.points;
		context.beginPath();
		context.moveTo(points[0][0], points[1][0]);
		for(let i=1; i<points[0].length; i++){
			context.lineTo(points[0][i], points[1][i]);
		}
		context.stroke();
	}
}

function redraw(context){
	context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

	context.strokeStyle = canvasConfig.strokeStyle;
	context.lineJoin = "round";
	context.lineWidth = 5;

	for(var i=0; i < clickX.length; i++) {
		context.beginPath();
		if(clickDrag[i] && i) {
			context.moveTo(clickX[i-1], clickY[i-1]);
		} else {
			context.moveTo(clickX[i]-1, clickY[i]);
		}
		context.lineTo(clickX[i], clickY[i]);
		context.closePath();
		context.stroke();
	}

	canvasConfig.database.getAllObjects().forEach(object => { drawObject(object, context); } );
}

