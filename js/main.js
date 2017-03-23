var

canvas = document.getElementById("hockey"),
ctx = canvas.getContext("2d"),
width = canvas.width,
height = canvas.height,
button = document.getElementById("butt");

var mx = canvas.width/2,
    my = canvas.height/2;

var lineHalfWidth = 2,
    gateWidth = 150;

var enemyPoints = 0;

var dataCooldown = false;
var enemyConnection;

var enemyData = {};



var player = {
    size: 35,
    bxVel: 0,
    byVel: 0,
    myPoints: 0,
    myData: {
        bx: 0,
        by: 0,
    },
    collision: function(){
        //My Collision With Walls
        if(player.myData.bx + player.size > canvas.width){
            player.myData.bx = canvas.width - player.size;
        }
        if(player.myData.bx < player.size){
            player.myData.bx = player.size;
        }
        if(player.myData.by - player.size < canvas.height/2){
            player.myData.by = canvas.height/2 + player.size;   
        }
        if(player.myData.by + player.size > canvas.height){
            player.myData.by = canvas.height - player.size;
        }
    },
    draw: function(){
        ctx.save();
        ctx.fillStyle = "#eb00ff";
        ctx.shadowBlur=40; 
        ctx.shadowColor="red";
        ctx.beginPath();
        ctx.arc(player.myData.bx, player.myData.by, player.size, 0, Math.PI*2);
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
        ctx.arc(player.myData.bx, player.myData.by, player.size/2, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    },
};


var puck = {
    puckDecel: 2,
    puckSize: 20,
    puckData: {
        xVel: 0,
        yVel: 0,
        x: canvas.width/2,
        y: canvas.height/2
    },
    resetPuck: function(){
        puck.puckData = {
            xVel: 0,
            yVel: 0,
            x: canvas.width/2,
            y: canvas.height/2
        }
    },
    move: function(){
        //move puck
        var distance = Math.sqrt( Math.pow(player.myData.bx - puck.puckData.x, 2) + Math.pow(player.myData.by - puck.puckData.y, 2) );
        if(distance < puck.puckSize+player.size){
            var overlap = puck.puckSize+player.size-distance;
            var pushPower = overlap + 1;
            var angle = Math.atan2(player.myData.by-puck.puckData.y, player.myData.bx-puck.puckData.x);
            var nx = pushPower*Math.cos(angle+Math.PI);
            var ny = pushPower*Math.sin(angle+Math.PI);
            puck.puckData.xVel += nx;
            puck.puckData.yVel += ny;
            console.log("kick puck");
            enemyConnection && enemyConnection.send({dataType:1, data:puck.puckData});
        }
        puck.puckData.x += puck.puckData.xVel;
        puck.puckData.y += puck.puckData.yVel;
        puck.puckData.xVel -= (puck.puckData.xVel / 300) * puck.puckDecel;
        puck.puckData.yVel -= (puck.puckData.yVel / 300) * puck.puckDecel;
    },
    collision: function(){
        //Puck Collision With Walls
        if(puck.puckData.x + puck.puckSize > canvas.width){
            puck.puckData.x = canvas.width - puck.puckSize;
            puck.puckData.xVel = -puck.puckData.xVel;
            enemyConnection && enemyConnection.send({dataType:1, data:puck.puckData});
        }
        if(puck.puckData.x < puck.puckSize){
            puck.puckData.x = puck.puckSize;
            puck.puckData.xVel = -puck.puckData.xVel;
            enemyConnection && enemyConnection.send({dataType:1, data:puck.puckData});
        }
        if(puck.puckData.y < puck.puckSize && puck.puckData.x > canvas.width/2-gateWidth/2 && puck.puckData.x < canvas.width/2+gateWidth/2 && puck.puckData.y < 0){
            player.myPoints++;
            puck.resetPuck();
            console.log('myPoints: ' + player.myPoints);
        } else if(puck.puckData.y < puck.puckSize && (puck.puckData.x <= canvas.width/2-gateWidth/2 || puck.puckData.x >= canvas.width/2+gateWidth/2)){
            puck.puckData.y = puck.puckSize;
            puck.puckData.yVel = -puck.puckData.yVel;
            enemyConnection && enemyConnection.send({dataType:1, data:puck.puckData});
        }
        if(puck.puckData.y + puck.puckSize > canvas.height && puck.puckData.x > canvas.width/2-gateWidth/2 && puck.puckData.x < canvas.width/2+gateWidth/2 && puck.puckData.y > canvas.height){
            enemyPoints++;
            puck.resetPuck();
            console.log('enemyPoints: ' + enemyPoints);
        } else if(puck.puckData.y + puck.puckSize > canvas.height && (puck.puckData.x <= canvas.width/2-gateWidth/2 || puck.puckData.x >= canvas.width/2+gateWidth/2)){
            puck.puckData.y = canvas.height - puck.puckSize;
            puck.puckData.yVel = -puck.puckData.yVel;
            enemyConnection && enemyConnection.send({dataType:1, data:puck.puckData});
        }
    },
    draw: function(){
        ctx.save();
        ctx.fillStyle = "#fdfdfd";
        ctx.shadowBlur=40; 
        ctx.shadowColor="#ffffff";
        ctx.beginPath();
        ctx.arc(puck.puckData.x, puck.puckData.y, puck.puckSize, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    },
};



var peer = new Peer({key: 'pxydk3lce9l4bo6r'});

peer.on('open', function(id) {
  console.log('My peer ID is: ' + id);
});

peer.on('connection', function(conn) {
    console.log('Connection complete');
    conn.on('data', function(data) {
        updateData(data);
    });
    enemyConnection = conn;
});



function run(){
    
    width = window.innerWidth;
	height = window.innerHeight;
    
    if(window.width < 500){
        
        
        canvas.width = width;
        canvas.height = height;
    }

	var loop = function(){
		update();
		render();
		window.requestAnimationFrame(loop, canvas);
	}
	window.requestAnimationFrame(loop, canvas);
}



function update(){

    !dataCooldown && enemyConnection && sendNewData();
    
    player.bxVel = ((mx-player.myData.bx)/10);
    player.byVel = ((my-player.myData.by)/10);
    player.myData.bx += player.bxVel;
    player.myData.by += player.byVel;

    player.collision();

    puck.collision();
    puck.move();
    
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
    //EnemyGate
    ctx.save();
    ctx.fillStyle = "yellow";
    ctx.fillRect(canvas.width/2 - gateWidth/2, -lineHalfWidth, gateWidth, lineHalfWidth*2);
    ctx.restore();

    player.draw();
    
    //Enemy
    ctx.save();
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(canvas.width - enemyData.bx, canvas.height - enemyData.by, player.size, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(canvas.width - enemyData.bx, canvas.height - enemyData.by, player.size/2, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();


    puck.draw();

}

function sendNewData(){
    dataCooldown = true;
    enemyConnection && enemyConnection.send({dataType:0, data:player.myData});

    setTimeout(function(){
        dataCooldown = false;
    },10);
}

function updateData(data){
    var type = data.dataType;
    if(type === 0){
        enemyData = data.data;
    } else if(type === 1){
        data.data = parsePuckInput(data.data);
        puck.puckData = data.data;
    }
}

function parsePuckInput( data ){
    data.x = canvas.width - data.x;
    data.xVel = -data.xVel;
    data.y = canvas.height - data.y;
    data.yVel = -data.yVel;
    return data;
}




document.onmousemove = function(e){
    var rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
}

butt.onclick = function(e){
    enemyID = prompt("Enter enemy id:");
    if(enemyID.length >= 10){
        var conn = peer.connect( enemyID );
        conn.on('data', function( data ) {
            updateData( data );
        });
        enemyConnection = conn;
    }
}

run();