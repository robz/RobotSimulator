var browserNum = 0;
var functionArr = [getBrowserWindowSizeInit,
	getBrowserWindowSize1,getBrowserWindowSize2,
	getBrowserWindowSize3,getBrowserWindowSize4];

function getSize() {
	return functionArr[browserNum]();
}

function getBrowserWindowSize1() {
	return {width:document.body.offsetWidth,
		height:document.body.offsetHeight};
}

function getBrowserWindowSize2() {
	return {width:document.documentElement.offsetWidth,
		height:document.documentElement.offsetHeight};
}

function getBrowserWindowSize3() {
	return {width:window.innerWidth,
		height:window.innerHeight};
}

function getBrowserWindowSize4() {
	return {width:630,height:460};
}

function getBrowserWindowSizeInit() {
	var winW = 630, winH = 460;
	browserNum = 4;
	
	if (document.body && document.body.offsetWidth) {
		winW = document.body.offsetWidth;
		winH = document.body.offsetHeight;
		browserNum = 1;
	}
	if (document.compatMode=='CSS1Compat' &&
		document.documentElement &&
		document.documentElement.offsetWidth ) {
		winW = document.documentElement.offsetWidth;
		winH = document.documentElement.offsetHeight;
		browserNum = 2;
	}
	if (window.innerWidth && window.innerHeight) {
		winW = window.innerWidth;
		winH = window.innerHeight;
		browserNum = 3;
	}
	
	return {width:winW,height:winH};
}