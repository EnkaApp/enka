define(function(require, exports, module) {

  	var PieceView     = require('./views/PieceView');
  	var colorArray = ['red', 'orange', 'blue', 'green'];
  	var colorQueue = [];


  	// initializes colorQueue with 3 colors
	function PieceGenerator(){
		for(var i = 0; i < 3; i++){
			var color = getRandomColor(0, colorArray.length - 1); 
			colorQueue.push(color);	
		}
	}

	PieceGenerator.prototype.createNewPiece = function(size, lastColor, direction){
		if(!lastColor){
			lastColor = getNextColorFromQueue();
			addColorToQueue();
		}
		if(!direction){
			direction = 'left';
		}
		var backColor = getNextColorFromQueue();
		addColorToQueue();
		var options = {
			width: size,
			height: size,
			frontBgColor: lastColor,
			backBgColor: backColor,
			direction: direction
		}

		var piece = new PieceView(options);
		return piece;
	}

	function getNextColorFromQueue (){
		return colorQueue.shift();
	}

	function addColorToQueue (){
		var color = getRandomColor(0, colorArray.length - 1);
		colorQueue.push(color);
	}

	function getRandomColor (min, max){
		var num = Math.floor(Math.random() * (max - min + 1)) + min;
		return colorArray[num];
	}

 // create an unending array of random colors.
 // 

	module.exports = PieceGenerator;
});
 // TODO: START WORK ON PIECE CREATION USING COLOR array
