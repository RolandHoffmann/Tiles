// Imports the field, blocks and solutions
function get_case(case_ID){
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
		for (block in blocks){
			total_surface += blocks[block][0]*blocks[block][1];
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
		document.getElementById("ID").max = solutions.length - 3;
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

		// Load a solution
		load_solution(1);
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
	if (document.getElementById("ID").value == ''){
		load_solution('');
		return;
	}
	// If << is pressed, return the ID-1'th solution
	if (sign == '-'){
		prev = parseInt(document.getElementById("ID").value) - 1
		if (prev < 1){
			load_solution(solutions.length-1);
		} else {
			load_solution(prev);
		}
	}
	// If >> is pressed, return the ID+1'th solution
	else if (sign == '+'){
		next = parseInt(document.getElementById("ID").value) + 1
		if (next > solutions.length - 1){
			load_solution(1);
		} else {
			load_solution(next);
		}
	};
};

// Display solution
function load_solution_wrapper(){
	ID = document.getElementById("ID").value;
	load_solution(ID);
};

// Load the ID'th solution
function load_solution(ID){
	load_solution_on_tile(ID, 1);
	load_solution_on_tile(ID + 1, 2);
	document.getElementById("ID").value = ID;
};

function load_solution_on_tile(ID, tileId){
	// If ID ís not given, return the first solution
	if (ID == ''){
		ID = 1;
	}
	// If ID is -1, random button has been pressed, return random sol.
	if (ID == -1){
		ID = Math.floor(Math.random() * solutions.length) + 1;
	};

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
		var color = colors[blocks.length - b];
		$("#svg_blocks").append("<rect x=" + x_bs + " y=" + y_bs + " width=" + 
						width_bs + " height=" + height_bs + " style='fill:" + color + ";stroke:white;stroke-width:1'/>");
		y_bs = y_bs + height_bs + 5;
	};
};

function focus_block(tileId){
	ID = parseInt(document.getElementById("ID").value);
	load_solution(ID + tileId - 1);
};

// Loads the grid and tiles
$(function() {
   	$('#graphical-index').append('<svg class="big_tile" x=5 y=5 ID="main_svg_1" onclick="focus_block(1)"><rect width="400" height="400" style="fill:#2E2E2E"/></svg>'); 
   	$('#graphical-index').append('<svg class="big_tile" x=425 y=5 ID="main_svg_2" onclick="focus_block(2)"><rect width="400" height="400" style="fill:#2E2E2E"/></svg>');
   	x = 5;
   	y = 445;
   	for (var tileId = 3; tileId < 9; tileId++) {
   		$('#graphical-index').append('<svg class="small_tile" x="' + x + '" y="' + y + '" ID="main_svg_' + tileId +'" onclick="focus_block(' + tileId +')"><rect width="92" height="92" style="fill:#2E2E2E;stroke:white;stroke-width:2"/></svg>');	
   		x += 146;
   	};
   	
    // Tile ID -> current place
    places = {1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10};
});

$(document).ready(function(){
	var redirect = location.hash;
	redirect = redirect.replace('#', '');
	$.get("cases/cases.txt", function(data) {
		cases = data.split('\n');
		case_ID = cases[redirect];
		get_case(case_ID);
		$('body').append('<br><a href="cases/' + case_ID +'.txt" download>Download this case</a>')
	});
});