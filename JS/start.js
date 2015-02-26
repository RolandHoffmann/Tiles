// This loads the first page of the site

// loads the cases
$(document).ready(function() {
	// Get cases
	$.get("cases/cases.txt", function(data) {
		var raw_cases = data.split('\n');

		// Array that contains the cases
		cases = [];
		for(var index=0; index < raw_cases.length;index++) {
			// variable elements contains the field and all blocks
			var elements = raw_cases[index].split(', ');

			// Array that contains the block of this case
			var blocks = [];
			var blocks_flat = [];
			for (var i = 2; i < elements.length - 1;i+=2 ){
				blocks.push([parseInt(elements[i]), parseInt(elements[i+1])]);
				blocks_flat.push(parseInt(elements[i]));
				blocks_flat.push(parseInt(elements[i+1]));
			}
			cases.push({'field': [parseInt(elements[0]), parseInt(elements[1])], 
						'blocks': blocks,
						'alt_frames': alt_frames(blocks_flat)});

			// Make colors specific for this case
			colors = make_colors(blocks.length);

			// Append a division which will contain the case
			$("#body").append("<div id='start-graphical-index" + index 
				+ "' class='grid_start'><h1>" + raw_cases[index] + 
				"</h1><svg id='svg_" + index + "' onclick='load_case(" 
					+ index + ")'></svg></div>");

			// Load current solution
			load_solution_data(index);
			load_solution(index);

			// refresh page
			$("body").html($("body").html());
		};
	});
});

function load_solution_data(i){
	var blocks = cases[i]['blocks'];
	var field = cases[i]['field'];
	var frames = cases[i]['alt_frames'];
	y_text = 15;
	x_text = 5;
	$("#svg_" + i).append("<text x=" + x_text + " y=" + y_text + ">Field size:</text>");
	y_text += 15;
	$("#svg_" + i).append("<text x=" + x_text + " y=" + y_text + ">Amount of blocks:</text>");
	y_text += 15;
	$("#svg_" + i).append("<text x=" + x_text + " y=" + y_text + ">Possible frames:</text>");
	y_text = 15;
	x_text += 120
	$("#svg_" + i).append("<text x=" + x_text + " y=" + y_text + ">" +
						field[0] + " by " + field[1] + "</text>");
	y_text += 15;
	$("#svg_" + i).append("<text x=" + x_text + " y=" + y_text + ">" +
					blocks.length + "</text>");
	y_text += 15;

	if (frames.length > 4){
		frames = frames.splice(0,3);
		frames.push('...');
	}
	frames = frames.join('; ');
	frames = frames.replace(/,/g, 'x');
	$("#svg_" + i).append("<text x=" + x_text + " y=" + y_text + ">" +
					frames + "</text>");
};

// Loads the blocks
function load_solution(i){
	var blocks = cases[i]['blocks'];
	var field = cases[i]['field'];

	// The y-coordinate of the text is fixed
	var y_text = 15;
	$(document).ready(function(){
		// Coordinates of first block
		var x = 300;
		var y = 20;

		// Sort the blocks based on height
		blocks.sort(function(a,b){return Math.min(b[0],b[1])-Math.min(a[0],a[1])})

		// A factor to change the size of the blocks which is maximal 10
		factor = Math.min(150/Math.max(blocks[0][0], blocks[0][1]), 10);

		// Iterate through all blocks
		for (b=0; b < blocks.length; b++){
			// Apply factor to widht and height of block
			width = Math.max(blocks[b][0], blocks[b][1])*factor;
			height = Math.min(blocks[b][0], blocks[b][1])*factor;
			// Append block to the svg
			$("#svg_" + i).append("<rect x=" + x + " y=" + y + " width=" + width 
				+ " height=" + height + " style='fill:" + 
				colors[blocks.length - b] + ";stroke:white;stroke-width:1'/>");

			// Change the x-coordinate of the text so it aligns to the block
			x_text = x + 1;

			// Append the text to the svg (on top of the block)
			$("#svg_" + i).append("<text x=" + x_text + " y=" + y_text + ">" + 
				blocks[b][0] + " x " + blocks[b][1] + "</text>"); 
			
			// Change the x-coordinate for the next block (the 5 is a margin)
			x = x + width + 5;
		};
	});
};

// The function that redirects to the full case
function load_case(i) {
	location.assign('tileBuilder.html#' + i);
};