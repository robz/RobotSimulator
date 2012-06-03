// returns booleans [s1,s2,s3,s4,s5,s6,s7,s8]
function readLineSensor() {
	return state.sensorVals;
}

// returns [left, center, right]
function readDistSensor() {
	return {left:state.distSensor[0].dist, 
		center:state.distSensor[1].dist, 
		right:state.distSensor[2].dist};
}

// returns [left enc, right enc]
function readEncoders() {
	return [state.totalw2, state.totalw1];
}

// expects powi to be range [-1,1]
// expecting pow1=left, pow2=right
function setMotorPowers(pow1, pow2) {
	if (pow1 < -1 || pow1 > 1 || pow2 < -1 || pow2 > 1) return false;
	vel2 = pow1;
	vel1 = pow2;
}