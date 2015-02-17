def load_first_line(first_line):
	first_line = first_line.split(', ')
	field = [first_line[0], first_line[1]]
	blocks = []
	for i in xrange(2, len(first_line), 2):
		blocks.append([first_line[i], first_line[i+1]])
	return field, blocks

def bits_to_list(bitstring):
	bits_per_block = 4
	left_chunk = bitstring[:bits_per_block]
	right_chunk = bitstring[bits_per_block + 1:]
	processed = [int(left_chunk, 2), bitstring[bits_per_block]]
	if right_chunk == "":
		return [processed]
	else:
		return [processed] + bits_to_list(right_chunk)

def list_to_blocklist(l, blocks):
	blocklist = []
	for i in xrange(len(l)):
		block_id = l[i][0]
		block = blocks[block_id-1]
		if l[i][1] == '0':
			w = block[1]
			h = block[0]
		else:
			w = block[0]
			h = block[1]
		blocklist.append([int(w), int(h)])
	return blocklist

def find_free_xy(field):
	for j in xrange(len(field[0]) - 1):
		for i in xrange(len(field) - 1):
			if field[j][i] == 0:
				return j,i
	raise Exception("Field is full!")


def list_to_coordinates(l, field_x, field_y):
	x = 0
	y = 0
	field = [field_x*[0] for c in range(field_y)]
	solution = [[0, 0, l[0][0], l[0][1]]]
	for x in xrange(l[0][0]):
		for y in xrange(l[0][1]):
			field[y][x] = 1
	x += l[0][0]

	for block in l[1:]:
		print block
		if x - 1 + block[0]:
			x,y = find_free_xy(field)
			print "new line!"
		print x,y
		solution.append([x, y, block[0], block[1]])
		for i in xrange(x, x + block[0]):
			for j in xrange(y, y + block[1]):
				field[j][i] = 1
		x += block[0]
	return field

if '__main__' == __name__:
	print 'first file, first solution.'
	field, blocks = load_first_line('22, 26, 1, 2, 1, 6, 3, 4, 2, 10, 10, 3, 3, 14, 14, 4, 8, 9, 9, 10, 10, 11, 22, 6')
	l = bits_to_list('0001000100001100101110001011000111110111100110100110100')
	l = list_to_blocklist(l, blocks)
	print l
	print list_to_coordinates(l, 22, 26)