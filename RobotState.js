function cos(x) { return Math.cos(x); }
function sin(x) { return Math.sin(x); }
function abs(x) { return Math.abs(x); }
function round4(x) {return Math.round(x*10000)/10000.0; }

function roundVals(vals) {
	for(var i = 0; i < vals.length; i++) 
		vals[i] = Math.round(vals[i]);
	return vals;
}

function makeState(xs, ys, thetas, ds) {
	return {
		x: xs,
		y: ys,
		theta: thetas,
		d: ds,
		totalw1: 0,
		totalw2: 0,
		sensorVals: [false,false,false,false,false,false,false,false],
		
		update: function(w1,w2) {
			var x2 = this.x, y2 = this.y, theta2 = this.theta, 
				x = this.x, y = this.y, theta = this.theta, d = this.d;
				
			this.totalw1 += w1;
			this.totalw2 += w2;
			
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
			
			robotPolys = this.createRobotPolys(x2,y2,theta2);
			for(var j = 0; j < obstPolys.length; j++) {
				for(var i = 0; i < robotPolys.length; i++)
					if(polysIntersect(robotPolys[i], obstPolys[j]))
						return;
			}
			
			this.x = x2;
			this.y = y2;
			this.theta = theta2;
			this.updateLineSensor();
		},
		
		// returns [[x,y],[xc,yc]]
		getPoints: function() {
			var x = this.x, y = this.y, theta = this.theta, d = this.d;
			return [
				[x, y, theta],
				roundVals([x + (d/2.0)*cos(theta), y + (d/2.0)*sin(theta)])
			];
		},
		
		// returns [[x:x1,y:y1],[x:x2,y:y2],[x:x3,y:y3],[x:x4,y:y4]]
		getCorners: function(hx, hy, htheta) {
			var x = hx, y = hy, theta = htheta, d = this.d;
			var x1 = x - (d/2.0)*sin(theta),
				y1 = y + (d/2.0)*cos(theta),
				x2 = x + (d/2.0)*sin(theta),
				y2 = y - (d/2.0)*cos(theta);
			return [
				{x:x1, y:y1},
				{x:x2, y:y2},
				{x:x2+d*cos(theta), y:y2+d*sin(theta)},
				{x:x1+d*cos(theta), y:y1+d*sin(theta)}
			];
		},
		
		// returns [[x1,y1],...,[xN,yN]] where N = NUM_TREDS*2
		getTreds: function() {
			var x = this.x, y = this.y, theta = this.theta, d = this.d, 
				totalw1 = this.totalw1, totalw2 = this.totalw2;
			var x1 = x - (d/2.0+WHEEL_WIDTH/2)*sin(theta),
				y1 = y + (d/2.0+WHEEL_WIDTH/2)*cos(theta),
				x2 = x + (d/2.0+WHEEL_WIDTH/2)*sin(theta),
				y2 = y - (d/2.0+WHEEL_WIDTH/2)*cos(theta);
			var r = d/4, phi1 = -totalw1/r, phi2 = -totalw2/r;
			
			var treds = new Array(2*NUM_TREDS);
			for(var i = 0; i < NUM_TREDS; i++)
				treds[i] = roundVals([x1+r*cos(phi1+i*PI/(NUM_TREDS/2))*cos(theta), 
					y1+r*cos(phi1+i*PI/(NUM_TREDS/2))*sin(theta),
					r*sin(phi1+i*PI/(NUM_TREDS/2))]);
			for(var i = 0; i < NUM_TREDS; i++)
				treds[NUM_TREDS+i] = roundVals([x2+r*cos(phi2+i*PI/(NUM_TREDS/2))*cos(theta), 
					y2+r*cos(phi2+i*PI/(NUM_TREDS/2))*sin(theta),
					r*sin(phi2+i*PI/(NUM_TREDS/2))]);
					
			return treds;
		},
	
		// returns [[[x:x11,y:y11],[],[],[]],[[x:x21,y:y21],[],[],[x:x24,y:y24]]
		getWheels: function(hx, hy, htheta) {
			var x = hx, y = hy, theta = htheta, d = this.d;
			var r = d/4;
			
			var x1c1 = x - (d/2.0)*sin(theta),
				y1c1 = y + (d/2.0)*cos(theta),
				x1c2 = x - (d/2.0+WHEEL_WIDTH)*sin(theta),
				y1c2 = y + (d/2.0+WHEEL_WIDTH)*cos(theta),
				x2c1 = x + (d/2.0)*sin(theta),
				y2c1 = y - (d/2.0)*cos(theta),
				x2c2 = x + (d/2.0+WHEEL_WIDTH)*sin(theta),
				y2c2 = y - (d/2.0+WHEEL_WIDTH)*cos(theta);
				
			return [
				[
					{x:x1c1 + r*cos(theta), y:y1c1 + r*sin(theta)},
					{x:x1c2 + r*cos(theta), y:y1c2 + r*sin(theta)},
					{x:x1c2 - r*cos(theta), y:y1c2 - r*sin(theta)},
					{x:x1c1 - r*cos(theta), y:y1c1 - r*sin(theta)}
				],
				[
					{x:x2c1 + r*cos(theta), y:y2c1 + r*sin(theta)},
					{x:x2c2 + r*cos(theta), y:y2c2 + r*sin(theta)},
					{x:x2c2 - r*cos(theta), y:y2c2 - r*sin(theta)},
					{x:x2c1 - r*cos(theta), y:y2c1 - r*sin(theta)}
				]
			];
		},
		
		getLineSensors: function(hx, hy, htheta) {
			corners = this.getCorners(hx,hy,htheta);
			
			var x1 = corners[2].x, y1 = corners[2].y;
			var points = new Array(8);
			var d = ROBOT_DIM/9;
			for(var i = 0; i < 8; i++) {
				points[i] = {x:x1+(i+1)*d*cos(htheta+PI/2), y:y1+(i+1)*d*sin(htheta+PI/2),
					on:this.sensorVals[i]};
			}
			return points;
		},
		
		updateLineSensor: function() {
			var x = this.x, y = this.y, theta = this.theta;
			
			var sensors = state.getLineSensors(x,y,theta);
			for(var i = 0; i < sensors.length; i++) {
				var sensorCircle = createCircle(sensors[i], LINE_SENSOR_RADIUS);
				var flag = false;
				
				for(var j = 0; j < blackLine.length; j++) {
					var lineCircle = createCircle(blackLine[j], BLACK_LINE_POINT_RADIUS);
					if (circlesIntersect(lineCircle, sensorCircle)) {
						flag = true;
						break;
					}
				}
				
				flag |= circlesIntersect(obstCirc, sensorCircle);
				
				this.sensorVals[i] = flag;
			}
		},
		
		lineSensorText: function() {
			var str = "[", prefix = "";
			for(var i = 0; i < 8; i++) {
				str += prefix+((this.sensorVals[i])?1:0);
				prefix = " ";
			}
			return str+"]";
		},
		
		createRobotPolys: function(hx, hy, htheta) {
			var wheels = this.getWheels(hx, hy, htheta);
			return [
				createPolygon(this.getCorners(hx, hy, htheta)),
				createPolygon(wheels[0]),
				createPolygon(wheels[1])
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