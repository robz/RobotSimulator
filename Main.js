function cos(x) { return Math.cos(x); }
function sin(x) { return Math.sin(x); }
function abs(x) { return Math.abs(x); }
function round4(x) {return Math.round(x*10000)/10000.0; }

function makeState(xs, ys, thetas, ds) {
	return {
		x: xs,
		y: ys,
		theta: thetas,
		d: ds,
		
		update: function(w1,w2) {
			var x2 = this.x, y2 = this.y, theta2 = this.theta, 
				x = this.x, y = this.y, theta = this.theta, d = this.d;
			
			if(w1 == w2) {
				x2 = x + w1*cos(theta);
				y2 = y + w1*sin(theta);
				theta2 = theta;
			} else if (w1 > w2 && w2 >= 0) {
				var phi = (w1-w2)/d,
					r = d*(w1+w2)/(2*(w1-w2));
				x2 = x + r*( sin(theta) + sin(phi-theta) );
				y2 = y + r*( -cos(theta) + cos(theta-phi) );
				theta2 = theta - phi;
			} else if (w2 > w1 && w1 >= 0) {
				var phi = (w2-w1)/d,
					r = d*(w1+w2)/(2*(w2-w1));
				x2 = x + r*( -sin(theta) + sin(theta+phi) );
				y2 = y + r*( cos(theta) - cos(theta+phi) );
				theta2 = theta + phi;
			} else if (w1 < w2 && w2 <= 0) {
				w1 = abs(w1);
				w2 = abs(w2);
				var phi = (w1-w2)/d,
					r = d*(w1+w2)/(2*(w1-w2));
				x2 = x + r*( sin(theta) - sin(theta+phi) );
				y2 = y + r*( -cos(theta) + cos(theta+phi) );
				theta2 = theta + phi;
			} else if (w2 < w1 && w1 <= 0) {
				w1 = abs(w1);
				w2 = abs(w2);
				var phi = (w2-w1)/d,
					r = d*(w1+w2)/(2*(w2-w1));
				x2 = x + r*( -sin(theta) + sin(theta-phi) );
				y2 = y + r*( cos(theta) - cos(theta-phi) );
				theta2 = theta - phi;
			} else if (w1 > 0 && w2 < 0 && abs(w1) >= abs(w2)) {
				w2 = abs(w2);
				var phi = (w1+w2)/d,
					z = d*(w1-w2)/(2*(w1+w2));
				x2 = x + z*( sin(theta) - sin(theta-phi) );
				y2 = y + z*( -cos(theta) + cos(theta-phi) );
				theta2 = theta - phi;
			} else if (w1 < 0 && w2 > 0 && abs(w2) >= abs(w1)) {
				w1 = abs(w1);
				var phi = (w1+w2)/d,
					z = d*(w2-w1)/(2*(w1+w2));
				x2 = x + z*( -sin(theta) + sin(theta+phi) );
				y2 = y + z*( cos(theta) - cos(theta+phi) );
				theta2 = theta+phi;
			} else if (w1 > 0 && w2 < 0 && abs(w1) <= abs(w2)) {
				w2 = abs(w2);
				var phi = (w1+w2)/d,
					z = d*(w1-w2)/(2*(w1+w2));
				x2 = x + z*( sin(theta) - sin(theta-phi) );
				y2 = y + z*( -cos(theta) + cos(theta-phi) );
				theta2 = theta-phi;
			} else if (w1 < 0 && w2 > 0 && abs(w2) <= abs(w1)) {
				w1 = abs(w1);
				var phi = (w1+w2)/d,
					z = d*(w2-w1)/(2*(w1+w2));
				x2 = x + z*( -sin(theta) + sin(theta+phi) );
				y2 = y + z*( cos(theta) - cos(theta+phi) );
				theta2 = theta + phi;
			} else {
				console.log("ERROR: "+w1+","+w2);
				while(true);
			}
			
			this.x = x2;
			this.y = y2;
			this.theta = theta2;
		},
		
		// returns {xa,ya,xb,yb,xc,yc,x,y,d}
		getVals: function() {
			var x = this.x, y = this.y, theta = this.theta, d = this.d;
			return [
				x - (d/2.0)*sin(theta),
				y + (d/2.0)*cos(theta),
				x + (d/2.0)*sin(theta),
				y - (d/2.0)*cos(theta),
				x + (d/2.0)*cos(theta),
				y + (d/2.0)*sin(theta),
				x, y, d
			];
		},
		
		toString: function() {
			var x_approx = round4(this.x),
				y_approx = round4(this.y),
				theta_approx = round4(this.theta);
			return "("+x_approx+","+y_approx+") ; "+theta_approx;
		}
	};
}

var state;
var vel1 = 0, vel2 = 0;

var SIZEX, SIZEY;
var KEY_d = 100, KEY_e = 101, KEY_f = 102, KEY_r = 114;
var W_INC = .1;

function main() {
	var canvas = document.getElementById("myCanvas");
	SIZEX = canvas.width;
	SIZEY = canvas.height;
	
	state = makeState(SIZEX/2,SIZEY/2,0,SIZEX/10);
	setInterval("repaint();", 17);
	setInterval("updateState();", 20);
	
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
	
	if (vel1 != 0 || vel2 != 0)
		state.update(vel1,vel2);
}

function roundVals(vals) {
	var intvals = new Array(vals.length);
	for(var i = 0; i < vals.length; i++) {
		intvals[i] = Math.round(vals[i]);
	}
	return intvals;
}

function repaint() {
	//console.log("repainting!");
	
	var vals = roundVals(state.getVals());
	
	var canvas = document.getElementById("myCanvas");
	var g2 = canvas.getContext("2d");
	
	g2.fillStyle = "lightblue";
	g2.fillRect(0,0,SIZEX,SIZEY);
	
	g2.fillStyle = "gray";
	g2.arc(vals[6],vals[7],vals[8]/2.0,0,2*Math.PI,true);
	g2.fill();
	
	g2.beginPath();
	g2.moveTo(vals[0],vals[1]);
	g2.lineTo(vals[2],vals[3]);
	g2.moveTo(vals[6],vals[7]);
	g2.lineTo(vals[4],vals[5]);
	g2.closePath();
	g2.stroke();
	
	g2.fillStyle = "black";
	g2.font = "bold 1em sans-serif"; 
	g2.textalign = "right"; 
	g2.fillText("motor 1: "+vel1, 20, 20);
	g2.fillText("motor 2: "+vel2, 20, 40);
}