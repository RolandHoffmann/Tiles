// This loads the first page of the site

// The layout of the blocks that can be selected
pre_text = ["."]

// loads the cases
$(document).ready(function() {
	// Get cases
	$.get("cases/cases.txt", function(data) {
		var raw_cases = data.split('\n');

		// Array that contains the cases
		cases = [];
		for(var index=0; index < raw_cases.length;index++) {

			// Append a division which will contain the case
			$("#body").append("<div id='start-graphical-index" + index 
				+ "' class='grid_start' onclick='load_case(" + index 
					+ ")'><svg id='svg_" + index + "'></svg></div>");

			// variable elements contains the field and all blocks
			var elements = raw_cases[index].split(', ');

			// Array that contains the block of this case
			var blocks = [];
			for (var i = 2; i < elements.length - 1;i+=2 ){
				blocks.push([parseInt(elements[i]), parseInt(elements[i+1])]);
			}
			cases.push({'field': [elements[0], elements[1]], 'blocks': blocks});

			// Make colors specific for this case
			colors = make_colors(blocks.length);

			// Load current solution
			load_solution(index);

			// refresh page
			$("body").html($("body").html());
		};
	});
});

// Loads the blocks
function load_solution(i){
	blocks = cases[i]['blocks'];
	field = cases[i]['field'];

	// The y-coordinate of the text is fixed
	y_text = 15;
	$(document).ready(function(){
		// Coordinates of first block
		x = 5;
		y = 20;

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

		// Last change to place the last text correctly
		x = x + width + 5;
		$("#svg_" + i).append("<text x=" + x + " y=" + y_text + ">in a " + field[0] + " x " + field[1] + " field</text>"); 
	});
};

// The function that redirects to the full case
function load_case(i) {
	location.assign('tileBuilder.html#' + i);
};