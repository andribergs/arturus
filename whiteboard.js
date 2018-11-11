const canvasConfig = {
	width: 512,
	height: 512,
}

document.addEventListener("DOMContentLoaded", main);

function main() {
	const canvas = document.getElementById('whiteboard');
	canvas.style.border = "1px solid black";
	const context = initCanvas(canvas);

	canvasConfig.database = new Database(config, ()=>{redraw(context);});

	initCanvasEvents(canvas, context)
};

function initCanvas(canvas){
	canvas.setAttribute('width', canvasConfig.width);
	canvas.setAttribute('height', canvasConfig.height);
	return canvas.getContext("2d");
}

function initCanvasEvents(canvas, context){
	let paint = false;
	let drawingLine = true;

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
		paint = false;
		clickX = [];
		clickY = [];
		clickDrag = [];
		if(drawingLine) addLineToDatabase();
		drawingLine = false;
		redraw(context);
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
		paint = false;
		clickX = [];
		clickY = [];
		clickDrag = [];
		if(drawingLine)	addLineToDatabase();
		drawingLine = false;
		redraw(context);
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
	console.log(`drawing object: ${object}`);
	context.strokeStyle = "#df4b26";
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

	context.strokeStyle = "#df4b26";
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

