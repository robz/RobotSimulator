var lspow1 = 0, lspow2 = 0;
var lslookup = { 
	0: [-.5,.5],
	1: [-.2,.5],
	2: [.4,.8],
	3: [.7,.7],
	4: [.7,.7],
	5: [.8,.4],
	6: [.5,-.2],
	7: [.5,-.5]
};

function ls_main() {
	console.log("initializing line follower!");
	lspow1 = lspow2 = .5;
	setInterval("ls_loop();", 100);
}

function ls_loop() {
	if(!lineFollowerOn) return;

	var linesensor = readLineSensor();
	var total = 0, min = -1, max;
	for(var i = 0; i < 8; i++) {
		if (linesensor[i]) {
			total++;
			max = i;
			if(min == -1) 
				min = i;
		}
	}
	
	if (total != 0) {
		if (total > 5) {
			lspow1 = lspow2 = .4;
		} else if (Math.abs(min-3.5) == Math.abs(max-3.5)) {
			lspow1 = lspow2 = .6;
		} else if (Math.abs(min-3.5) > Math.abs(max-3.5)) {
			lspow1 = lslookup[min][0];
			lspow2 = lslookup[min][1];
		} else {
			lspow1 = lslookup[max][0];
			lspow2 = lslookup[max][1];
		}
	}
	
	setMotorPowers(lspow1, lspow2);
}