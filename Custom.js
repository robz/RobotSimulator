// Basic line following code

var cp_pow1 = 0, cp_pow2 = 0;

function cp_main() {
	console.log("initializing custom program!");
	cp_pow1 = .5;
	cp_pow2 = .5;
	setInterval("cp_loop();", 100);
}

function cp_loop() {
	if(!customOn) return;
	
	var linesensor = readLineSensor();
	var error = getError(linesensor);
	
	// we're off the line completely, so just do what we 
	//	did last time 
	if (error == null) {
		setMotorPowers(lspow1, lspow2);
		return;
	}
	
	var p_const = .5/3.5;
	var p1 = .5, p2 = .5;
	if (Math.abs(error) > .5) {
		p1 = error*(-1*p_const)+.5; 
		p2 = error*p_const+.5;
	}
	
	lspow1 = p1;
	lspow2 = p2;
	
	setMotorPowers(lspow1, lspow2);
}

function getError(linesensor) {
	var sum = 0, total = 0;
	for(var i = 0; i < 8; i++) {
		if(linesensor[i]) {
			total++;
			sum += i;
		}
	}
	if (total == 0) return null;
	return 3.5-sum/total;
}