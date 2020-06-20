var timeUnits = {
	y: 31536000,
	d: 86400,
	h: 3600,
	s: 1
};

var distanceUnits = {
	AU: 149597870700,
	km: 1000,
	m: 1
}

var massUnits = {
	kg: 1,
	earth: 5.9722e24,
	jupiter: 1.8981e27,
	sol: 1.9885e30
}

var planets = {
	sol: {
		name: "Sun",
		orbitRadius: "0 AU",
		radius: 3,
		trueRadius: "695700 km",
		rotationPeriod: "25.05 d",
		axialTilt: 0.1265,
		color: "#ffee33",
		inc: 0,
		ape: 0,
		e: 0,
		lan: 0
	},
	mercury: {
		name: 'Mercury',
		orbitRadius: "0.387 AU",
		radius: 1,
		trueRadius: "2439.7 km",
		axialTilt: 0,
		rotationPeriod: "58.646 d",
		period: "0.240 y",
		argument: 0.485,
		color: '#dddddd',
		inc: 0.122,
		ape: 0.508,
		e: 0.205,
		lan: 0.843
	},
	venus: {
		name: 'Venus',
		orbitRadius: "0.723 AU",
		radius: 1,
		trueRadius: "6051.8 km",
		axialTilt: 3.0955,
		rotationPeriod: "243.025 d",
		period: "0.615 y",
		argument: 0.139,
		color: '#f1df98',
		inc: 0.059,
		ape: 0.957,
		e: 0.006,
		lan: 1.338
	},
	earth: {
		name: 'Earth',
		orbitRadius: "1 AU",
		radius: 1,
		trueRadius: "6371 km",
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
	luna: {
		name: "Moon",
		color: "#cccccc",
		parent: "earth",
		radius: 0.5,
		orbitRadius: "384400 km",
		trueRadius: "1737.4 km",
		axialTilt: 0.1167,
		rotationPeriod: "27.321 d",
		period: "27.321 d",
		argument: 0,
		inc: 0.08979,
		ape: 0,
		e: 0.0549,
		lan: 0,

	},
	mars: {
		name: 'Mars',
		orbitRadius: "1.523 AU",
		radius: 1,
		trueRadius: "3389.5 km",
		axialTilt: 0.4396,
		rotationPeriod: "1.0259 d",
		period: "1.88 y",
		argument: 0.053,
		color: '#ff0000',
		inc: 0.0322,
		ape: 5,
		e: 0.09,
		lan: 0.864
	},
	phobos: {
		name: "Phobos",
		color: "#cccccc",
		parent: "mars",
		radius: 0.5,
		orbitRadius: "9376 km",
		argument: 0,
		period: "0.318 d",
		inc: 0.4544,
		ape: 0,
		lan: 0,
		e: 0.015
	},
	deimos: {
		name: "Deimos",
		color: "#cccccc",
		parent: "mars",
		radius: 0.5,
		orbitRadius: "23463.2 km",
		argument: 0,
		period: "1.263 d",
		inc: 0.48136,
		ape: 0,
		lan: 0,
		e: 0
	},
	jupiter: {
		name: 'Jupiter',
		orbitRadius: "5.204 AU",
		radius: 3,
		trueRadius: "69911 km",
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
	io: {
		name: "Io",
		color: "#ffcc00",
		parent: "jupiter",
		radius: 0.5,

		orbitRadius: "421700 km",
		period: "1.769 d",
		e: 0,
		argument: 0,
		inc: 0.038,
		ape: 0,
		lan: 0
	},
	europa: {
		name: "Europa",
		color: "#ffcc88",
		parent: "jupiter",
		radius: 0.5,

		orbitRadius: "670900 km",
		period: "3.551 d",
		e: 0,
		argument: 0,
		inc: 0.031,
		ape: 0,
		lan: 0
	},
	ganymede: {
		name: "Ganymede",
		color: "#cccccc",
		parent: "jupiter",
		radius: 0.5,

		orbitRadius: "1070.4e3 km",
		period: "7.154 d",
		e: 0,
		argument: 0,
		inc: 0.038,
		ape: 0,
		lan: 0

	},
	callisto: {
		name: "Callisto",
		color: "#ddaaaa",
		parent: "jupiter",
		radius: 0.5,

		orbitRadius: "1882.7e3 km",
		period: "16.689 d",
		e: 0,
		argument: 0,
		inc: 0.0352,
		ape: 0,
		lan: 0
	},
	saturn: {
		name: 'Saturn',
		orbitRadius: "9.5826 AU",
		radius: 3,
		trueRadius: "58232 km",
		axialTilt: 0.4665,
		rotationPeriod: "10.5 h",
		period: "29.4571 y",
		argument: 0.8806,
		color: '#ffff33',
		inc: 0.04337,
		ape: 5.923,
		e: 0.0565,
		lan: 1.983
	},
	titan: {
		name: "Titan",
		color: "#ffcc00",
		parent: "saturn",
		radius: 0.5,

		orbitRadius: "1221.87e3 km",
		period: "15.945 d",
		e: 0.0288,
		argument: 0,
		inc: 0.4665,
		ape: 0,
		lan: 0
	},
	ring: {
		name: "Ring System",
		color: "#cccccc",
		parent: "saturn",
		radius: 0,
		orbitRadius: "138e3 km",
		e: 0,
		argument: 0,
		inc: 0.50987,
		ape: 0,
		lan: 0
	},

	uranus: {
		name: 'Uranus',
		orbitRadius: "19.2184 AU",
		radius: 2,
		trueRadius: "25362 km",
		axialTilt: 1.7064,
		rotationPeriod: "0.71833 d",
		period: "84.0205 y",
		argument: 0.395,
		color: '#63d9d9',
		inc: 0.0134,
		ape: 1.692,
		e: 0.046,
		lan: 1.291
	},
	titania: {
		name: "Titania",
		color: "#cccccc",
		parent: "uranus",
		radius: 0.5,

		orbitRadius: "435910 km",
		period: "8.706 d",
		e: 0.0011,
		argument: 0,
		inc: 1.7257,
		ape: 0,
		lan: 0
	},
	neptune: {
		name: 'Neptune',
		orbitRadius: "30.11 AU",
		radius: 2,
		trueRadius: "24622 km",
		axialTilt: 0.4942,
		rotationPeriod: "0.6713 d",
		period: "164.8 y",
		argument: 0.7116,
		color: '#4977d9',
		inc: 0.0308,
		ape: 4.822,
		e: 0.009,
		lan: 2.3
	},
	triton: {
		name: "Triton",
		color: "#cccccc",
		parent: "neptune",
		radius: 0.5,

		orbitRadius: "354759 km",
		period: "5.876 d",
		e: 0,
		argument: 0,
		inc: 2.265,
		ape: 0,
		lan: 3.14
	},
	plutosystem: {
		name: 'Pluto',
		orbitRadius: "39.482 AU",
		radius: 0,
		period: "247.94 y",
		argument: 0.040,
		color: '#d08000',
		inc: 0.299,
		ape: 1.986,
		e: 0.2488,
		lan: 1.925

	},
	pluto: {
		name: 'Pluto',
		parent: "plutosystem",
		orbitRadius: "2410 km",
		radius: 0.5,
		trueRadius: "1188.3.6 km",
		axialTilt: 0,
		rotationPeriod: "6.387 d",
		period: "6.387 d",
		argument: 0,
		color: '#d08000',
		inc: 1.9684,
		ape: 0,
		e: 0,
		lan: 0
	},
	charon: {
		name: 'Charon',
		parent: "plutosystem",
		orbitRadius: "17181 km",
		radius: 0.5,
		trueRadius: "606 km",
		axialTilt: 0,
		rotationPeriod: "6.387 d",
		period: "6.387 d",
		argument: 0.5,
		color: '#80d0d0',
		inc: 1.9684,
		ape: 0,
		e: 0,
		lan: 0
	}
};
