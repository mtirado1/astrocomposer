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

let drag = false;
let origX = 0;
let origY = 180;
let intX = 0;
let intY = 180;
let zoom = 1;
let zoomVel = 0;
let maxZoom = 50000;
let minZoom = 0.1;
let prevDist = 0;
let perspective = 1000;

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
option.value = "origin";
document.getElementById("focus").add(option);

var sortedPlanets = Object.keys(planets);
var planetList = Object.keys(planets);
for(k in planets) {
	option = document.createElement("option");
	option.text = planets[k].name;
	option.value = k;
	document.getElementById("focus").add(option);
}

var timeSelectors = document.getElementsByClassName("time-unit");
var distSelectors = document.getElementsByClassName("dist-unit");
var massSelectors = document.getElementsByClassName("mass-unit");

function resetSelectors() {
	for(var j = 0; j < timeSelectors.length; j++) {
		timeSelectors[j].innerHTML = "";
		for(key in timeUnits) {
			option = document.createElement("option");
			option.text = key;
			option.value = key;
			timeSelectors[j].add(option);
		}
	}
	
	for(var j = 0; j < distSelectors.length; j++) {
		distSelectors[j].innerHTML = "";
		for(key in distanceUnits) {
			option = document.createElement("option");
			option.text = key;
			option.value = key;
			distSelectors[j].add(option);
		}
	}
	
	for(var j = 0; j < massSelectors.length; j++) {
		massSelectors[j].innerHTML = "";
		for(key in massUnits) {
			option = document.createElement("option");
			option.text = key;
			option.value = key;
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

	const angleX = intY * Math.PI/180;
	const angleZ = intX * Math.PI/180;
	const cameraAxis = "zx";
	const cameraAngles = [angleZ, angleX];
	const w = 50 * zoom / distanceUnits.AU;
	let focusPoint = [0, 0, 0];
	ctx.setTransform(1,0,0,1,0,0);
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.translate(c.width/2, c.height/2);

	// calculate all positions
	for (k in planets) {
		const planet = planets[k];
		const coords = getOrbitPoint(parseDistance(planet.orbitRadius) * w, planet.e, getAnomaly(planet, epoch));
		planet.matrix = generateMatrix("zxz" + cameraAxis, [planet.ape, planet.inc, planet.lan].concat(cameraAngles));
		planet.coords = applyMatrix(planet.matrix, coords);
		planet.reference = [0, 0, 0];
		if(planet.hasOwnProperty("parent") && planet.parent != "") {
			planet.reference = addVectors(planets[planet.parent].coords, planets[planet.parent].reference);
		}
	}
	
	const focus = document.getElementById("focus").value;	
	if(focus !== "origin") {
		const planet = planets[focus];
		focusPoint = addVectors(planet.coords, planet.reference).map(c => c * -1);
	}

	// repeat and apply perspective
	for (k in planets) {
		const planet = planets[k];
		planet.reference = addVectors(planet.reference, focusPoint);
		planet.scale = perspective / (perspective + planet.coords[2] + planet.reference[2]);
	}

	let m = generateMatrix(cameraAxis, cameraAngles);
	if(document.getElementById("show-grid").checked) {
		ctx.beginPath();
		ctx.strokeStyle = "#303030";
		const s = distanceUnits.AU;
		for(var g = -10; g <= 10; g++) {
			let from = addVectors(focusPoint, applyMatrix(m, [g*w*s, -10*w*s, 0]));
			let to   = addVectors(focusPoint, applyMatrix(m, [g*w*s, 10*w*s, 0]));
			perspectiveLine(ctx, from, to, perspective);
			from = addVectors(focusPoint, applyMatrix(m, [-10*w*s, g*w*s, 0]));
			to   = addVectors(focusPoint, applyMatrix(m, [10*w*s,  g*w*s, 0]));
			perspectiveLine(ctx, from, to, perspective);
		}
		ctx.stroke();
	}

	if(document.getElementById("show-axis").checked) {
		const colors = ["#f00", "#0f0", "#00f"];
		for(var i = 0; i < 3; i++) {
			let vHat = [0, 0, 0];
			vHat[i] += 0.5 * w * distanceUnits.AU;
			vHat = applyMatrix(m, vHat);
			vHat = addVectors(vHat, focusPoint);
			ctx.beginPath();
			ctx.strokeStyle = colors[i];
			perspectiveLine(ctx, focusPoint, vHat, perspective);
			ctx.stroke();
		}
	}

	ctx.font = '14px Monospace';
	
	sortedPlanets.sort((a,b) => {return planets[b].coords[2] + planets[b].reference[2] - planets[a].coords[2] - planets[a].reference[2]});
	for(i in sortedPlanets) {
		const planet = planets[sortedPlanets[i]];
		plotPlanet(ctx, planet, {axis: cameraAxis, angles: cameraAngles}, w, epoch);	
	}

	const selectedTimeUnit = document.getElementById("select-speed").value
	const selectedSpeed = timeUnits[selectedTimeUnit];
	ctx.setTransform(1,0,0,1,0,0);
	ctx.fillStyle = orbitColor;
	ctx.fillText("Time: " + (epoch/selectedSpeed).toFixed(1) + " " + selectedTimeUnit, 5, c.height - 30);
	ctx.fillText("Scale: 100px = " + (100/(w*distanceUnits.AU)).toFixed(3) + " AU", 5, c.height - 15);
	epoch += (1/60) * document.getElementById("speed").value / 20 * selectedSpeed;
	document.getElementById("speed-indicator").innerHTML = "Speed: " + (document.getElementById("speed").value / 20).toFixed(2);
	requestAnimationFrame(orbit);
}

orbit();

function plotPlanet(context, body, camera, w, epoch) {
	const resolution = Math.round(w * parseDistance(body.orbitRadius) * body.scale);

	const x = body.scale*(body.reference[0] + body.coords[0]); // canvas coordinates
	const y = body.scale*(body.reference[1] + body.coords[1]);
	const z = body.reference[2] + body.coords[2];
	// plot orbit
	if(resolution <= 5000 && document.getElementById("show-orbit").checked) {
		context.lineWidth = 1;
		context.strokeStyle = orbitColor + "80";
		context.beginPath();
		const r = parseDistance(body.orbitRadius) * w;
		let prev = addVectors(applyMatrix(body.matrix, getOrbitPoint(r, body.e, 0)), body.reference);
		for(var i = 1; i <= resolution; i++) {
			let coords = addVectors(applyMatrix(body.matrix, getOrbitPoint(r, body.e, 2 * Math.PI * i / resolution)), body.reference);
			if(prev[2] >= -perspective && coords[2] >= -perspective) {
				const a = perspectiveTransform(prev, perspective);
				const b = perspectiveTransform(coords, perspective);
				context.moveTo(a[0], a[1]);
				context.lineTo(b[0], b[1]);
			}
			prev = coords;
		}
		context.stroke();
	}

	if(z <= -perspective) return; // Planet is behind camera
	// plot planet
	context.fillStyle = body.color;
	let radius = 0;
	let rotation = 0;
	let axialTilt = 0;
	if(body.hasOwnProperty("trueRadius")) radius = parseDistance(body.trueRadius) * w * body.scale;
	if(body.hasOwnProperty("rotationPeriod")) rotation = epoch / parseTime(body.rotationPeriod) * 2 * Math.PI;
	if(body.hasOwnProperty("axialTilt")) axialTilt = body.axialTilt;

	if(radius > body.radius + 1 && (Math.abs(x) - radius <= ctx.canvas.clientWidth/2) && (Math.abs(y) - radius <= ctx.canvas.clientHeight/2)) {
		// orients the planet
		var planetMatrix = generateMatrix("zx" + camera.axis, [rotation, axialTilt + body.inc].concat(camera.angles));
		context.beginPath();
		context.arc(x, y, radius, 0, 2 * Math.PI);
		context.fill();

		// plot poles
		context.strokeStyle = "#00ff00";
		context.lineWidth = 2;
		const poles = [applyMatrix(planetMatrix, [0, 0, radius]), applyMatrix(planetMatrix, [0, 0, -radius])];
		for (var p = 0; p < poles.length; p++) {
			const pole = poles[p];
			context.beginPath();
			if(pole[2] < 0) {
				context.moveTo(x + pole[0], y + pole[1]);
				context.lineTo(x + 1.5*pole[0], y + 1.5*pole[1]);	
			}
			else if(1.5*Math.hypot(pole[0], pole[1]) > radius) {
				const mag = Math.hypot(pole[0], pole[1]);
				context.moveTo(x + radius * pole[0]/mag, y + radius * pole[1]/mag);
				context.lineTo(x + 1.5*pole[0], y + 1.5*pole[1]);	
			}
			context.stroke();
		}
		
		// plot parallels and meridians
		context.strokeStyle = "rgba(255, 255, 255, 0.5)";
		context.lineWidth = 1;
		context.beginPath();
		for(var p = -5; p <= 5; p++) {
			const pRadius = radius * Math.cos(p * Math.PI/12);
			const pHeight = radius * Math.sin(p * Math.PI/12)
			let c = applyMatrix(planetMatrix, [pRadius, 0, pHeight]);
			context.moveTo(x + c[0], y + c[1]);
			for(var i = 1; i <= 50; i++) {
				c = applyMatrix(planetMatrix, [pRadius * Math.cos(i * 2 * Math.PI / 50), pRadius * Math.sin(i * 2 * Math.PI / 50), pHeight]);
				if(c[2] > 0) context.moveTo(x + c[0], y + c[1]);
				else context.lineTo(x + c[0], y + c[1]);
			}
		}
		
		for(var m = 0; m < 6; m++) {
			var meridianAngle = m * 2 * Math.PI / 12;
			var c = applyMatrix(planetMatrix, [radius * Math.cos(meridianAngle), radius *Math.sin(meridianAngle), 0]);
			context.moveTo(x + c[0], y + c[1]);
			for(var i = 1; i <= 50; i++) {
				const t = i * 2 * Math.PI / 50
				c = applyMatrix(planetMatrix, [radius * Math.cos(t) * Math.cos(meridianAngle), radius * Math.cos(t) * Math.sin(meridianAngle), radius * Math.sin(t)]);
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
function getOrbitPoint(r, e, angle) {
	return [
		r * (Math.cos(angle) - e),
		r * (Math.sin(angle) * Math.sqrt(1 - e * e)),
		0
	];
}

function getAnomaly(obj, t) {
	if(!obj.hasOwnProperty("period")) return 0;
	if(parseFloat(obj.period) === 0) return 0;
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

function addVectors() {
	let ret = [0, 0, 0];
	for(var i = 0; i < arguments.length; i++) {
		ret[0] += arguments[i][0];
		ret[1] += arguments[i][1];
		ret[2] += arguments[i][2];
	}
	return ret;
}


function perspectiveTransform(v, distance) {
	let ret = [v[0], v[1], v[2]];
	const scale = distance / (distance + v[2]);
	ret[0] *= scale;
	ret[1] *= scale;
	return ret;
}

function perspectiveLine(context, a, b, perspective) {

	// get slope
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const dz = b[2] - a[2];
	// line will never appear on screen
	if(a[2] < -perspective && b[2] < -perspective) {
		return;
	}

	if(a[2] < -perspective) {
		const step = -perspective + 1 - a[2];
		a[2] = -perspective + 1;
		a[1] += step/dz * dy;
		a[0] += step/dz * dx;
	}
	if(b[2] < -perspective) {
		const step = -perspective + 1 - b[2];
		b[2] = -perspective + 1;
		b[1] += step/dz * dy;
		b[0] += step/dz * dx;
	}
	a = perspectiveTransform(a, perspective);
	b = perspectiveTransform(b, perspective);
	context.moveTo(a[0], a[1]);
	context.lineTo(b[0], b[1]);
}
