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
	var index = document.getElementById("edit-select").selectedIndex;
	var body = planets[planetList[index]];

	if(body.hasOwnProperty("parent")) {
		if(body.parent != "") {
			document.getElementById("edit-parent").selectedIndex = planetList.indexOf(body.parent); 
		}
		else {
			document.getElementById("edit-parent").selectedIndex = index;
		}
	}
	else {
		document.getElementById("edit-parent").selectedIndex = index; 
	}
	
	document.getElementById("edit-name").value = body.name; 
	document.getElementById("edit-a").value = parseFloat(body.orbitRadius);
	document.getElementById("edit-color").value = body.color;
	document.getElementById("edit-a-unit").selectedIndex = distances.indexOf(body.orbitRadius.split(" ")[1]);
	
	if(body.hasOwnProperty("period")) {
		document.getElementById("edit-T").value = parseFloat(body.period);
		document.getElementById("edit-T-unit").selectedIndex = speeds.indexOf(body.period.split(" ")[1]);
	}
	else {
		document.getElementById("edit-T").value = 1;
		document.getElementById("edit-T-unit").selectedIndex = 0;
	}

	if(body.hasOwnProperty("rotationPeriod")) {
		document.getElementById("edit-rotation").value = parseFloat(body.rotationPeriod);
		document.getElementById("edit-rotation-unit").selectedIndex = speeds.indexOf(body.rotationPeriod.split(" ")[1]);
	}
	else {
		document.getElementById("edit-rotation").value = 1;
		document.getElementById("edit-rotation-unit").selectedIndex = 0;
	}

	if(body.hasOwnProperty("trueRadius")){
		document.getElementById("edit-size").value = parseFloat(body.trueRadius);
		document.getElementById("edit-size-unit").selectedIndex = distances.indexOf(body.trueRadius.split(" ")[1]);
	}
	else {
		document.getElementById("edit-size").value = 0;
		document.getElementById("edit-size-unit").selectedIndex = 0;
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
	var index = document.getElementById("edit-select").selectedIndex;
	if(index == -1) return;
	delete planets[planetList[index]];
	document.getElementById("edit-select").remove(index);
	document.getElementById("edit-parent").remove(index);
	document.getElementById("focus").remove(index + 1);

	sortedPlanets = Object.keys(planets);
	planetList = Object.keys(planets);
}

function updateParameters() {
	var index = document.getElementById("edit-select").selectedIndex;
	var body = planets[planetList[index]];

	body.name = document.getElementById("edit-name").value;
	document.getElementById("edit-select").options[index].text = body.name;
	document.getElementById("edit-parent").options[index].text = body.name;
	document.getElementById("focus").options[index+1].text = body.name;
	body.orbitRadius = document.getElementById("edit-a").value.toString() + " " + distances[document.getElementById("edit-a-unit").selectedIndex];
	body.color = document.getElementById("edit-color").value;
	body.period = document.getElementById("edit-T").value.toString() + " " + speeds[document.getElementById("edit-T-unit").selectedIndex];
	body.rotationPeriod = document.getElementById("edit-rotation").value.toString() + " " + speeds[document.getElementById("edit-rotation-unit").selectedIndex];
	body.trueRadius = document.getElementById("edit-size").value.toString() + " " + distances[document.getElementById("edit-size-unit").selectedIndex];
	body.radius = document.getElementById("edit-point").value;
	body.e = document.getElementById("edit-e").value;
	body.axialTilt = document.getElementById("edit-tilt").value * Math.PI/180;
	body.argument = document.getElementById("edit-ma").value / 360
	body.lan = document.getElementById("edit-lan").value * Math.PI / 180;
	body.inc = document.getElementById("edit-inc").value * Math.PI / 180;
	body.ape = document.getElementById("edit-ape").value * Math.PI / 180;

	if(document.getElementById("edit-parent").selectedIndex != index) {
		body.parent = planetList[document.getElementById("edit-parent").selectedIndex];
	}
	else {
		body.parent = "";
	}

	planets[planetList[index]] = body;
}

function createBody() {
	var newKey = prompt("Object key:", "planet");
	if(newKey == null || newKey == "" || planets.hasOwnProperty(newKey)) return;

	var newBody = {};
	newBody.name = newKey;
	newBody.color = "#ff0000";
	newBody.radius = 1;
	newBody.trueRadius = "0 " + distances[0];
	newBody.orbitRadius = "1 " + distances[0];
	newBody.period = "1 " + speeds[0];
	newBody.rotationPeriod = "1 " + speeds[0];

	newBody.argument = 0;
	newBody.e = 0;
	newBody.argument = 0;
	newBody.ape = 0;
	newBody.inc = 0;
	newBody.lan = 0;

	planets[newKey] = newBody;

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
	var blob = new Blob([JSON.stringify(pack)], {type: "text/plain;charset=utf-8"});

	var link = document.createElement("a");
	link.download = "system.json";
	link.innerHTML = "Download File";
	link.href = window.URL.createObjectURL(blob);
	link.addEventListener('click', (event) => {document.body.removeChild(event.target);});
	link.style.display = "none";
	document.body.appendChild(link);
	link.click();
}
