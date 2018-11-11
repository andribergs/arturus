const canvasConfig = {
	width: 512,
	height: 512,
}

document.addEventListener("DOMContentLoaded", function(event) {
	const canvas = document.getElementById('whiteboard');
	const context = initCanvas(canvas);

	initCanvasEvents(canvas, context)
});

function initCanvas(canvas){
	canvas.setAttribute('width', canvasConfig.width);
	canvas.setAttribute('height', canvasConfig.height);
	return canvas.getContext("2d");
}

function initCanvasEvents(canvas, context){
	let paint = false;

	canvas.onmousedown = function(e) {
		let mouseX = e.pageX - this.offsetLeft;
		let mouseY = e.pageY - this.offsetTop;

		paint = true;
		addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
		redraw(context);
	};

	canvas.onmouseup = function(e) { 
		paint = false;
	};

	canvas.onmousemove = function(e) {
		if(paint) {
			addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
			redraw(context);
		}
	};

	canvas.onmouseleave = function(e) {
		paint = false;
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
}


firebase.initializeApp(config);

const rootRef = firebase.database().ref();

rootRef.on('child_changed', function(data) {
	console.log("child_changed", data.val());
});

rootRef.on('child_added', function(data) {
	console.log("child_added", data.val());
});

rootRef.on('child_removed', function(data) {
	console.log("child_removed", data.val());
});

rootRef.once('value').then(function(snapshot) {
	console.log("value", snapshot.val());
});

function addLine(name, points){
	update = {};
	update[name] = points;
	rootRef.update(update);
}
