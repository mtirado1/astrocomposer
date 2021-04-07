


function svgElement(type) {
	return document.createElementNS("http://www.w3.org/2000/svg", type);
}

function perspectiveTransform(v, distance) {
	let ret = [v[0], v[1], v[2]];
	const scale = distance / (distance + v[2]);
	ret[0] *= scale;
	ret[1] *= scale;
	return ret;
}

function setAttributes(element, attributes) {
	for (a in attributes) {
		element.setAttribute(a, attributes[a]);
	}
}

function fillCircle(svg, x, y, radius, color) {
	let circle = svgElement("circle");
	const attributes = {
		cx: x,
		cy: y,
		r: radius,
		fill: color,
		stroke: "none"
	};
	for(a in attributes) {
		circle.setAttribute(a, attributes[a]);
	}
	svg.appendChild(circle);
}

function svgText(svg, text, color, x, y) {
	const textElement = svgElement("text");
	setAttributes(textElement, {
		x: x,
		y: y,
		fill: color
	});
	textElement.innerHTML = text;
	svg.appendChild(textElement);
}

function perspectiveLine(svg, color, a, b, perspective) {
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
	let line = svgElement("line");
	line.style.stroke = color;
	line.setAttribute("x1", a[0]);
	line.setAttribute("y1", a[1]);
	line.setAttribute("x2", b[0]);
	line.setAttribute("y2", b[1]);
	svg.appendChild(line);
}
