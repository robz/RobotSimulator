var PI = Math.PI;
var WHEEL_WIDTH = 10, NUM_TREDS = 5, W_INC = .1;
var KEY_d = 100, KEY_e = 101, KEY_f = 102, KEY_r = 114;
var SIZEX = 600, SIZEY = 600;
var ROBOT_DIM = 60, ROBOT_START_ANGLE = 0;

var state;
var vel1 = 0, vel2 = 0;

var obstPolys = [];

var BLACK_LINE_SCALER = [1403, 675];
var BLACK_LINE_SCALEX, BLACK_LINE_SCALEY;

function main() {
	var canvas = document.getElementById("myCanvas");
	
	getBrowserWindowSizeInit();
	browserSize = getSize();
	SIZEX = browserSize.width-30;
	SIZEY = browserSize.height-50;
	canvas.width = SIZEX;
	canvas.height = SIZEY;
	console.log("the field is "+SIZEX+" by "+SIZEY);
	BLACK_LINE_SCALEX = SIZEX/BLACK_LINE_SCALER[0];
	BLACK_LINE_SCALEY = SIZEY/BLACK_LINE_SCALER[1];
	
	state = makeState(blackLine[0].x*BLACK_LINE_SCALEX+20, blackLine[0].y*BLACK_LINE_SCALEY,
		ROBOT_START_ANGLE, ROBOT_DIM);
	//state = makeState(SIZEX/2,SIZEY/2+100,ROBOT_START_ANGLE,ROBOT_DIM);
	setInterval("repaint();", 17);
	setInterval("updateState();", 20);
	
	obstPolys.push(createBox(0,0,5,SIZEY));
	obstPolys.push(createBox(SIZEX-5,0,5,SIZEY));
	obstPolys.push(createBox(0,0,SIZEX,5));
	obstPolys.push(createBox(0,SIZEY-5,SIZEX,5));
	obstPolys.push(createBox(0,0,SIZEX/3,SIZEY/2));
	obstPolys.push(createBox(2*SIZEX/3,0,SIZEX/3,SIZEY/2));
	
	canvas.onkeypress = keyPressed;
}

function keyPressed(event) {
	var key = event.which;
	//console.log(key);
	
	var nvel1 = vel1, nvel2 = vel2;
	if (key == KEY_r) {
		if (vel1 < W_INC*10)
			nvel1 += W_INC;
	} else if (key == KEY_f) {
		if (vel1 > -W_INC*10)
			nvel1 -= W_INC;
	} else if (key == KEY_e) {
		if (vel2 < W_INC*10)
			nvel2 += W_INC;
	} else if (key == KEY_d) {
		if (vel2 > -W_INC*10)
			nvel2 -= W_INC;
	} 
	
	vel1 = round4(nvel1);
	vel2 = round4(nvel2);
}

function updateState() {
	//console.log("updating: "+vel1+","+vel2);
	
	if (vel1 != 0 || vel2 != 0) {
		state.update(vel1,vel2);
	}
}

function drawPoly(g2, poly) {
	g2.beginPath();
	g2.moveTo(poly.points[0].x, poly.points[0].y);
	for(var i = 1; i < poly.points.length; i++) 
		g2.lineTo(poly.points[i].x, poly.points[i].y);
	g2.closePath();
	g2.fill();
}

function drawRobot(g2) {
	var vals = state.getPoints();
	var treds = state.getTreds();
	var robotPolys = state.createRobotPolys(vals[0][0],vals[0][1],vals[0][2]);
	
	g2.fillStyle = "gray"; 
	for(var j = 0; j < robotPolys.length; j++) {
		drawPoly(g2,robotPolys[j]); 
		g2.fillStyle = "darkblue";
	}
	
	// treds
	g2.lineWidth = 3;
	g2.strokeStyle = "darkblue";
	for(var i = 0; i < treds.length; i++) {
		g2.arc(treds[i][0],treds[i][1],WHEEL_WIDTH/2+treds[i][2]/6,0,2*Math.PI,true);
	}
	g2.fill();
	
	// axis & direction lines
	var corners = robotPolys[0];
	g2.strokeStyle = "darkgray";
	g2.beginPath();
	g2.moveTo(corners.points[0].x,corners.points[0].y);
	g2.lineTo(corners.points[1].x,corners.points[1].y);
	g2.moveTo(vals[0][0],vals[0][1]);
	g2.lineTo(vals[1][0],vals[1][1]);
	g2.closePath();
	g2.stroke();
	
	// line sensor
	var sensors = state.getLineSensorPoints(vals[0][0],vals[0][1],vals[0][2]);
	for(var i = 0; i < sensors.length; i++) {
		g2.fillStyle = (sensors[i].on) ? "darkgreen" : "white";
		g2.arc(sensors[i].x,sensors[i].y,4,0,2*Math.PI,true);
	}
	g2.fill();
}

function drawObstacles(g2) {
	g2.fillStyle = "brown";
	for(var j = 0; j < obstPolys.length; j++) 
		drawPoly(g2,obstPolys[j]);
}

function drawBlackLine(g2) {
	if (blackLine.length == 0) return;
	g2.strokeStyle = "black";
	//g2.fillStyle = "black";
	g2.lineWidth = 10;
	g2.moveTo(blackLine[0].x*BLACK_LINE_SCALEX,blackLine[0].y*BLACK_LINE_SCALEY);
	for(var i = 0; i < blackLine.length; i++) {
		//g2.arc(blackLine[i].x*BLACK_LINE_SCALEX,blackLine[i].y*BLACK_LINE_SCALEY,10,0,2*Math.PI,true);
		g2.lineTo(blackLine[i].x*BLACK_LINE_SCALEX,blackLine[i].y*BLACK_LINE_SCALEY);
	}
	//g2.fill();
		
	g2.stroke();
}

function repaint() {
	//console.log("repainting!");
	
	var canvas = document.getElementById("myCanvas");
	var g2 = canvas.getContext("2d");
	
	// clear the background
	g2.fillStyle = "lightblue";
	g2.fillRect(0,0,SIZEX,SIZEY);
	
	//drawBlackLine(g2);
	drawRobot(g2);
	drawObstacles(g2);
	
	// text
	g2.fillStyle = "white";
	g2.font = "bold 1em sans-serif"; 
	g2.textalign = "right"; 
	g2.fillText("motor 1: "+vel1, 20, 20);
	g2.fillText("motor 2: "+vel2, 20, 40);
	g2.fillText("wheel 1: "+Math.round(state.totalw1), 20, 60);
	g2.fillText("wheel 2: "+Math.round(state.totalw2), 20, 80);
}