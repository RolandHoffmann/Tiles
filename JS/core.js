function get_case(ID){
	// Import cases
	$.get('cases/' + ID + '.txt', function(data){
		solutions = data.split('\n');
		first_line = solutions[0];
		first_line = first_line.split(', ');
		solutions = solutions.splice(1);
		
		// Init field
		field = [];
		field[0] = parseInt(first_line[0]);
		field[1] = parseInt(first_line[1]);
		
		// Width of the field
		side = 400;
		
		// Make sure that everything fits
		factor = 0.99*Math.pow((side*side)/(Math.pow(Math.max(field[0],field[1]),2)), 1/2);
		
		// Set width/height
		$("#main_svg_" + current_focus).attr("width", side);
		$("#main_svg_" + current_focus).attr("height", side);
		
		// Init blocks
		blocks = [];
		first_line = first_line.splice(2);
		for (i = 0; i < first_line.length - 1;i+=2 ){
			blocks.push([parseInt(first_line[i]), parseInt(first_line[i+1])]);
		}
		number_of_blocks = blocks.length;
		colors = make_colors(number_of_blocks);
		bits_per_block = Math.ceil(Math.log(number_of_blocks)/Math.log(2)); // 14 fits in 4 bits
		
		// Checking validity
		total_surface = 0;
		field_surface = field[0]*field[1];
		for (block in blocks){
			total_surface += blocks[block][0]*blocks[block][1];
		};

		if (total_surface < field_surface){
			alert('This field is too big to fill with these blocks (' + total_surface + '<' + field_surface + ')');
		}
		else if (total_surface > field_surface){
			alert('This field is too small to fill with these blocks (' + total_surface + '<' + field_surface + ')');
		}
		else{
			console.log('Validation OK')
		};
		
		// Set max for input 
		document.getElementById("ID").max = solutions.length - 3;
		$("#main_svg_" + current_focus).empty();
		statistics = {
		"blocks": blocks.length,
		"field": field[0] + " by " + field[1],
		"solutions": solutions.length - 1};
		document.getElementById('dimField').innerHTML = statistics['field'];
		document.getElementById('numBlocks').innerHTML = statistics['blocks'];
		document.getElementById('numSols').innerHTML = statistics['solutions'];
		document.getElementById('header').remove();
		load_blocks();
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

// Color makers
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
}

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
}
// Color makers end

// Used to scroll through the solutions
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
}

function load_solution_wrapper(){
	ID = document.getElementById("ID").value;
	load_solution(ID);
}

function load_solution(ID){
	// If ID ís not given, return the first solution
	if (ID == ''){
		ID = 1;
	}
	// If ID is -1, random button has been pressed, return random sol.
	if (ID == -1){
		ID = Math.floor(Math.random() * solutions.length) + 1;
	};

	// Loads the bitstring
	bitstring = solutions[ID-1].trim().toString(2);
	$(document).ready(function(){
		// Convert the bitstring to an ordered list of blocks
		list_of_blocks = ints_to_list(bitstring);

		// Erase the previous solution
		$("#main_svg_" + current_focus).empty();

		// Make the grid
		b_field = new Array();
		for (i = 0; i < field[1]; i++){
			b_field.push([]);
		};

		// Coordinates of first block
		x = 0;
		y = 0;
		for (b in list_of_blocks){
			// If block is not rotated
			if (list_of_blocks[b][1] == 0){
				width = blocks[list_of_blocks[b][0] - 1][1];
				height = blocks[list_of_blocks[b][0] - 1][0];
			} else {
				// width <=> height
				width = blocks[list_of_blocks[b][0] - 1][0];
				height = blocks[list_of_blocks[b][0] - 1][1];
			};

			// If coordinates to put are on another block or outside field
			if (x + width >= field[0] || b_field[y][x] == 1 || b_field[y][x + width] == 1){
				// Find new valid coordinates
				cactus:
					for (i = 0; i < field[1]; i++){
						for (j = 0; j < field[0]; j++){
							if (b_field[i][j] != 1){
								x = j;
								y = i;
								// console.log("x=",x," and y=",y)
								break cactus;
							};
						};
					};
			};

			// Fill the field
			for (i = y; i < y + height; i++){
				for (j = x; j < x + width; j++){
					b_field[i][j] = 1;
				};
			};

			// Conversions to pixels
			width_disp = width * factor;
			height_disp = height * factor;
			x_disp = x * factor;
			y_disp = y * factor;

			// Get ID of the block and add it to the image
			block_ID = list_of_blocks[b][0];
			color = colors[block_ID];
			$("#main_svg_" + current_focus).append("<rect x=" + x_disp + " y=" + y_disp + " width=" + 
							width_disp + " height=" + height_disp + " style='fill:" + color + ";stroke:black;stroke-width:1' ID=block_" + block_ID + "/>");
			// Refresh page
			$("body").html($("body").html());
			x = x + width;
		};
	});
	document.getElementById("ID").value = ID;
};

function load_blocks(){
	blocks_bs = blocks.slice();
	blocks_bs.reverse()
	// Coordinates of first block
	x_bs = 5;
	y_bs = 5;
	//blocks_bs.sort(function(a,b){return Math.max(b[0],b[1])-Math.max(a[0],a[1])});
	factor_bs = Math.min(150/Math.max(blocks_bs[0][0], blocks_bs[0][1]), 10);
	for (var b=0; b < blocks_bs.length; b++){
		width_bs = Math.max(blocks_bs[b][0], blocks_bs[b][1])*factor_bs;
		height_bs = Math.min(blocks_bs[b][0], blocks_bs[b][1])*factor_bs;
		color = colors[blocks.length - b];
		$("#svg_blocks").append("<rect x=" + x_bs + " y=" + y_bs + " width=" + 
						width_bs + " height=" + height_bs + " style='fill:" + color + ";stroke:black;stroke-width:1'/>");
		y_bs = y_bs + height_bs + 5;
	};
};

grid_text = [" A A A B B B",
        	  " A A A B B B",
        	  " A A A B B B",
       		  " . . . . . ."]

function focus_block(tileId){
	places[current_focus] = places[tileId];
	if(places[tileId] > 2) {
		$('#tile_' + current_focus + '.dev-tile-number').width(92);
		$('#tile_' + current_focus + '.dev-tile-number').height(92);
	};
	temp = $('#graphical-index > div:nth-child(1)').html();
	$('#graphical-index > div:nth-child(1)').html($('#graphical-index > div:nth-child(' + places[tileId] + ')').html());

	$('#graphical-index > div:nth-child(' + places[tileId] + ')').html(temp);
	current_focus = tileId;
	$('#tile_' + current_focus + '.dev-tile-number').width(400);
    $('#tile_' + current_focus + '.dev-tile-number').height(400);
	places[tileId] = 1;
};

function body_grid(id){
	return '<svg width=100% height=100% id="main_svg_' + id + '"></svg>';
};

$(function() {
    var el = document.getElementById('graphical-index'),
        grid = new Tiles.Grid(el);

    // template is selected by user, not generated so just
    // return the number of columns in the current template
    grid.resizeColumns = function() {
        return this.template.numCols;
    };

    // by default, each tile is an empty div, we'll override creation
    // to add a tile number to each div
    grid.createTile = function(tileId) {
        var tile = new Tiles.Tile(tileId);
        tile.$el.append('<div class="dev-tile-number" width=92px height=92px ID="tile_' + tileId +'" onclick="focus_block(' + tileId +')">' + body_grid(tileId) +'</div>');
        return tile;
    };

    // set the new template and resize the grid
    grid.template = Tiles.Template.fromJSON(grid_text);  
    grid.isDirty = true;
    grid.resize();

    // adjust number of tiles to match selected template
    grid.updateTiles([1,2,3,4,5,6,7,8]);
    grid.redraw(true);

	$('#tile_1').width(400);
    $('#tile_1').height(400);
	$('#tile_2').width(400);
    $('#tile_2').height(400);

    // Tile ID -> current place
    places = {1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10};

	current_focus = 1
});

$(document).ready(function(){
	redirect = location.hash;
	redirect = redirect.replace('#', '');
	$.get("cases/cases.txt", function(data) {
		cases = data.split('\n');
		ID = cases[redirect];
		get_case(ID);
	});
});