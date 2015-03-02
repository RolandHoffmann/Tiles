// Imports the field, blocks and solutions
cases_loaded = false;
cases_related_loaded = false;

function get_case(case_ID){
	// Import closest solutions
	$.get('cases/' + case_ID + '_related.txt', function(data){
		var all_solutions = data.split('\n');
		related_solutions = [];
		for(i=0; i < all_solutions.length; i++){
			var one_solution = all_solutions[i].split(', ');
			related_solutions.push(one_solution);
		};
		cases_related_loaded = true;
		if (cases_loaded == true){
			// Load a solution is all is loaded
			load_solution(1);
		};
	});

	// Import cases
	$.get('cases/' + case_ID + '.txt', function(data){
		solutions = data.split('\n');
		var first_line = solutions[0];
		var first_line = first_line.split(', ');
		solutions = solutions.splice(1);
		
		// Init field
		field = [];
		field[0] = parseInt(first_line[0]);
		field[1] = parseInt(first_line[1]);
		
		// Width of the field
		side = 400;
		
		// Make sure that everything fits
		factor = 0.99*Math.pow((side*side)/
			(Math.pow(Math.max(field[0],field[1]),2)), 1/2);
		
		// Set width/height
		$("#main_svg_1").attr("width", side);
		$("#main_svg_1").attr("height", side);
		$("#main_svg_2").attr("width", side);
		$("#main_svg_2").attr("height", side);

		// Drop values of array at indices 0 and 1 (field sizes)
		first_line = first_line.splice(2);

		// Load blocks
		blocks = [];
		var blocks_flat = [];
		for (i = 0; i < first_line.length - 1;i+=2 ){
			blocks.push([parseInt(first_line[i]), parseInt(first_line[i+1])]);
			blocks_flat.push(parseInt(first_line[i]));
			blocks_flat.push(parseInt(first_line[i+1]));
		}
		number_of_blocks = blocks.length;
		colors = make_colors(number_of_blocks);
		
		// bits_per_block = log_2(number of blocks) + 1
		bits_per_block = Math.ceil(Math.log(number_of_blocks)/Math.log(2));
		
		// Checking validity
		total_surface = 0;
		for (var i=0; i < blocks.length; i++){
			total_surface += blocks[i][0]*blocks[i][1];
		};

		field_surface = field[0]*field[1];
		if (total_surface < field_surface){
			alert('This field is too big to fill with these blocks (' + 
				total_surface + '<' + field_surface + ')');
		}
		else if (total_surface > field_surface){
			alert('This field is too small to fill with these blocks (' + 
				total_surface + '<' + field_surface + ')');
		} else {
			console.log('Validation OK')
		};
		
		// Set max for input 
		$("#ID_input").max = solutions.length - 3;
		$("#main_svg_1").empty();
	
		// Calculate possible frames
		var pos_frames = alt_frames(blocks_flat);
		pos_frames = pos_frames.join('; ');
		pos_frames = pos_frames.replace(/,/g, ' by ');
		
		// Set statistics
		statistics = {
			"blocks": blocks.length,
			"field": field[0] + " by " + field[1],
			"solutions": solutions.length - 1,
			"alt_frames": pos_frames
			};
		document.getElementById('dimField').innerHTML = statistics['field'];
		document.getElementById('numBlocks').innerHTML = statistics['blocks'];
		document.getElementById('numSols').innerHTML = statistics['solutions'];
		document.getElementById('posFrames').innerHTML = statistics['alt_frames'];
		document.getElementById('header').remove();
		load_blocks();
		cases_loaded = true;
		if (cases_related_loaded == true){
			// Load a solution is all is loaded
			load_solution(1);
		};
	});
};

// Converts a bitstring to a list with entries [ID, rotated]
function ints_to_list(str){
	str = str.toString(2);
	left_chunk = str.slice(0, bits_per_block);
	right_chunk = str.slice(bits_per_block + 1);
	// Process left chunk and parse right chunk
	processed = [[parseInt(left_chunk, 2), str[bits_per_block]]];
	if (right_chunk == ""){
		return processed;
	} 
	else 
	{
		return processed.concat(ints_to_list(right_chunk));
	};
};

// Go through the solutions
function var_solution(sign){
	// If no ID is given, return the first solution
	if ($("#ID_input").val() == ''){
		load_solution(1);
	}
	// If << is pressed, return the ID-1'th solution
	if (sign == '-'){
		prev = parseInt($("#ID_input").val()) - 1
		if (prev < 1){
			load_solution(1);
		} else {
			load_solution(prev);
		}
	}
	// If >> is pressed, return the ID+1'th solution
	else if (sign == '+'){
		next = parseInt($("#ID_input").val()) + 1
		if (next > solutions.length - 2){
			load_solution(next - 1);
		} else {
			load_solution(next);
		}
	};
};

// Display solution
function load_solution_wrapper(){
	ID = $("#ID_input").val();
	load_solution(ID);
};

// Load the ID'th solution
function load_solution(ID){
	// If ID ís not given, return the first solution
	if (ID == ''){
		ID = 1;
	};

	// If ID is -1, random button has been pressed, return random solution
	if (ID < 1){
		ID = Math.floor(Math.random() * solutions.length);
	};
	
	console.log(ID);
	load_solution_on_tile(ID, 1);
	
	almost_same = parseInt(related_solutions[ID-1][1]);
	load_solution_on_tile(almost_same, 2);
	$('#main_svg_2').attr('onclick', 'load_solution(' + almost_same + ')');
	load_small_tiles(ID);
	// Refresh page
	$("body").html($("body").html());
	$("#ID_input").val(ID);
};

function load_small_tiles(ID) {
	for (var tile=3; tile < 9; tile++) {
		fill_small_tile(ID, tile);
	};
};

function fill_small_tile(ID, tile_number) {
	closest_solutions = related_solutions[ID-1];
	var loaded_ID = closest_solutions[2 * (tile_number - 2) + 1];
	var loaded_factor = parseFloat(closest_solutions[2 * (tile_number - 3)]).toFixed(2);
	$("#main_svg_" + tile_number).empty();
	$('#main_svg_' + tile_number).append('<rect width="100" height="100" style="fill:#565656;stroke:white;stroke-width:2"/>');
	$('#main_svg_' + tile_number).append('<text x=5 y=15>ID:</text>');
	$('#main_svg_' + tile_number).append('<text x=5 y=30>Factor:</text>');
	$('#main_svg_' + tile_number).append('<text x=55 y=15>' + loaded_ID + '</text>');
	$('#main_svg_' + tile_number).append('<text x=55 y=30>' + loaded_factor + '</text>');
	$('#main_svg_' + tile_number).attr('onclick', 'load_solution(' + loaded_ID + ')');
};

function load_solution_on_tile(ID, tileId){
	// Loads the bitstring
	var bitstring = solutions[ID-1].trim().toString(2);
	$(document).ready(function(){
		// Convert the bitstring to an ordered list of blocks
		var list_of_blocks = ints_to_list(bitstring);

		// Erase the previous solution
		$("#main_svg_" + tileId).empty();

		// Make the grid
		var b_field = new Array();
		for (i = 0; i < field[1]; i++){
			b_field.push([]);
		};

		// Coordinates of first block
		var x = 0;
		var y = 0;
		for (b in list_of_blocks){
			// If block is not rotated
			if (list_of_blocks[b][1] == 0){
				var width = blocks[list_of_blocks[b][0] - 1][1];
				var height = blocks[list_of_blocks[b][0] - 1][0];
			} else {
				// width <=> height
				var width = blocks[list_of_blocks[b][0] - 1][0];
				var height = blocks[list_of_blocks[b][0] - 1][1];
			};

			// If coordinates to put are on another block or outside field
			if (x + width >= field[0] || b_field[y][x] == 1 || b_field[y][x + width] == 1){
				// Find new valid coordinates
				ice:
					for (var i = 0; i < field[1]; i++){
						for (var j = 0; j < field[0]; j++){
							if (b_field[i][j] != 1){
								x = j;
								y = i;
								// console.log("x=",x," and y=",y)
								break ice;
							};
						};
					};
			};

			// Fill the field
			for (var i = y; i < y + height; i++){
				for (var j = x; j < x + width; j++){
					b_field[i][j] = 1;
				};
			};

			// Conversions to pixels
			var width_disp = width * factor;
			var height_disp = height * factor;
			var x_disp = x * factor;
			var y_disp = y * factor;

			// Get ID of the block and add it to the image
			var block_ID = list_of_blocks[b][0];
			var color = colors[block_ID];
			$("#main_svg_" + tileId).append("<rect x=" + x_disp + " y=" + 
				y_disp + " width=" + width_disp + " height=" + height_disp + 
				" style='fill:" + color + ";stroke:white;stroke-width:1' ID=block_" 
				+ block_ID + "/>");
			x = x + width;
		};
		
		// Add ID to the svg
		$("#main_svg_" + tileId).append('<rect x=2 y=375 width=50 height=20 opacity=0.5/>')
		$("#main_svg_" + tileId).append('<text x=5 y=390>#' + ID + '</text>');
		
		// Refresh page
		$("body").html($("body").html());
	});
};

function load_blocks(){
	var blocks_bs = blocks.slice();
	blocks_bs.reverse()
	// Coordinates of first block
	var x_bs = 5;
	var y_bs = 5;

	//blocks_bs.sort(function(a,b){return Math.max(b[0],b[1])-Math.max(a[0],a[1])});
	factor_bs = Math.min(150/Math.max(blocks_bs[0][0], blocks_bs[0][1]), 10);
	for (var b=0; b < blocks_bs.length; b++){
		var width_bs = Math.max(blocks_bs[b][0], blocks_bs[b][1])*factor_bs;
		var height_bs = Math.min(blocks_bs[b][0], blocks_bs[b][1])*factor_bs;
		if (height_bs < 15) {
			height_bs = 15;
		};
		var color = colors[blocks.length - b];
		$("#svg_blocks").append("<rect x=" + x_bs + " y=" + y_bs + " width=" + 
						width_bs + " height=" + height_bs + " style='fill:" + color + ";stroke:white;stroke-width:1'/>");
		x_text = x_bs + width_bs + 10
		y_text = y_bs + 15
		$("#svg_blocks").append("<text x=" + x_text + " y=" + y_text + ">" + blocks_bs[b][0] + "x" + blocks_bs[b][1] + "</text>");
		y_bs = y_bs + height_bs + 5;
	};
};

// Loads the tiles on the grid
$(function() {
   	$('#graphical-index').append('<svg class="big_tile" x=5 y=5 ID="main_svg_1"><rect width="400" height="400" style="fill:#2E2E2E"/></svg>'); 
   	$('#graphical-index').append('<svg class="big_tile" x=425 y=5 ID="main_svg_2"><rect width="400" height="400" style="fill:#2E2E2E"/></svg>');
   	x = 5;
   	y = 445;
   	for (var tileId = 3; tileId < 9; tileId++) {
   		$('#graphical-index').append('<svg class="small_tile" x="' + x + '" y="' + y + '" ID="main_svg_' + tileId +'" onclick=""></svg>');	
   		x += 140;
   	};
});

$(document).ready(function(){
	var redirect = location.hash;
	redirect = redirect.split('&');
	if (redirect.length > 1 && redirect[1] == '?1'){
		$('#story_2').html("Hieronder is een instantie van het probleem te zien.<br>" +
							"Aan de linkerkant is te zien welke blokken gebruikt worden in deze instantie.<br>" +
							"Aan de rechterkant zijn een aantal statistieken te zien.<br>" +
							"In het midden zijn twee, of een (ligt aan de resolutie), oplossingen te zien van deze instantie.<br>" +
							"Dit zijn niet zomaar twee willekeurige oplossingen, want het verschil tussen deze oplossingen is minimaal.<br>" +
							"De grijze blokken aan de onderkant zijn oplossingen die sterk verwant zijn aan de linkeroplossing.<br>" +
							"De factor is de verhouding tussen het aantal blokken die op dezelfde plek zitten en het totaal aantal blokken.<br>" + 
							"Alle blokken zijn klikbaar, de desbetreffende oplossing wordt dan geladen.<br>" +
							"Een specifieke of willekeurige oplossing opvragen kan door onderaan de pagina een getal in te vullen en op <i>Display Solution</i> te klikken<br>" +
							"Als je de oplossingen wilt downloaden voor nader onderzoek, kan dat door te klikken op <u>Download this case</u>");
	} else {
		$('#story_2').remove();
	}
	
	redirect = redirect[0].replace('#', '');
	$.get("cases/cases.txt", function(data) {
		var cases = data.split('\n');
		case_ID = cases[redirect];
		get_case(case_ID);
		$('#mainFrame').append('<br><a href="cases/' + case_ID +'.txt" download>Download this case</a>')
	});
});