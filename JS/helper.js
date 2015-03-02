// Color makers
// Geen bron, zie mail 26-6-2014
function hsvToRgb(h, s, v) {
	var r, g, b;
	var i;
	var f, p, q, t;
	
	// Make sure our arguments stay in-range
	h = Math.max(0, Math.min(360, h));
	s = Math.max(0, Math.min(100, s));
	v = Math.max(0, Math.min(100, v));
			
	// We accept saturation and value arguments from 0 to 100 because that's
	// how Photoshop represents those values. Internally, however, the
	// saturation and value are calculated from a range of 0 to 1. We make
	// That conversion here.
	s /= 100;
	v /= 100; 
			
	if(s == 0) {
		// Achromatic (grey)
		r = g = b = v;
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
			
	h /= 60; // sector 0 to 5
	i = Math.floor(h);
	f = h - i; // factorial part of h
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));

	switch(i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
					
		case 1:
			r = q;
			g = v;
			b = p;
			break;
					
		case 2:
			r = p;
			g = v;
			b = t;
			break;
					
		case 3:
			r = p;
			g = q;
			b = v;
			break;
					
		case 4:
			r = t;
			g = p;
			b = v;
			break;
					
		default: // case 5:
			r = v;
			g = p;
			b = q;
	}
			
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

function make_colors(total) {
   var i = 360 / (total - 1); // distribute the colors evenly on the hue range
   var r = []; // hold the generated colors
	for (var x = 0; x < total; x++) {
	var rgb = hsvToRgb(i * x, i * x, 100);
    r.push("rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")"); // you can also alternate the saturation and value for even more contrast between the colors
    }
	q = [];
	for (x=0; x < total/2+1; x++) {
		q.push(r[x]);
		q.push(r[total-x]);
	}
	 return q;
};
// Color makers end

// Helper function to implement the body of the gird
function body_grid(id){
	return '<svg id="main_svg_' + id + '"></svg>';
};

// Calculates the alternative frames
function alt_frames(list_of_blocks) {
	flat_arr = list_of_blocks;
	minimal_side = flat_arr[0];
	surface = 0;
	for (var i = 0; i < flat_arr.length - 1; i=i+2){
		surface = surface + flat_arr[i] * flat_arr[i+1];
		if (Math.min(flat_arr[i],flat_arr[i+1]) > minimal_side) {
			minimal_side = Math.min(flat_arr[i],flat_arr[i+1]);
		}
	};

	maximal_side = Math.ceil(Math.sqrt(surface));

	possibilities = [];
	for (var i = minimal_side; i < maximal_side; i++) {
		other_side = surface/i;
		if (other_side % 1 == 0) {
			possibilities.push([i, other_side])
		};
	};
	return possibilities
}

// Minor Programmeren Story Telling
function story_telling() {
	$("#story").html("<i>Gegeven een frame en een aantal tegels, op hoeveel en op welke manieren kunnen de tegels het frame vullen?</i><br>" +
						"Deze vraag is de hoofdvraag bij het tegelzetprobleem. Voor dit probleem is het handig om de oplossingen te visualiseren, <br>" +
						"dan zijn de oplossingen onderling makkelijker te vergelijken en worden de eventuele patronen wellicht sneller gevonden. <br>" + 
						"Bij verschillende instanties van het probleem zijn al oplossingen gevonden en opgeslagen. <br>" + 
						"Een instantie van het probleem is een frame met bijbehorende tegels die het oppervlak van het frame precies opvullen. <br>" + 
						"Een eenvoudig voorbeeld is een frame met maten 10x10 en vijfentwintig tegels met maten 2x2. <br>" + 
						"Deze tegels kunnen er maar op een unieke manier in als de tegels niet onderscheidbaar zijn, dus er is maar een oplossing.<br>" + 
						"Omdat niet altijd alle oplossingen, laat staan een oplossing, meteen in te zien zijn, <br>" + 
						"is er in dit project een website gebouwd om de oplossingen van een instantie te visualiseren. <br><br>" +
						"Een praktische toepassing van dit probleem is hoe producten in een vrachtwagen passen.<br>" +
						"Een iets minder voor de hand liggend voorbeeld is hoe een aantal machines zo efficient mogelijk ingeroosted kunnen worden.<br>" +
						"Klik <u onclick=location.assign('tileBuilder.html#1&?1')>hier</u> om casus 1 te laden met uitleg...");
}