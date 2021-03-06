
// Prepare Server router
var express = require('express');
var router = express.Router();

// Prepare Server variable
var port = 8885;
var serverIP;
var logFileName = 'GameServerRunningLog.txt';
var admin = 'www.quater.zz.am';

// Prepare file stream module
var fs = require ( 'fs' );

// Get IP function
function getIPAddress() {

	var interfaces = require('os').networkInterfaces();

	for (var devName in interfaces) {

		var iface = interfaces[devName]; 

		for (var i = 0; i < iface.length; i++) { 

			var alias = iface[i];

			if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
				return alias.address;

			}

	}

	return '0.0.0.0'; 

}

function logWriteAppend ( body ) {

	body += '\r\n';

	fs.appendFile ( __dirname + '/logs/' + logFileName, body, function ( err ) {

		if ( err )
			console.log ( 'File write ERROR.\r\nAt ' + __dirname + '/' + logFileName + '.\r\n' + 'body = ' + body );

	} );

}

// Get Server IP
serverIP = getIPAddress ();

// Print time function
var printTime = function () {

        var today = new Date();
        console.log(" TIME = " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + "\r\n");

};

// Time get function
var getTimeString = function () {

        var today = new Date();
	return (today.getFullYear() + '.' + (today.getMonth()+1) + '.' + today.getDate() + '/' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds());

};

// HTTP Server create
var httpServer = require( 'http' ).createServer( function ( request, response ) {

	fs.readFile( __dirname + '/public/hanrang.html', function ( err, data ) {

                if (err) {

                        response.writeHead(500);
                        return response.end('Error loading.html');

                }

                response.writeHead(200);
                response.end(data);

        });

});

// Server listen
httpServer.listen ( port, function () {

	var body = '[SERVER]     [' + getTimeString() + '] [http://' + serverIP + ':' + port + '/]';
	logWriteAppend ( body );

});

// Broadcast function
var broadcast = function ( eventString, info ) {
        
	for ( var i = 0; i < sockets.length; i++ ) {

		sockets[i].emit ( eventString, { info: info, index: i } );

	}

};

// Prepare module for socket.io
var io = require('socket.io').listen(httpServer);

// Prepare variable
var sockets = [];
var size = { x: 800, y: 400 };
var pos = [];
var names = [];
var shapes = [];

var banIPs = [];

var banNames = [ 'SERVER', 'server', 'Server', 'hangole', 'HANGOLE', 'Hangole', '기황', '서버', '한고리', '관리', 'Manage', 'manage' ];

var banChats = [ '기황', 'hangole', '또라이', '돌아이', '똘아이', '한고리', '한고래', '한고레', '항고리', '항고래', '항고레', '씨발', '시발', '좆', '느금', '니앰', '지랄', '새끼', '니미', '노무', '일베', '섹스', '성관계', '무통', '통베', '베충', '쎅스', '쎅쓰', '싸물', '꺼져', '봊', '잦', '봊', '잦', '섺쓰', '섺스', '쎆쓰', '쎆스', '민우', '병신', '병씬', '뼝신', '뼝씬', '뼝씐', '병싄', '병씐', '뼝싄', '애미', '애비', '뒤져', '뒤짐', '지털', '개년', '개련', '개놈', '씨빨', '싀발', '씌발', '싀빨', '씌빨', '씹', '십발', '십빨', '썅', '염병', '우라질', '존나', '졸라', '124:', '.124', '3000', '기분 좋다', '기분좋다', '뒤졌', '멍청', '싸울', '맞다이', '고자', '곶아', '곶자', '호로', '십새', 'ㅛ', 'ㅗ', 'fuck', 'sex', 'asshole', 'bitch', 'bastard', 'retard', 'shit', 'gook', 'ass', 'love', '사랑', '히요리', 'hiyori', 'ひより' ];

var freezes = [];

var primaryKeyCount = 0;

var disconnectEvent = function ( index, msg ) {

	sockets[index].emit ( 'kick', { msg: msg } );
	sockets[index].disconnect('unauthorized');
        
        broadcast ( 'currentPos', { pos: pos, shapes: shapes } ); // socket.broadcast.emit('currentPos', { pos: pos } );
        broadcast ( 'names', { names: names } );

};

// Socket.io
io.sockets.on('connection', function (socket) {

	// Check IP
	for ( var i = 0; i < sockets.length; i++ )
		if ( socket.client.conn.remoteAddress == sockets[i].client.conn.remoteAddress ) {
			//console.log ( 'Overlab player try connect.' );
			return;
		}

	for ( var i = 0; i < banIPs.length; i++ )
		if ( socket.client.conn.remoteAddress == banIPs[i] ) {
			//console.log ( 'Ban player try connect.' );
			return;
		}

	// Register
        pos.push ( { x: (size.x / 2), y: (size.y / 2) } );
        names.push ( 'player ' + primaryKeyCount++ );
        shapes.push ( false );

        socket.name = socket.client.conn.remoteAddress + ":" + socket.id;
        sockets.push ( socket );

        var index = sockets.indexOf(socket);

	socket.emit ( 'join', { index: index, serverIP: serverIP } );
        broadcast ( 'names', { names: names } );
        broadcast ( 'currentPos', { pos: pos, shapes: shapes } ); // socket.broadcast.emit('currentPos', { pos: pos } );
        
        broadcast ( 'chat', { name: 'SERVER', value: 'Connect ' + names[index] } );

        // Log
	var body = '[CONNECT]    [' + getTimeString() + '] [' + socket.client.conn.remoteAddress + '] [' + names[index] + '] [' + sockets.length + ']';
	logWriteAppend ( body );

	// Disconnect
        socket.on ( 'disconnect', function (data) {

                index = sockets.indexOf(socket);
                
                var prevName = names[index];
                
                broadcast ( 'chat', { name: 'SERVER', value: 'Disconnect ' + names[index] } );

                sockets.splice ( index, 1 );
                pos.splice ( index, 1 );
                names.splice ( index, 1 );
                
                broadcast ( 'currentPos', { pos: pos, shapes: shapes } ); // socket.broadcast.emit('currentPos', { pos: pos } );
                broadcast ( 'names', { names: names } );
                
                // Log
        	var body = '[DISCONNECT] [' + getTimeString() + '] [' + socket.client.conn.remoteAddress + '] [' + prevName + '] [' + sockets.length + ']';
		logWriteAppend ( body );

        } );

	// Move
        socket.on('move', function (data) {
                
		if ( Math.abs ( data.x ) > 10 || Math.abs ( data.y ) > 10 )
			return;

                index = sockets.indexOf(socket);
                
                if ( pos[index].x + data.x > 0 && pos[index].x + data.x < size.x )
                	pos[index].x += data.x;
                if ( pos[index].y + data.y > 0 && pos[index].y + data.y < size.y )
                	pos[index].y += data.y;
                
                broadcast ( 'currentPos', { pos: pos, shapes: shapes } ); // socket.broadcast.emit('currentPos', { pos: pos } );
        
        });

        // Get
        socket.on('get', function (data) {
                
                socket.emit('currentPos', { info: { pos: pos, shapes: shapes }, index: index } );
        
        });
        
        // Chat
        socket.on ( 'chat', function ( data ) {

		var content = data.value.toLowerCase ();

		if ( data.value.trim().length == 0 )
			return;

		for ( var i = 0; i < banChats.length; i++ )
			if ( content.search ( banChats[i] ) != -1 )
				while ( content.search ( banChats[i] ) != -1 ) {
					content = content.replace ( banChats[i], '아잉♥' );
				}
                
                index = sockets.indexOf(socket);

		if ( socket.client.conn.remoteAddress == admin && data.value.search('./') != -1 ) {

			var tmp = data.value.substr ( 2 );

			if ( tmp.search('kick') != -1 ) {

				if ( tmp.search ('//') == -1 )
					return;

				var kickIP = tmp.substr ( tmp.search ('//') + 2 );

				if ( kickIP == 'all' ) {

					console.log('kick all');
					
					for ( var i = 0; i < sockets.length; i++ ) {

						if ( sockets[i] != socket )
							disconnectEvent ( i, 'Server kick all player.' );

					}
						
					return;
					
				}

				var kickIndex = -1;

				for ( var i = 0; i < sockets.length; i++ )
					if ( sockets[i].client.conn.remoteAddress == kickIP )
						kickIndex = i;

				if ( kickIndex < 0 || kickIndex >= sockets.length )
					return;


				disconnectEvent ( kickIndex, 'Server kick you.' );

				console.log('kick ' + kickIP);

			} else if ( tmp.search('unban') != -1 ) {

				if ( tmp.search ('//') == -1 )
					return;

				var unbanIP = tmp.substr ( tmp.search ('//') + 2 );

				var index = banIPs.indexOf ( unbanIP );

				if ( index < 0 || index >= banIPs.length )
					return;

				banIPs.splice ( banIPs.indexOf ( unbanIP ), 1 );

				console.log('unban ' + banIP);
				console.log('ban list ', banIPs);

			} else if ( tmp.search('ban') != -1 ) {

				if ( tmp.search ('//') == -1 )
					return;

				var banIP = tmp.substr ( tmp.search ('//') + 2 );

				banIPs.push ( banIP );

				console.log('ban ' + banIP);
				console.log('ban list ', banIPs);

			}

			return;

		}
                
                broadcast ( 'chat', { name: names[index], value: content } );
                
                // Log
        	var body = '[CHAT]       [' + getTimeString() + '] [' + socket.client.conn.remoteAddress + '] [' + names[index] + ' : ' + data.value + ']';
        	logWriteAppend ( body );
                
        } );
        
	// Name Change
        socket.on ( 'nameChange', function ( data ) {
                
                index = sockets.indexOf(socket);
                
                var prevName = names[index];

		data.value = data.value.trim();
                
                if ( data.value.length > 8 || data.value.length < 2 )
                        return;

		if ( socket.client.conn.remoteAddress != admin )
	                for ( var i = 0; i < banNames.length; i++ )
				if ( data.value.search ( banNames[i] ) != -1 )
					return;

                for ( var i = 0; i < names.length; i++ )
			if ( data.value.search ( names[i] ) != -1 )
				return;
                
                names[index]= data.value;
                
                broadcast ( 'names', { names: names } );
                
                broadcast ( 'chat', { name: 'SERVER', value: prevName + ' -> ' + names[index] } );
                
                // Log
        	var body = '[CHANGE]     [' + getTimeString() + '] [' + socket.client.conn.remoteAddress + '] Change name ' + prevName + ' -> ' + names[index];
        	logWriteAppend ( body );
                
        } );

	socket.on ( 'transShape', function ( data ) {

		var index = sockets.indexOf(socket);

		shapes[index] = data.shape;

		broadcast ( 'currentPos', { pos: pos, shapes: shapes } );

	} );

});

// Server is start
console.log ( '\r\n[SERVER]     [' + getTimeString() + '] [http://' + serverIP + ':' + port + '/]' );

var cycle = 30000;

setInterval ( function () {

	var body = '[SERVER]     [' + getTimeString() + '] [running ' + (cycle/1000) + 'sec Cycle ckeck] [' + sockets.length + ']';
	logWriteAppend ( body );

}, cycle );


module.exports = router;

