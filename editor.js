var parameters = document.getElementsByClassName("edit");
for(var i = 0; i < parameters.length; i++) {
	parameters[i].addEventListener("change", updateParameters, false);
}

var incButtons = document.getElementsByClassName("inc-button");
var decButtons = document.getElementsByClassName("dec-button");

for(var i = 0; i < incButtons.length; i++) {
	incButtons[i].addEventListener("click", incValue, false);
	decButtons[i].addEventListener("click", decValue, false);
}


document.getElementById("kepler-none").addEventListener("click", enableKepler, false);
document.getElementById("kepler-period").addEventListener("click", enableKepler, false);
document.getElementById("kepler-distance").addEventListener("click", enableKepler, false);

document.getElementById("kepler-none").checked = true;
document.getElementById("kepler-distance").checked = false;
document.getElementById("kepler-period").checked = false;

var kepler = "none";

var editA = document.getElementById("edit-a");
var editAUnit = document.getElementById("edit-a-unit");
var editT = document.getElementById("edit-T");
var editTUnit = document.getElementById("edit-T-unit");
var editRotation = document.getElementById("edit-rotation");
var editRotationUnit = document.getElementById("edit-rotation-unit");
var editSize = document.getElementById("edit-size");
var editSizeUnit = document.getElementById("edit-size-unit");
var editMass = document.getElementById("edit-mass");
var editMassUnit = document.getElementById("edit-mass-unit");

function getEditedBody() {
	return document.getElementById("edit-select").selectedIndex;
}

function enableKepler(e) {
	if(!e.target.checked) return;
	editT.disabled = false;
	editA.disabled = false;
	kepler = e.target.value;
	if(e.target.value == "none") return;
	var p = planetList[getEditedBody()];
	if(planets[p].parent == "") {
		alert("Body has no parent. Cannot keplerize.");
		document.getElementById("kepler-none").checked = true;
		document.getElementById("kepler-distance").checked = false;
		document.getElementById("kepler-period").checked = false;
		kepler = "none";
		return;
	}
	if(!planets[planets[p].parent].hasOwnProperty("mass")) {
		alert("Parent has no mass. Cannot keplerize.");
		document.getElementById("kepler-none").checked = true;
		document.getElementById("kepler-distance").checked = false;
		document.getElementById("kepler-period").checked = false;
		kepler = "none";
		return;
	}
	keplerize(kepler);
}

function keplerize(type) {
	if (type == "none") return;
	var p = planetList[getEditedBody()];
	var parentMass = parseMass(planets[planets[p].parent].mass);
	if (type == "distance") {
		var period = parseTime(planets[p].period);
		var newDistance = Math.cbrt((6.67e-11 * parentMass * period * period)/(4 * Math.PI * Math.PI));
		planets[p].orbitRadius = convertUnits(distanceUnits, newDistance.toString() + " m", distances[editAUnit.selectedIndex]);
		editA.disabled = true;
		editA.value = planets[p].orbitRadius.split(" ")[0];
	}
	else if (type == "period") {
		var distance = parseDistance(planets[p].orbitRadius);
		var newPeriod = 2 * Math.PI * Math.sqrt( distance**3 / (parentMass * 6.67e-11));
		planets[p].period = convertUnits(timeUnits, newPeriod.toString() + " s", speeds[editTUnit.selectedIndex]);
		editT.disabled = true;
		editT.value = planets[p].period.split(" ")[0];
	}
}

function incValue(e) {
	var box = document.getElementById(e.target.getAttribute("for"));
	if(box.classList.contains("log")) {
		box.value = (box.value * 1.2).toFixed(6);
	}
	else if(box.classList.contains("angle")) {
		box.value++;
	}
	else {
		box.value = parseFloat(box.value) + parseFloat(box.step);
	}
	if(box.hasAttribute("max")) {
		if(parseFloat(box.value) > parseFloat(box.max)) box.value = box.max;
	}
	updateParameters();
}

function decValue(e) {
	var box = document.getElementById(e.target.getAttribute("for"));
	if(box.classList.contains("log")) {
		box.value = (box.value / 1.2).toFixed(6);
	}
	else if(box.classList.contains("angle")){
		box.value--;
	}
	else {
		box.value = parseFloat(box.value) - parseFloat(box.step);
	}
	if(box.hasAttribute("min")) {
		if(parseFloat(box.value) < parseFloat(box.min)) box.value = box.min;
	}
	updateParameters();
}


document.getElementById("edit-select").addEventListener("change", populateParameters, false);
document.getElementById("delete-body").addEventListener("click", deleteBody, false);

document.getElementById("create-body").addEventListener("click", createBody, false);
document.getElementById("create-orbit").addEventListener("click", addBody, false);
document.getElementById("create-center").addEventListener("click", addBody, false);

document.getElementById("load-file").addEventListener("change", loadFile, false);
document.getElementById("save-file").addEventListener("click", saveFile, false);

for(k in planets) {
	option = document.createElement("option");
	option.text = planets[k].name;
	document.getElementById("edit-select").add(option);
	option = document.createElement("option");
	option.text = planets[k].name;
	document.getElementById("edit-parent").add(option);

}
populateParameters();

function populateParameters() {
	var index = getEditedBody();
	var body = planets[planetList[index]];

	document.getElementById("edit-parent").selectedIndex = index;
	if(body.hasOwnProperty("parent")) {
		if(body.parent != "") {
			document.getElementById("edit-parent").selectedIndex = planetList.indexOf(body.parent); 
		}
	}
	document.getElementById("edit-name").value = body.name; 
	document.getElementById("edit-color").value = body.color;
	editA.value = parseFloat(body.orbitRadius);
	editAUnit.selectedIndex = distances.indexOf(body.orbitRadius.split(" ")[1]);
	
	if(body.hasOwnProperty("period")) {
		editT.value = parseFloat(body.period);
		editTUnit.selectedIndex = speeds.indexOf(body.period.split(" ")[1]);
	}
	else {
		editT.value = 1;
		editTUnit.selectedIndex = 0;
	}

	if(body.hasOwnProperty("rotationPeriod")) {
		editRotation.value = parseFloat(body.rotationPeriod);
		editRotationUnit.selectedIndex = speeds.indexOf(body.rotationPeriod.split(" ")[1]);
	}
	else {
		editRotation.value = 1;
		editRotationUnit.selectedIndex = 0;
	}

	if(body.hasOwnProperty("trueRadius")){
		editSize.value = parseFloat(body.trueRadius);
		editSizeUnit.selectedIndex = distances.indexOf(body.trueRadius.split(" ")[1]);
	}
	else {
		editSize.value = 0;
		editSizeUnit.selectedIndex = 0;
	}
	
	if(body.hasOwnProperty("mass")){
		editMass.value = parseFloat(body.mass);
		editMassUnit.selectedIndex = masses.indexOf(body.mass.split(" ")[1]);
	}
	else {
		editMass.value = 0;
		editMassUnit.selectedIndex = 0;
	}	
	document.getElementById("edit-point").value = body.radius;
	document.getElementById("edit-e").value = body.e;
	
	document.getElementById("edit-tilt").value = (body.axialTilt * 180 / Math.PI).toFixed(2);
	document.getElementById("edit-ma").value = body.argument * 360;
	document.getElementById("edit-lan").value = (body.lan * 180 / Math.PI).toFixed(2);
	document.getElementById("edit-inc").value = (body.inc * 180 / Math.PI).toFixed(2);
	document.getElementById("edit-ape").value = (body.ape * 180 / Math.PI).toFixed(2);

	updateParameters();
}

function deleteBody() {
	var index = getEditedBody();
	if(index == "") return;
	delete planets[planetList[index]];
	document.getElementById("edit-select").remove(index);
	document.getElementById("edit-parent").remove(index);
	document.getElementById("focus").remove(index + 1);

	sortedPlanets = Object.keys(planets);
	planetList = Object.keys(planets);
}

function convertUnits(units, value, to) {
	var c = parseFloat(value);
	var from = value.split(" ")[1];
	c = c * units[from] / units[to];
	return c.toString() + " " + to;
}

function updateParameters() {
	var index = getEditedBody();
	var body = planets[planetList[index]];
	body.name = document.getElementById("edit-name").value;
	document.getElementById("edit-select").options[index].text = body.name;
	document.getElementById("edit-parent").options[index].text = body.name;
	document.getElementById("focus").options[index+1].text = body.name;

	body.orbitRadius = convertUnits(distanceUnits, editA.value.toString() + " " + body.orbitRadius.split(" ")[1], distances[editAUnit.selectedIndex]);
	editA.value = parseFloat(body.orbitRadius);
	
	body.period = convertUnits(timeUnits, editT.value.toString() + " " + body.period.split(" ")[1], speeds[editTUnit.selectedIndex]);
	editT.value = parseFloat(body.period);

	if(!body.hasOwnProperty("rotationPeriod")) body.rotationPeriod = "0 s";
	if(!body.hasOwnProperty("trueRadius")) body.trueRadius = "0 m";
	if(!body.hasOwnProperty("mass")) body.mass = "0 kg";
	body.rotationPeriod = convertUnits(timeUnits, editRotation.value.toString() + " " + body.rotationPeriod.split(" ")[1], speeds[editRotationUnit.selectedIndex]);
	editRotation.value = parseFloat(body.rotationPeriod);

	body.trueRadius = convertUnits(distanceUnits, editSize.value.toString() + " " + body.trueRadius.split(" ")[1], distances[editSizeUnit.selectedIndex]);
	editSize.value = parseFloat(body.trueRadius);	
	
	body.mass = convertUnits(massUnits, editMass.value.toString() + " " + body.mass.split(" ")[1], masses[editMassUnit.selectedIndex]);
	editMass.value = parseFloat(body.mass);	
	
	body.color = document.getElementById("edit-color").value;
	body.radius = parseInt(document.getElementById("edit-point").value);
	body.e = parseFloat(document.getElementById("edit-e").value);
	body.axialTilt = document.getElementById("edit-tilt").value * Math.PI/180;
	body.argument = document.getElementById("edit-ma").value / 360
	body.lan = document.getElementById("edit-lan").value * Math.PI / 180;
	body.inc = document.getElementById("edit-inc").value * Math.PI / 180;
	body.ape = document.getElementById("edit-ape").value * Math.PI / 180;

	body.parent = "";
	if(document.getElementById("edit-parent").selectedIndex != index) {
		body.parent = planetList[document.getElementById("edit-parent").selectedIndex];
	}
	keplerize(kepler);

	var mass = parseMass(body.mass);
	var radius = parseDistance(body.trueRadius);

	if(radius == 0) {
		document.getElementById("info-gravity").innerHTML = "N/A";
		document.getElementById("info-density").innerHTML = "N/A";
	}
	else {
		document.getElementById("info-gravity").innerHTML = (6.67e-11 * mass / (radius*radius) / 9.81).toFixed(3).toString() + " g";
		document.getElementById("info-density").innerHTML = (mass / ((4/3) * Math.PI * radius * radius * radius) / 1000).toFixed(3).toString() + " g/cm<sup>3</sup>"; 
	}

	var r = parseFloat(body.orbitRadius);
	var u = body.orbitRadius.split(" ")[1];
	document.getElementById("info-periapsis").innerHTML = (r * (1-body.e)).toFixed(3).toString() + " " + u;
	document.getElementById("info-apoapsis").innerHTML = (r * (1+body.e)).toFixed(3).toString() + " " + u;

}

function createBody() {
	document.getElementById("type-selector").style.display = "block";
}

const templates = [
	{
		name: "Sun",
		orbitRadius: "0 AU",
		radius: 3,
		trueRadius: "695700 km",
		mass: "1 sol",
		rotationPeriod: "25.05 d",
		axialTilt: 0.1265,
		color: "#ffee33",
		inc: 0,
		ape: 0,
		e: 0,
		lan: 0
	},
	{
		name: 'Jupiter',
		orbitRadius: "5.204 AU",
		radius: 3,
		trueRadius: "69911 km",
		mass: "1 jupiter",
		axialTilt: 0.05462,
		rotationPeriod: "9.925 h",
		period: "11.862 y",
		argument: 0.0556,
		color: '#ff9900',
		inc: 0.0227,
		ape: 4.779,
		e: 0.0489,
		lan: 1.7534
	},
	{
		name: 'Earth',
		orbitRadius: "1 AU",
		radius: 1,
		trueRadius: "6371 km",
		mass: "1 earth",
		axialTilt: 0.409,
		rotationPeriod: "1 d",
		period: "1 y",
		argument: 0.996,
		color: '#0099ff',
		inc: 0,
		ape: 1.989,
		e: 0.016,
		lan: 6.086
	},
	{
		name: "Moon",
		color: "#cccccc",
		radius: 0.5,
		orbitRadius: "384400 km",
		trueRadius: "1737.4 km",
		mass: "0.0123 earth",
		axialTilt: 0.1167,
		rotationPeriod: "27.321 d",
		period: "27.321 d",
		argument: 0,
		inc: 0.08979,
		ape: 0,
		e: 0.0549,
		lan: 0
	}
]

for(var t = 0; t < templates.length; t++) {
	option = document.createElement("option");
	option.text = templates[t].name;
	document.getElementById("template-select").add(option);
}

function addBody(e) {
	document.getElementById("type-selector").style.display = "none";
	var selectedTemplate = templates[document.getElementById("template-select").selectedIndex]
	var newKey = prompt("Object ID:", selectedTemplate.name);
	if(newKey == null || newKey == "" || planets.hasOwnProperty(newKey)) {
		if(planets.hasOwnProperty(newKey)) {
			alert("That key is already used by another object.");
		}
		return;
	}
	planets[newKey] = Object.assign({}, selectedTemplate);
	planets[newKey].name = newKey;
	if(e.target.id == "create-center") {
		planets[newKey].orbitRadius = "0 AU";
	}
	var focus = document.getElementById("focus").selectedIndex - 1;
	if(focus >= 0) {
		planets[newKey].parent = planetList[focus];
	}
	else {
		planets[newKey].parent = ""
	}
	sortedPlanets = Object.keys(planets);
	planetList = Object.keys(planets);
	option = document.createElement("option");
	option.text = newKey;
	document.getElementById("edit-select").add(option);
	option = document.createElement("option");
	option.text = newKey;
	document.getElementById("edit-parent").add(option);
	
	option = document.createElement("option");
	option.text = newKey;
	document.getElementById("focus").add(option);

	document.getElementById("edit-select").selectedIndex = planetList.length-1;
	populateParameters();
}


function resetSystem() {
	document.getElementById("focus").innerHTML = ""
	document.getElementById("edit-select").innerHTML = ""
	document.getElementById("edit-parent").innerHTML = ""
	var option = document.createElement("option");
	option.text = "Origin";
	document.getElementById("focus").add(option);

	sortedPlanets = Object.keys(planets);
	planetList = Object.keys(planets);
	for(k in planets) {
		option = document.createElement("option");
		option.text = planets[k].name;
		document.getElementById("focus").add(option);
		option = document.createElement("option");
		option.text = planets[k].name;
		document.getElementById("edit-select").add(option);
		option = document.createElement("option");
		option.text = planets[k].name;
		document.getElementById("edit-parent").add(option);
	}

	speeds = Object.keys(timeUnits);
	distances = Object.keys(distanceUnits);
for(var j = 0; j < timeSelectors.length; j++) {
	timeSelectors[j].innerHTML = "";
	for(var i = 0; i < speeds.length; i++) {
		option = document.createElement("option");
		option.text = speeds[i];
		timeSelectors[j].add(option);
	}
}

for(var j = 0; j < distSelectors.length; j++) {
	distSelectors[j].innerHTML ="";
	for(var i = 0; i < distances.length; i++) {
		option = document.createElement("option");
		option.text = distances[i];
		distSelectors[j].add(option);
	}
}
populateParameters();
}

function loadFile() {
	var fileList = event.target.files;
	const reader = new FileReader();
	reader.addEventListener('load', (event) => {
    var loaded = JSON.parse(event.target.result);
	planets = loaded.planets;
	timeUnits = loaded.timeUnits;
	distanceUnits = loaded.distanceUnits;
	resetSystem();
  });
  reader.readAsText(fileList[0]);
}

function saveFile() {
	var pack = {};
	pack.distanceUnits = distanceUnits;
	pack.timeUnits = timeUnits;
	pack.planets = planets;
	for (p in pack.planets) {
		delete pack.planets[p].coords;
		delete pack.planets[p].reference;
	}
	var blob = new Blob([JSON.stringify(pack, null, 2)], {type: "text/plain;charset=utf-8"});

	var link = document.createElement("a");
	link.download = "system.json";
	link.innerHTML = "Download File";
	link.href = window.URL.createObjectURL(blob);
	link.addEventListener('click', (event) => {document.body.removeChild(event.target);});
	link.style.display = "none";
	document.body.appendChild(link);
	link.click();
}
