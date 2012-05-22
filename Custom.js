var cp_pow1 = 0, cp_pow2 = 0;

function cp_main() {
	console.log("initializing custom program!");
	cp_pow1 = .5;
	cp_pow2 = .5;
	setInterval("cp_loop();", 100);
}

function cp_loop() {
	if(!customOn) return;
	
	var leftDist = readDistSensor()[0];
	var normal = leftDist-100;
	if (normal < -10) {
		cp_pow1 = .4;
		cp_pow2 = -.4;
	} else if (normal > 10) {
		cp_pow1 = .4;
		cp_pow2 = .6;
	} else {
		cp_pow1 = .8;
		cp_pow2 = .8;
	}
	
	setMotorPowers(cp_pow1, cp_pow2);
}