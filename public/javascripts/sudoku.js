var cells = [];
for (var x = 0; x < 9; x++) {
        cells[x] = [];
        for (var y = 0; y < 9; y++) {
            cells[x][y] = new Cell(x, y);
        }
    }

function Cell(x, y){
	this.x = x;
    this.y = y;
    this.corners = [];
    this.center = "";
    this.value = "";
    this.locked = false;
    this.selected = false;
};

var camera, scene, renderer;
var controls;
var objects = [];
var targets = { table: [], sphere: [], helix: [], grid: [] };
var mode = "NORMAL";
var mode_html;
var selected_cell;

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 3000;

	scene = new THREE.Scene();

	// table

	for (var i = 0; i < cells.length; i++){
		for (var j = 0 ; j < cells[0]. length; j++){

			var cell = document.createElement( 'div' );
			cell.className = 'cell';
			cell.id = "cell_" + i + j;

			cell.addEventListener("click", function(){
				curr_cell = cells[Number(this.id[5])][Number(this.id[6])];
				if (curr_cell.locked) {
					return;
				}
				if (curr_cell.selected){
					selected_cell = undefined;
					curr_cell.selected = false;
				}
				else {
					if (selected_cell){
						selected_cell.selected = false;
					}
					curr_cell.selected = true;
					selected_cell = curr_cell;
				}
				socket.emit('Update Grid', {"cells": cells, "selected_cell": selected_cell});
			});


			for (var c = 1; c < 5; c++){
				var corner = document.createElement('div');
				corner.className = "corner"+ c;
				corner.id = "corner" + c + "_" + i + j;
				cell.appendChild(corner);
			}


			var value = document.createElement( 'div' );
			value.className = 'value';
			value.id = "value_" + i + j;
			cell.appendChild( value );


			var center = document.createElement( 'div' );
			center.className = "center";
			center.id = "center_" + i + j;
			cell.appendChild( center );


			if (i == 0){
				cells[i][j].posY = 950;
			}
			else {
				cells[i][j].posX = cells[i-1][j].posX;
				cells[i][j].posY = cells[i-1][j].posY - 210;
				if (i == 3 || i == 6){
					cells[i][j].posY -=10;
				}
			}
			if (j == 0){
				cells[i][j].posX = -1330;
			}
			else {
				cells[i][j].posX =  cells[i][j-1].posX + 210;
				cells[i][j].posY = cells[i][j-1].posY;
				if (j == 3 || j == 6){
					cells[i][j].posX +=10;
				}
			}



			var object = new THREE.CSS3DObject( cell );
			object.name = "cell_" + i + j;
			object.position.x = cells[i][j].posX;
			object.position.y = cells[i][j].posY;
			object.position.z = 0;
			scene.add(object);
			objects.push(object);
		}
	}

	//

	renderer = new THREE.CSS3DRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.getElementById( 'container' ).appendChild( renderer.domElement );


	//

	window.addEventListener( 'resize', onWindowResize, false );

	mode_html = document.getElementById("mode");

	document.addEventListener('keyup', function(event){
		var keyval = event.keyCode - 48;
		if (keyval >= 1 && keyval <= 9 && selected_cell){
			if (mode == "NORMAL"){
				if (selected_cell.value == keyval){
					selected_cell.value = "";
				}
				else {
					selected_cell.value = keyval;
				}
			}
			else if (mode == "CENTER"){
				index = selected_cell.center.indexOf(keyval);
				if (index != -1){
					selected_cell.center = selected_cell.center.replace(keyval, "");
				}
				else{
					selected_cell.center += keyval;
					selected_cell.center.split('').sort().join('');
				}
			}
			else if (mode == "CORNER"){
				index = selected_cell.corners.indexOf(keyval);
				if (index != -1){
					selected_cell.corners.splice(index, 1);
				}
				else if (selected_cell.corners.length < 4){
					selected_cell.corners.push(keyval);
					selected_cell.corners.sort();
				}
			}

		}
		// L
		else if (keyval == 28){
			for (var i = 0; i < cells.length; i++){
				for (var j = 0; j < cells[0].length; j++){
					if (cells[i][j].value){
						cells[i][j].locked = true;
					}
				}
			}
		}

		// Backspace
		else if (keyval == -40){
			selected_cell.value = "";
			selected_cell.corners = [];
			selected_cell.center = "";
		}

		// Z
		else if (keyval == 42){
			mode = "NORMAL";
		}

		// X
		else if (keyval == 40){
			mode = "CENTER";
		}

		// C
		else if (keyval == 19){
			mode = "CORNER";
		}
		socket.emit('Update Grid', {"cells": cells, "selected_cell": selected_cell});
	});

	render();

	socket = io();
	socket.on('Update Grid', function(data){
        cells = data["cells"];
        // Can't directly write selected_cell = data["selected_cell"] as it needs to refer to the exact cell object of THIS client.
        if (data["selected_cell"]){
        	selected_cell = cells[data["selected_cell"].x][data["selected_cell"].y];
        }
        else {
        	selected_cell = undefined;
        }
    });
}



function updateCells(){
	mode_html.textContent = mode;
	for (var i = 0; i < objects.length; i++){

		var object = objects[i];
		var cell = cells[Number(object.name[5])][Number(object.name[6])];
		var x = cell.x;
		var y = cell.y;

		var cell_html = document.getElementById("cell_" + x + y);

		if (cell.locked){
			cell_html.style.backgroundColor = 'rgba(4,76,76)';
		}
		else if (cell.selected) {
			cell_html.style.backgroundColor = 'rgba(55,144,165)';
		}
		else {
			cell_html.style.backgroundColor = 'rgba(0,127,127)';
		}

		var value = document.getElementById("value_" + x + y);
		var center = document.getElementById("center_" + x + y);


		if (cell.value){
			value.textContent = cell.value;
			center.textContent = "";
		}
		else{
			for (var c  = 1; c < 5; c++){
				var corner = document.getElementById("corner" + c + "_" + x + y);
				if (cell.corners[c-1]){
					corner.textContent = cell.corners[c-1];
				}
				else{
					corner.textContent = "";
				}
			}
			if (cell.center) {
				center.textContent = cell.center;
			}
			else {
				center.textContent = "";
			}
			value.textContent = "";
		}

		

		

	}
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	render();

}

function animate() {

	requestAnimationFrame( animate );
	render();

}

function render() {
	renderer.render( scene, camera );
	updateCells();
}
