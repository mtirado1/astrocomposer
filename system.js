var c = document.getElementById("system-canvas");
c.width = parseInt(getComputedStyle(document.getElementById("viewer")).getPropertyValue('width'));
c.height = c.width/2;
c.addEventListener("mousemove", doDrag, false);
c.addEventListener("touchmove", doTouchDrag, false);
c.addEventListener("mousedown", enableDrag, false);
c.addEventListener("touchstart", enableTouchDrag, false);
c.addEventListener("mouseup", disableDrag, false);
c.addEventListener("touchend", disableDrag, false);
c.addEventListener("wheel", doZoom, false);

document.getElementById("reset-time").addEventListener("click", function() {epoch = 0;}, false);

var drag = false;
var origX = 0;
var origY = 180;
var intX = 0;
var intY = 180;
var zoom = 1;
var zoomVel = 0;
var maxZoom = 50000;
var minZoom = 0.1;
var prevDist = 0;

function enableDrag(evt) {
	drag = true;
	origX -= evt.clientX;
	origY -= evt.clientY;
}

function enableTouchDrag(evt) {
	if(evt.targetTouches.length == 2) { // pinch
		prevDist = Math.hypot(evt.targetTouches[0].pageX - evt.targetTouches[1].pageX, evt.targetTouches[0].pageY - evt.targetTouches[1].pageY);
	}
	else { // rotate camera
		drag = true;
		evt.preventDefault();
		origX -= evt.targetTouches[0].pageX;
		origY -= evt.targetTouches[0].pageY;
	}
}

function disableDrag(evt) {
	drag = false;
	origX = intX;
	origY = intY;
}

function doDrag(evt) {
	if(drag) {
		intX = origX + evt.clientX;
		intY = Math.min(Math.max(origY + evt.clientY, 0), 180);
	}
}

function doTouchDrag(evt) {
	if (evt.targetTouches.length == 2) {	
		var curDist = Math.hypot(evt.targetTouches[0].pageX - evt.targetTouches[1].pageX, evt.targetTouches[0].pageY - evt.targetTouches[1].pageY);
		zoom = Math.min(Math.max(minZoom, zoom * curDist/prevDist), maxZoom);
		prevDist = curDist;
	}
	else if(drag) {
		evt.preventDefault();
		intX = origX + evt.targetTouches[0].pageX;
		intY = Math.min(Math.max(origY + evt.targetTouches[0].pageY, 0), 180);
	}
}

function doZoom(evt) {
	evt.preventDefault();
	const sign = evt.deltaY > 0 ? -1 : 1;
	if(sign == zoomVel / Math.abs(zoomVel) || zoomVel == 0) {
		zoomVel += sign * 0.2;
	}
	else {
		zoomVel = 0;
	}
}

const ctx = c.getContext('2d');
var epoch = 0;
var orbitColor = "#eeeeee";

var option = document.createElement("option");
option.text = "Origin";
document.getElementById("focus").add(option);

var sortedPlanets = Object.keys(planets);
var planetList = Object.keys(planets);
for(k in planets) {
	option = document.createElement("option");
	option.text = planets[k].name;
	document.getElementById("focus").add(option);
}

var speeds = Object.keys(timeUnits);
var distances = Object.keys(distanceUnits);
var masses = Object.keys(massUnits);
var timeSelectors = document.getElementsByClassName("time-unit");
var distSelectors = document.getElementsByClassName("dist-unit");
var massSelectors = document.getElementsByClassName("mass-unit");

function resetSelectors() {
	for(var j = 0; j < timeSelectors.length; j++) {
		timeSelectors[j].innerHTML = "";
		for(var i = 0; i < speeds.length; i++) {
			option = document.createElement("option");
			option.text = speeds[i];
			timeSelectors[j].add(option);
		}
	}
	
	for(var j = 0; j < distSelectors.length; j++) {
		distSelectors[j].innerHTML = "";
		for(var i = 0; i < distances.length; i++) {
			option = document.createElement("option");
			option.text = distances[i];
			distSelectors[j].add(option);
		}
	}
	
	for(var j = 0; j < massSelectors.length; j++) {
		massSelectors[j].innerHTML = "";
		for(var i = 0; i < masses.length; i++) {
			option = document.createElement("option");
			option.text = masses[i];
			massSelectors[j].add(option);
		}
	}
}
resetSelectors();

function orbit() {
	zoom += zoom * zoomVel * 1/60;
	zoomVel -= zoomVel/60;
	if(Math.abs(zoomVel) <= 0.02) zoomVel = 0;
	zoom = Math.min(Math.max(minZoom, zoom), maxZoom);

	var angleX = intY * Math.PI/180;
	var angleZ = intX * Math.PI/180;
	var cameraAxis = "zx";
	var cameraAngles = [angleZ, angleX];
	var w = 50 * zoom / distanceUnits.AU;
	var focusX = 0;
	var focusY = 0;

	// calculate all positions
	for (k in planets) {
		var coords = getOrbitPoint(planets[k], getAnomaly(planets[k], epoch), w);
		coords = applyMatrix(generateMatrix("zxz" + cameraAxis, [planets[k].ape, planets[k].inc, planets[k].lan].concat(cameraAngles)), coords);
		planets[k].coords = coords;
		planets[k].reference = [0, 0, 0];
		if(planets[k].hasOwnProperty("parent")) {
			if(planets.hasOwnProperty(planets[k].parent))
				for(var i = 0; i < 3; i++)
					planets[k].reference[i] = planets[planets[k].parent].coords[i] + planets[planets[k].parent].reference[i];
		}
	}
	
	var focus = document.getElementById("focus").selectedIndex;	
	ctx.setTransform(1,0,0,1,0,0);
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.translate(c.width/2, c.height/2);
	if(focus != 0) {
		focus--;
		focusX -= planets[planetList[focus]].coords[0] + planets[planetList[focus]].reference[0];
		focusY -= planets[planetList[focus]].coords[1] + planets[planetList[focus]].reference[1];
	}

	var m = generateMatrix(cameraAxis, cameraAngles);
	if(document.getElementById("show-grid").checked) {
		ctx.beginPath();
		ctx.strokeStyle = "#303030";
		var s = distanceUnits.AU;
		for(var g = -10; g <= 10; g++) {
			var from = applyMatrix(m, [g*w*s, -10*w*s, 0]);
			var to   = applyMatrix(m, [g*w*s, 10*w*s, 0]);
			ctx.moveTo(focusX + from[0],  focusY + from[1]);
			ctx.lineTo(focusX + to[0], focusY + to[1]);
			from = applyMatrix(m, [-10*w*s, g*w*s, 0]);
			to   = applyMatrix(m, [10*w*s, g*w*s, 0]);
			ctx.moveTo(focusX + from[0], focusY + from[1]);
			ctx.lineTo(focusX + to[0], focusY + to[1]);
		}
		ctx.stroke();
	}

	if(document.getElementById("show-axis").checked) {
		var colors = ["#f00", "#0f0", "#00f"];
		for(var i = 0; i < 3; i++) {
			var vHat = [0, 0, 0];
			vHat[i] = 100;
			vHat = applyMatrix(m, vHat);
			ctx.beginPath();
			ctx.strokeStyle = colors[i];
			ctx.moveTo(focusX, focusY);
			ctx.lineTo(focusX + vHat[0], focusY + vHat[1]);
			ctx.stroke();
		}
	}

	ctx.font = '14px Monospace';
	
	sortedPlanets.sort((a,b) => {return planets[b].coords[2] + planets[b].reference[2] - planets[a].coords[2] - planets[a].reference[2]});
	for(var i = 0; i < sortedPlanets.length; i++) {
		var p = sortedPlanets[i];
		plotPlanet(ctx, planets[p], [focusX + planets[p].reference[0], focusY + planets[p].reference[1]], cameraAxis, cameraAngles, w, epoch, c);	
	}

	var selectedTimeUnit = speeds[document.getElementById("select-speed").selectedIndex]
	var selectedSpeed = timeUnits[selectedTimeUnit];
	ctx.setTransform(1,0,0,1,0,0);
	ctx.fillStyle = orbitColor;
	ctx.fillText("Time: " + (epoch/selectedSpeed).toFixed(1) + " " + selectedTimeUnit, 5, c.height - 30);
	ctx.fillText("Scale: 100px = " + (100/(w*distanceUnits.AU)).toFixed(3) + " AU", 5, c.height - 15);
	epoch += (1/60) * document.getElementById("speed").value / 20 * selectedSpeed;
	document.getElementById("speed-indicator").innerHTML = "Speed: " + (document.getElementById("speed").value / 20).toFixed(2);
	requestAnimationFrame(orbit);
}

orbit();

function plotPlanet(context, body, origin, axis, angles, w, epoch, canvas) {
	// orients the orbit
	var mat = generateMatrix("zxz" + axis, [body.ape, body.inc, body.lan].concat(angles));
	
	var rotation = 0;
	var axialTilt = 0;
	if(body.hasOwnProperty("rotationPeriod")) rotation = epoch / parseTime(body.rotationPeriod) * 2 * Math.PI;
	if(body.hasOwnProperty("axialTilt")) axialTilt = body.axialTilt;
	var resolution = Math.round(w * parseDistance(body.orbitRadius));

	// plot orbit
	if(resolution <= 5000 && document.getElementById("show-orbit").checked) {
		context.beginPath();
		context.lineWidth = 1;
		context.strokeStyle = orbitColor;
		var coords = applyMatrix(mat, getOrbitPoint(body, 0, w));
		context.moveTo(origin[0] + coords[0], origin[1] + coords[1]);
		for(var j = 1; j <= resolution; j++) {
			coords = applyMatrix(mat, getOrbitPoint(body, 2 * Math.PI * j / resolution, w));
			context.lineTo(origin[0] + coords[0], origin[1] + coords[1]);
		}
		context.stroke();
	}

	var x = origin[0] + body.coords[0]; // canvas coordinates
	var y = origin[1] + body.coords[1];
	context.fillStyle = body.color;
	// plot planet
	var k = 0;
	if(body.hasOwnProperty("trueRadius")) k = parseDistance(body.trueRadius) * w;

	if(k > body.radius*3 + 1 && (Math.abs(x)-k <= canvas.width/2) && (Math.abs(y)-k <= canvas.height/2)) {
		// orients the planet
		var planetMatrix = generateMatrix("zx" + axis, [rotation, axialTilt + body.inc].concat(angles));
		context.beginPath();
		context.arc(x, y, k, 0, 2 * Math.PI);
		context.fill();

		// plot north pole
		context.strokeStyle = "#00ff00";
		context.lineWidth = 2;
		var pole = applyMatrix(planetMatrix, [0, 0, k]);
		context.beginPath();
		context.moveTo(x + pole[0], y + pole[1]);
		context.lineTo(x + 1.5*pole[0], y + 1.5*pole[1]);
		context.stroke();

		// plot parallels and meridians
		context.strokeStyle = "rgba(255, 255, 255, 0.5)";
		context.lineWidth = 1;
		context.beginPath();
		for(var p = -5; p <= 5; p++) {
			var pRadius = k * Math.cos(p * Math.PI/12);
			var pHeight = k * Math.sin(p * Math.PI/12)
			var c = applyMatrix(planetMatrix, [pRadius, 0, pHeight]);
			context.moveTo(x + c[0], y + c[1]);
			for(var i = 1; i <= 50; i++) {
				c = applyMatrix(planetMatrix, [pRadius * Math.cos(i * 2 * Math.PI / 50), pRadius * Math.sin(i * 2 * Math.PI / 50), pHeight]);
				if(c[2] > 0) context.moveTo(x + c[0], y + c[1]);
				else context.lineTo(x + c[0], y + c[1]);
			}
		}
		
		for(var m = 0; m < 6; m++) {
			var meridianMatrix = generateMatrix("z", [m * 2 * Math.PI / 12]);
			var c = applyMatrix(planetMatrix, applyMatrix(meridianMatrix, [k, 0, 0]));
			context.moveTo(x + c[0], y + c[1]);
			for(var i = 1; i <= 50; i++) {
				c = applyMatrix(planetMatrix, applyMatrix(meridianMatrix, [k * Math.cos(i * 2 * Math.PI / 50), 0, k * Math.sin(i * 2 * Math.PI / 50)]));
				if(c[2] > 0) context.moveTo(x + c[0], y + c[1]);
				else context.lineTo(x + c[0], y + c[1]);
			}
		}
		context.stroke();
	}
	else {
		context.beginPath();
		context.arc(x, y, body.radius * 3, 0, 2 * Math.PI);
		context.fill();
	}
	
	if(document.getElementById("show-label").checked && resolution >= 10 && resolution <= 10000) {
		context.fillText(body.name, x, y - 40);
		context.fillRect(x, y - 40, 1, 35);
	}

}

// Plot a point of an orbit, angle is mean anomaly
function getOrbitPoint(obj, angle, w) {
	var r = parseDistance(obj.orbitRadius);
	var vec = [
		r * w * (Math.cos(angle) - obj.e),
		r * w * (Math.sin(angle) * Math.sqrt(1 - obj.e * obj.e)),
		0
	];
	return vec;
}

function getAnomaly(obj, t) {
	if(!obj.hasOwnProperty("period")) return 0;
	var M  = (obj.argument + t / parseTime(obj.period)) * 2 * Math.PI;
	if (obj.e < 0.1) return M; // no need to calculate for near-circular orbits
	var E = M;
	for(var k = 0; k < Math.round(obj.e * 50); k++) {
		E = M + obj.e * Math.sin(E);
	}
	return E;
}

function parseDistance(a) {
	return parseFloat(a) * distanceUnits[a.split(" ")[1]];
}

function parseTime(t) {
	return parseFloat(t) * timeUnits[t.split(" ")[1]];
}

function parseMass(m) {
	return parseFloat(m) * massUnits[m.split(" ")[1]];
}

// generates 3x3 rotation matrix for multiple rotations
function generateMatrix(axis, angle) {
	var ret = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
	var mat, sin, cos;
	for (var i = 0; i < axis.length; i++) {	
		cos = Math.cos(angle[i]);
		sin = Math.sin(angle[i]);
		if (axis[i] == 'x')
			mat = [[1, 0, 0], [0, cos, -sin], [0, sin,  cos]];
		else if (axis[i] == 'y')
			mat = [[cos, 0, sin], [0, 1, 0], [-sin, 0, cos]];
		else if (axis[i] == 'z')
			mat = [[cos, -sin, 0], [sin, cos, 0], [0, 0, 1]];

		// multiply
		var a = ret;
		ret = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
		for(var j = 0; j < 3; j++)
			for(var k = 0; k < 3; k++)
				for(var l = 0; l < 3; l++)
					ret[j][k] += mat[j][l] * a[l][k];
	}
	return ret;
}

// applies rotation matrix to a vector
function applyMatrix(m, v) {
	var ret = [0, 0, 0];
	for(var i = 0; i < 3; i++)
		ret[i] = m[i][0]*v[0] + m[i][1]*v[1] + m[i][2] * v[2]
	return ret;
}

