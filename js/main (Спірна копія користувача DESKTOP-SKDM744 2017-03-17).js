var

canvas = document.getElementById("hockey"),
ctx = canvas.getContext("2d"),
width = canvas.width,
height = canvas.height;

var mx = canvas.width/2,
    my = canvas.height/2;

var lineHalfWidth = 2;

var gateWidth = 100;

var myData = {
    bx: 0,
    by: 0,
};
bxVel = 0;
byVel = 0;

batSize = 25;


var puckData = {
    xVel: 0,
    yVel: 0,
    x: canvas.width/2,
    y: canvas.height/2
}
var puckDecel = 2;
puckSize = 10;


function main(){


	run();
}

function run(){

	var loop = function(){
		update();
		render();
		window.requestAnimationFrame(loop, canvas);
	}
	window.requestAnimationFrame(loop, canvas);
}

function update(){

    bxVel = ((mx-myData.bx)/10);
    byVel = ((my-myData.by)/10);
    myData.bx += bxVel;
    myData.by += byVel;

    //My Collision With Walls
    if(myData.bx + batSize > canvas.width){
        myData.bx = canvas.width - batSize;
    }
    if(myData.bx < batSize){
        myData.bx = batSize;
    }
    if(myData.by - batSize < canvas.height/2){
        myData.by = canvas.height/2 + batSize;   
    }
    if(myData.by + batSize > canvas.height){
        myData.by = canvas.height - batSize;
    }
    
    //move puck
    var distance = Math.sqrt( Math.pow(myData.bx - puckData.x, 2) + Math.pow(myData.by - puckData.y, 2) );
    if(distance < puckSize+batSize){
        var overlap = puckSize+batSize-distance;
        var pushPower = overlap + 1;
        var angle = Math.atan2(myData.by-puckData.y, myData.bx-puckData.x);
        var nx = pushPower*Math.cos(angle+Math.PI);
        var ny = pushPower*Math.sin(angle+Math.PI);
        puckData.xVel += nx;
        puckData.yVel += ny;
        console.log("op");
        //enemyConnection && enemyConnection.send({dataType:1, data:puckData});
    }
    puckData.x += puckData.xVel;
    puckData.y += puckData.yVel;
    puckData.xVel -= (puckData.xVel / 300) * puckDecel;
    puckData.yVel -= (puckData.yVel / 300) * puckDecel;
    
    //Puck Collision With Walls
     if(puckData.x + puckSize > canvas.width){
        puckData.x = canvas.width - puckSize;
        puckData.xVel = -puckData.xVel;
        //enemyConnection && enemyConnection.send({dataType:1, data:puckData});
    }
    if(puckData.x < puckSize){
        puckData.x = puckSize;
        puckData.xVel = -puckData.xVel;
        //enemyConnection && enemyConnection.send({dataType:1, data:puckData});
    }
    if(puckData.y < puckSize && puckData.x > canvas.width/2-gateWidth/2 && puckData.x < canvas.width/2+gateWidth/2 && puckData.y < 0){
        //myPoints++;
        //resetPuck();
        console.log('jj');
    } else if(puckData.y < puckSize && (puckData.x <= canvas.width/2-gateWidth/2 || puckData.x >= canvas.width/2+gateWidth/2)){
        puckData.y = puckSize;
        puckData.yVel = -puckData.yVel;
        //enemyConnection && enemyConnection.send({dataType:1, data:puckData});
    }
    if(puckData.y + puckSize > canvas.height && puckData.x > canvas.width/2-gateWidth/2 && puckData.x < canvas.width/2+gateWidth/2 && puckData.y > canvas.height){
        //enemyPoints++;
        //resetPuck();
        console.log('ll');
    } else if(puckData.y + puckSize > canvas.height && (puckData.x <= canvas.width/2-gateWidth/2 || puckData.x >= canvas.width/2+gateWidth/2)){
        puckData.y = canvas.height - puckSize;
        puckData.yVel = -puckData.yVel;
        //enemyConnection && enemyConnection.send({dataType:1, data:puckData});
    }
    
}

function render(){
ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    //lines
    ctx.save();
    ctx.fillStyle = "yellow";
    ctx.fillRect(0, canvas.height/2 - lineHalfWidth, canvas.width, lineHalfWidth*2);
    ctx.restore();
    //My Gate
    ctx.save();
    ctx.fillStyle = "yellow";
    ctx.fillRect(canvas.width/2 - gateWidth/2, canvas.height - lineHalfWidth, gateWidth, lineHalfWidth*2);
    ctx.restore();
    //Enemy Gate
    ctx.save();
    ctx.fillStyle = "yellow";
    ctx.fillRect(canvas.width/2 - gateWidth/2, -lineHalfWidth, gateWidth, lineHalfWidth*2);
    ctx.restore();

	//Me
    ctx.save();
    ctx.fillStyle = "#eb00ff";
    ctx.shadowBlur=40; 
    ctx.shadowColor="red";
    ctx.beginPath();
    ctx.arc(myData.bx, myData.by, batSize, 0, Math.PI*2);
    ctx.fill();
    ctx.clip();
    
    ctx.beginPath();
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 5;
    ctx.shadowBlur = 15
    ctx.shadowColor = 'blue';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.arc(150,75,50 + 3, 0, Math.PI * 2, false);
    ctx.stroke();
    
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(myData.bx, myData.by, batSize/2, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    //puck
    ctx.save();
    ctx.fillStyle = "#fdfdfd";
    ctx.shadowBlur=40; 
    ctx.shadowColor="#ffffff";
    ctx.beginPath();
    ctx.arc(puckData.x, puckData.y, puckSize, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
    

}

document.onmousemove = function(e){
    var rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
}

main();