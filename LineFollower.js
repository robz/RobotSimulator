var lspow1 = 0, lspow2 = 0;

function ls_main() {
	console.log("starting line follower!");
	lspow1 = .5;
	lspow2 = .5;
	setInterval("ls_loop();", 100);
}

function ls_loop() {
	if(!lineFollowerOn) return;

	var linesensor = readLineSensor();
	var nonzero = false, totalnum = 0, totalval = 0;
	for(var i = 0; i < 8; i++) {
		if (linesensor[i]) {
			totalval += (i+1);
			totalnum += 1;
		}
		nonzero |= linesensor[i];
	}
	
	if (!nonzero) {
	
	} else {
		var average = totalval/totalnum;
		if (average < 3) {
			lspow1 = .1;
			lspow2 = .9;
		} else if (average < 4) {
			lspow1 = .3;
			lspow2 = .7;
		} else if (average > 6) {
			lspow1 = .9;
			lspow2 = .1;
		} else if (average > 4) {
			lspow1 = .7;
			lspow2 = .3;
		} else {
			lspow1 = .7;
			lwpow2 = .7;
		}
	}
	
	if (lineFollowerOn) 
		setMotorPowers(lspow1, lspow2);
}