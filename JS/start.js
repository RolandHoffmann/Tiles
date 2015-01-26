// This loads the first page of the site

// The layout of the blocks that can be selected
pre_text = ["."]

// Helper function to implement the body of the gird
function body_grid(id){
	return '<svg width=100% height=100% id="main_svg_' + id + '"></svg>';
};
			
$(function() {
	// get grid
    var el = document.getElementById('graphical-index1'),
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
    grid.template = Tiles.Template.fromJSON(pre_text);  
    grid.isDirty = true;
    grid.resize();

    // adjust number of tiles to match selected template
    grid.updateTiles([1,2,3,4,5,6,7,8,9,10]);
    grid.redraw(true);

	$('#tile_1').width(400);
    $('#tile_1').height(400);
});

// The function that redirects to the full case
function load_case(i) {
	location.assign('tileBuilder.html#' + i);
};

// Loads the blocks
function load_solution(i){
	blocks = cases[i]['blocks'];
	field = cases[i]['field'];
	$(document).ready(function(){
		// Coordinates of first block
		x = 5;
		y = 5;
		blocks.sort(function(a,b){return Math.min(b[0],b[1])-Math.min(a[0],a[1])})
		factor = Math.min(150/Math.max(blocks[0][0], blocks[0][1]), 10);
		for (b=0; b < blocks.length; b++){
			width = Math.max(blocks[b][0], blocks[b][1])*factor;
			height = Math.min(blocks[b][0], blocks[b][1])*factor;
			$("#svg_" + i).append("<rect x=" + x + " y=" + y + " width=" + 
							width + " height=" + height + " style='fill:" + colors[blocks.length - b] + ";stroke:black;stroke-width:1'/>");
			x_text = x + 1;
			y_text = y + height + 13;
			$("#svg_" + i).append("<text x=" + x_text + " y=" + y_text + ">" + blocks[b][0] + " x " + blocks[b][1] + "</text>"); 
			x = x + width + 5;
		};
		x = x + width + 5;
		y = y + 10;
		$("#svg_" + i).append("<text x=" + x + " y=" + y + ">In a " + field[0] + " x " + field[1] + " field</text>"); 
	});
};

// loads the cases
$(document).ready(function() {
	$.get("cases/cases.txt", function(data) {
		raw_cases = data.split('\n');
		cases = [];
		for(index=0; index < raw_cases.length;index++) {
			elements = raw_cases[index].split(', ');
			blocks = [];
			for (i = 2; i < elements.length - 1;i+=2 ){
				blocks.push([parseInt(elements[i]), parseInt(elements[i+1])]);
			}
			cases.push({'field': [elements[0], elements[1]], 'blocks': blocks});
			colors = make_colors(blocks.length);
			load_solution(index);
			$("body").html($("body").html());
		};
	});
});

// Same functions as core.js below

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