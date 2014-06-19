define(function(require, exports, module) {

  	var PieceView     = require('./views/PieceView');
  	var colorArray = ['red', 'orange', 'yellow', 'blue', 'green', 'black', 'white'];
  	var colorQueue = [];


	function PieceGenerator(){
		var piece = new PieceView();
	}

	function ColorGenerator(min, max){
		var num = Math.floor(Math.random() * (max - min + 1)) + min;
		return colorArray[num];
	}
	
};

 // create an unending array of random colors.
 // 

 // TODO: START WORK ON PIECE CREATION USING COLOR array