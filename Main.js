var PI = Math.PI;
var WHEEL_WIDTH = 10, NUM_TREDS = 5, W_INC = .1;
var KEY_d = 100, KEY_e = 101, KEY_f = 102, KEY_r = 114, KEY_space = 32,
	KEY_k = 107, KEY_l = 108, KEY_g = 103, KEY_h = 104, KEY_a = 97, KEY_s = 115,
	KEY_w = 119;
var SIZEX = 600, SIZEY = 600;
var ROBOT_DIM = 60, ROBOT_START_ANGLE = 0;
var LINE_SENSOR_RADIUS = 4;
var DIST_SENSOR_CAP = 400;

var state;
var vel1 = 0, vel2 = 0;

var obstPolys = [];

var BLACK_LINE_SCALER = [676, 756]; 
var BLACK_LINE_SCALEX, BLACK_LINE_SCALEY;
var BLACK_LINE_POINT_RADIUS = 1;

var obstCirc;

var lineFollowerOn = false,
	wallFollowerOn = false,
	customOn = false;

function main() {
	var canvas = document.getElementById("right_elem");
	
	getBrowserWindowSizeInit();
	browserSize = getSize();
	SIZEX = (browserSize.width/2)-10;
	SIZEY = browserSize.height-20;
	console.log("the field is "+SIZEX+" by "+SIZEY);
	setSizes(SIZEX, SIZEY);
	BLACK_LINE_SCALEX = SIZEX/BLACK_LINE_SCALER[0];
	BLACK_LINE_SCALEY = SIZEY/BLACK_LINE_SCALER[1];
	
	state = makeState(blackLine[0].x*BLACK_LINE_SCALEX+30, 
		blackLine[0].y*BLACK_LINE_SCALEY,
		ROBOT_START_ANGLE, ROBOT_DIM);
	//state = makeState(SIZEX/2,SIZEY/2+100,ROBOT_START_ANGLE,ROBOT_DIM);
	
	for(var i = 0; i < blackLine.length; i++) {
		blackLine[i].x = blackLine[i].x*BLACK_LINE_SCALEX;
		blackLine[i].y = blackLine[i].y*BLACK_LINE_SCALEY;
	}
	
	obstPolys.push(createBox(0,0,5,SIZEY));
	obstPolys.push(createBox(SIZEX-5,0,5,SIZEY));
	obstPolys.push(createBox(0,0,SIZEX,5));
	obstPolys.push(createBox(0,SIZEY-5,SIZEX,5));
	obstPolys.push(createBox(0,0,2*SIZEX/7,3*SIZEY/7));
	obstPolys.push(createBox(5*SIZEX/7,0,2*SIZEX/7,3*SIZEY/7));
	
	obstCirc = createCircle({x:SIZEX/2, y:SIZEY/2-100}, 50);
	
	state.updateLineSensor();
	state.updateDistSensor();
	
	setInterval("repaint();", 30);
	setInterval("updateState();", 60);
	
	ls_main();
	wf_main();
	
	dispCode("http://192.168.0.10/~robbynevels/RobotSimulator/Custom.js");
}

function setSizes(width, height) {
	var txt = document.createTextNode(
		".right_half { width: "+width+"; height: "+height+"; } "+
		".bottom_right_half { width: "+width+"; height: "+50+"; } "+
		".top_right_half { width: "+width+"; height: "+30+"; } "+
		".left_half { width: "+width+"; height: "+(height-80)+"; }");
	var extraStyle = document.createElement("style");
	extraStyle.appendChild(txt);
	
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(extraStyle);
	
	document.getElementById("right_elem").className = "right_half";
	document.getElementById("bottom_right_elem").className = "bottom_right_half";
	document.getElementById("top_right_elem").className = "top_right_half";
	document.getElementById("left_elem").className = "left_half";
	document.getElementById("right_elem").width = width;
	document.getElementById("right_elem").height = height;
}

function dispCode(url) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if(request.readyState == 4 && request.status == 200) {
			document.getElementById("left_elem").value = request.responseText;
		}
	};
	request.open("GET", url);
	request.send(null);
}

function loadCode() {
	var txt = document.createTextNode(document.getElementById("left_elem").value);
	var extraScript = document.createElement("script");
	extraScript.appendChild(txt);
	
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(extraScript);
}

function buttonPressed(event) {
	loadCode();
	cp_main();
}

function keyPressed(event) {
	event.preventDefault(); // freaking dumb firefox quickfind bull.
	var key = event.which;
	console.log(key);
	
	var nvel1 = vel1, nvel2 = vel2;
	if (!wallFollowerOn && !lineFollowerOn) {	
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
	} 
	
	if (key == KEY_a && !wallFollowerOn && !customOn) {
		lineFollowerOn = !lineFollowerOn;
		if (!lineFollowerOn) {
			nvel1 = nvel2 = 0;
		}
	} else if (key == KEY_s && !lineFollowerOn && !customOn) {
		wallFollowerOn = !wallFollowerOn;
		if (!wallFollowerOn) {
			nvel1 = nvel2 = 0;
		}
	} else if (key == KEY_w && !lineFollowerOn && !wallFollowerOn) {
		customOn = !customOn;
		if (!customOn) {
			nvel1 = nvel2 = 0;
		}
	} 
	
	if (key == KEY_space) {
		nvel1 = nvel2 = 0;
		wallFollowerOn = lineFollowerOn = customOn = false;
	}
	
	vel1 = round4(nvel1);
	vel2 = round4(nvel2);
}

function updateState() {
	//console.log("updating: "+vel1+","+vel2);
	
	if (vel1 != 0 || vel2 != 0) {
		state.update(vel1*3,vel2*3);
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
	
	// treds
	g2.lineWidth = 3;
	g2.strokeStyle = "darkblue";
	for(var i = 0; i < treds.length; i++) {
		g2.beginPath();
		g2.arc(treds[i][0],treds[i][1],WHEEL_WIDTH/2+treds[i][2]/6,0,2*Math.PI,true);
		g2.closePath();
		g2.fill();
	}
	
	// line sensor
	var sensors = state.getLineSensors(vals[0][0],vals[0][1],vals[0][2]);
	for(var i = 0; i < sensors.length; i++) {
		g2.fillStyle = (sensors[i].on) ? "darkgreen" : "darkgray";
		g2.beginPath();
		g2.arc(sensors[i].x,sensors[i].y,LINE_SENSOR_RADIUS,0,2*Math.PI,true);
		g2.closePath();
		g2.fill();
	}
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
	g2.lineWidth = BLACK_LINE_POINT_RADIUS*4;
	g2.beginPath();
	g2.moveTo(blackLine[0].x,blackLine[0].y);
	for(var i = 0; i < blackLine.length; i+=10) {
		//g2.arc(blackLine[i].x, blackLine[i].y, BLACK_LINE_POINT_RADIUS*2, 0, 2*Math.PI, true);
		g2.lineTo(blackLine[i].x,blackLine[i].y);
	}
	//g2.fill();	
	g2.stroke();
}

function drawBlackCirc(g2) {
	g2.fillStyle = "black";
	g2.beginPath();
	g2.arc(obstCirc.p.x, obstCirc.p.y, obstCirc.r, 0,2*Math.PI,true);
	g2.closePath();
	g2.fill();
}

function drawDistSensor(g2) {
	var cpoint = state.getPoints()[1];
	g2.lineWidth = 1;
	g2.strokeStyle = "purple";
	
	g2.beginPath();
	for(var i = 0; i < 3; i++) {
		g2.moveTo(cpoint[0], cpoint[1]);
		g2.lineTo(state.distSensor[i].p.x, state.distSensor[i].p.y);
	}
	g2.closePath();
	g2.stroke();
}

function repaint() {
	//console.log("repainting!");
	
	var canvas = document.getElementById("right_elem");
	var g2 = canvas.getContext("2d");
	
	// clear the background
	g2.fillStyle = "lightblue";
	g2.fillRect(0,0,SIZEX,SIZEY);
	
	drawBlackCirc(g2);
	drawBlackLine(g2);
	drawRobot(g2);
	drawObstacles(g2);
	drawDistSensor(g2);
	
	// text
	g2.fillStyle = "white";
	g2.font = "bold 1em courier new"; 
	g2.textalign = "right"; 
	g2.fillText("left motor:  "+vel1, 10, 20);
	g2.fillText("right motor: "+vel2, 10, 40);
	g2.fillText("left wheel:  "+Math.round(state.totalw1), 10, 60);
	g2.fillText("right wheel: "+Math.round(state.totalw2), 10, 80);
	g2.fillText("line: "+state.lineSensorText(), 10, 100);
	g2.fillText("left d:  "+Math.round(state.distSensor[0].dist), 10, 120);
	g2.fillText("front d: "+Math.round(state.distSensor[1].dist), 10, 140);
	g2.fillText("right d: "+Math.round(state.distSensor[2].dist), 10, 160);
	
	g2.fillText("Controls", SIZEX-180, 20); 
	g2.fillText("left motor:  e/d", SIZEX-180, 40);
	g2.fillText("right motor: r/f", SIZEX-180, 60);
	g2.fillText("line following: a", SIZEX-180, 80);
	g2.fillText("wall following: s", SIZEX-180, 100);
	g2.fillText("custom program: w", SIZEX-180, 120);
	g2.fillText("stop: space", SIZEX-180, 140);
}







































