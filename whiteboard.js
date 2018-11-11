document.addEventListener("DOMContentLoaded", function(event) {
	const canvas = document.getElementById('whiteboard');
	const context = initCanvas(canvas);

	initCanvasEvents(canvas, context)
});

function initCanvas(canvas){
	canvas.setAttribute('width', 490);
	canvas.setAttribute('height', 220);
	canvas.setAttribute('id', 'canvas');
	const context = canvas.getContext("2d");
	return context;
}

function initCanvasEvents(canvas, context){
	let paint = false;
	canvas.onmousedown=function(e){
		let mouseX = e.pageX - this.offsetLeft;
		let mouseY = e.pageY - this.offsetTop;

		paint = true;
		addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
		redraw(context);
	};
	canvas.onmouseup=function(e){
		paint = false;
	};
	canvas.onmousemove=function(e){
		if(paint){
			addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
			redraw(context);
		}
	};
	canvas.onmouseleave=function(e){
		paint = false;
	};
}

let clickX = new Array();
let clickY = new Array();
let clickDrag = new Array();

function addClick(x, y, dragging)
{
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
		if(clickDrag[i] && i){
			context.moveTo(clickX[i-1], clickY[i-1]);
		}else{
			context.moveTo(clickX[i]-1, clickY[i]);
		}
		context.lineTo(clickX[i], clickY[i]);
		context.closePath();
		context.stroke();
	}
}

// Set the configuration for your app
// TODO: Replace with your project's config object
firebase.initializeApp(config);

// Get a reference to the database service
var rootRef = firebase.database().ref();


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
