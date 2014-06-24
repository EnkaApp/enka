define(function(require, exports, module) {

  	var PieceView     = require('./views/PieceView');
  	var colorArray = ['blue', 'green', 'red'];

  	// initializes this.colorQueue with 3 colors
	function PieceGenerator(){
		this.colorQueue = [];
		for(var i = 0; i < 3; i++){
			var color = getRandomColor(0, colorArray.length - 1); 
			this.colorQueue.push(color);	
		}
	}

	PieceGenerator.prototype.createNewPiece = function(size, lastColor, direction, isNotFirst){
		if(!lastColor){
			lastColor = this.getNextColorFromQueue();
			this.addColorToQueue.call(this);
		}
		if(!direction){
			direction = 'left';
		}
		var backColor = this.getNextColorFromQueue();
		this.addColorToQueue.call(this);
		var options = {
			width: size,
			height: size,
			frontBgColor: lastColor,
			backBgColor: backColor,
			direction: direction
		}
		if(!isNotFirst){
			var options = {
				width: size,
				height: size,
				frontBgColor: lastColor,
				backBgColor: lastColor,
				direction: direction
			}
			var piece = new PieceView(options);
			return piece;
		}else{
			var piece = new PieceView(options);
			return piece;
		}

	}

	PieceGenerator.prototype.getNextColorFromQueue = function(){
		return this.colorQueue.shift();
	}

	PieceGenerator.prototype.addColorToQueue  = function(){
		var color = getRandomColor(0, colorArray.length - 1);
		this.colorQueue.push(color);
		// console.log(this.colorQueue)
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
