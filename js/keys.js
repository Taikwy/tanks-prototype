//keycode enum
const keyboard = Object.freeze({
	//SHIFT: 		16,
	SPACE: 		32,
	LEFT: 		65, 	// A
	UP: 		87, 	// W
	RIGHT: 		68, 	// D
	DOWN: 		83	 	// S
});

//last key pressed
const keys = [];

window.onkeyup = (e) => {
	keys[e.keyCode] = false;
	e.preventDefault();
};

window.onkeydown = (e)=>{
	keys[e.keyCode] = true;
};