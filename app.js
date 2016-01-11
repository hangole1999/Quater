
// 
var express = require ( 'express' );
var cookieParser = require ( 'cookie-parser' );
var bodyParser = require ( 'body-parser' );
var expressSession = require ( 'express-session' );
//var morgan = require ( 'morgan' );
var path = require ( 'path' );
var app = express();
var router = require ( './hanrang' );
var fs = require ( 'fs' );
var mongojs = require ( 'mongojs' );
var accountsDB = mongojs ( 'hangole:skrdutekd091@127.0.0.1:10000/Quater', ['accounts'] );
var postsDB = mongojs ( 'hangole:skrdutekd091@127.0.0.1:10000/Quater', ['posts'] );
var boardDB = mongojs ( 'hangole:skrdutekd091@127.0.0.1:10000/Quater', ['board'] );
var qs = require ('querystring');
var logFileName = 'serverRunningLog.txt';
var ejs = require ( 'ejs' );

// 
var server;
var host;
var port;

// 
/*db.on('error',function(err) {

	console.log('[DATABASE]   [ERROR] [', err, ']');

});

db.on('ready',function() {

	console.log('[DATABASE]   [CENNECTED]');

});*/

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

// Time get function
var getTimeString = function () {

        var today = new Date();
	return (today.getFullYear() + '.' + (today.getMonth()+1) + '.' + today.getDate() + '/' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds());

};

// App setting
app.use ( express.static ( path.join ( __dirname, 'public' ) ) );
//app.use ( morgan () );
app.use ( cookieParser ( 'quaterkey' ) );
app.use ( bodyParser () );
app.use ( expressSession ( { 

	secret: 'quaterkey', 
	saveUninitialized: true, 
	resave: false, 
	cookie: { expire: new Date ( Date.now + 60 * 60 ), singed: true }

} ) );
app.set ( 'view engine', 'ejs' );

/* Web response */

// GET
app.get ( '/', function ( request, response ) {

	response.render ( 'index' );

} );

app.get ( '/index', function ( request, response ) {

	response.render ( 'index' );

} );

app.get ( '/frame', function ( request, response ) {

	response.render ( 'frame' );

} );

app.get ( '/home', function ( request, response ) {

	response.render ( 'home' );

} );

app.get ( '/game', function ( request, response ) {

	if ( !( request.session.userids && request.session.passwords ) ) {
		response.redirect ( '/login' );
		return;
	}

	var obj = { id: request.session.userids, password: request.session.passwords };

	accountsDB.accounts.find ( obj, function ( error, result ) {

		if ( error )
			console.log ( '[DATABASE]   [' + getTimeString() + '] [find] [error] [', obj, '] [', result, ']' );

		// Login success
		if ( result[0] ) {

			var ejsObj = result[0];

			delete ejsObj.password;

			response.render ( 'hanrang', ejsObj );
			return;

		}

		response.redirect ( '/login' );

	} );

} );

app.get ( '/account', function ( request, response ) {

	if ( !(request.session.userids && request.session.passwords) ) {
		response.redirect ( '/login' );
		return;
	}

	var obj = { id: request.session.userids, password: request.session.passwords };

	accountsDB.accounts.find ( obj, function ( error, result ) {

		if ( error )
			console.log ( '[DATABASE]   [' + getTimeString() + '] [find] [error] [', obj, '] [', result, ']' );

		// Login success
		if ( result[0] ) {

			var ejsObj = result[0];

			delete ejsObj.password;

			response.render ( 'account', ejsObj );
			return;

		}

		response.redirect ( '/login' );

	} );

} );

app.get ( '/login', function ( request, response ) {

	if ( request.session.userids && request.session.passwords ) {
		response.redirect ( '/home' );
		return;
	}

	response.render ( 'login' );

} );

app.get ( '/logout', function ( request, response ) {

	delete request.session.userids;

	delete request.session.passwords;

	response.redirect ( '/login' );

} );

app.get ( '/notice', function ( request, response ) {

	response.render ( 'notice' );

} );

app.get ( '/join', function ( request, response ) {

	response.render ( 'join' );

} );

app.get ( '/form', function ( request, response ) {

	response.render ( 'form' );

} );

app.get ( '/board', function ( request, response ) {

	var obj = request.query;

	obj.index -= 0;

	var ejsObj = { index: obj.index };

	postsDB.posts.find ( {}, function ( error, result ) {

		if ( error )
			return;

		result = result.reverse ();

		result = result.slice ( obj.index, obj.index + 10 );

		ejsObj.content = result;

		postsDB.posts.count ( function ( error, result ) {

			if ( error )
				return;

			ejsObj.count = result;

			response.render ( 'board', ejsObj );
			return;

		} );

	} );

} );

app.get ( '/post', function ( request, response ) {

	if ( !(request.session.userids && request.session.passwords) ) {

		response.redirect ( '/login' );
		return;

	}

	var obj = request.query;

	obj.postNumber -= 0;

	postsDB.posts.find ( obj, function ( error, result ) {

		if ( error )
			console.log ( '[DATABASE]   [' + getTimeString() + '] [find] [error] [', obj, '] [', result, ']' );

		// Find success
		if ( result[0] ) {

			var ejsObj = result[0];

			response.render ( 'post', ejsObj );
			return;

		}

		response.redirect ( '/board' );

	} );

} );

app.get ( '/postWrite', function ( request, response ) {

	if ( !(request.session.userids && request.session.passwords) ) {

		response.redirect ( '/login' );
		return;

	}

	response.render ( 'postWrite' );

} );

// POST
app.post ( '/join', function ( request, response ) {

	var userip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

	var body = '[SERVER]     [' + getTimeString() + '] ['+userip+'] ['+request.body.email+'/'+request.body.id+'/'+request.body.name+'/'+request.body.callName+']';
	logWriteAppend ( body );

	var obj = request.body;

	var location = '/join';

	request.method = 'GET';

	if ( obj.password !== obj.passwordConfilm ) {

		response.redirect ( location );
		return;

	}

	delete obj.passwordConfilm;

	obj.createDate = getTimeString();

	accountsDB.accounts.find ( { id: obj.id }, function ( error, result ) {

		if ( !error && !result[0] )
			accountsDB.accounts.find ( { email: obj.email }, function ( error, result2 ) {

				if ( !error && !result2[0] )
					accountsDB.accounts.find ( { callName: obj.callName }, function ( error, result3 ) {

						if ( !error && !result3[0] )
							accountsDB.accounts.insert ( obj, function ( error, result ) {

								if ( error )
									console.log ( '[DATABASE]   [' + getTimeString() + '] [insert] [error] [', obj, '] [', result, ']' );
								else {

									location = '/login';
									var body = '[JOIN]      [' + getTimeString() + '] ['+userip+'] ['+request.body.email+'/'+request.body.id+'/'+request.body.name+'/'+request.body.callName+']';
									logWriteAppend ( body );

									response.redirect ( location );

								}

							} );
						else {
							response.redirect ( location );
							return;
						}

					} );
				else {
					response.redirect ( location );
					return;
				}

			} );
		else {
			response.redirect ( location );
			return;
		}
	} );

} );

app.post ( '/login', function ( request, response ) {

	var userip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

	var body = '[LOGINTRY]   [' + getTimeString() + '] ['+userip+'] ['+request.body.id+']';
	logWriteAppend ( body );

	if ( request.session.userids && request.session.passwords ) {
		response.redirect ( '/home' );
		return;
	}

	var obj = request.body;

	accountsDB.accounts.find ( obj, function ( error, result ) {

		var location = '/login';

		if ( error )
			console.log ( '[DATABASE]   [' + getTimeString() + '] [find] [error] [', obj, '] [', result, ']' );

		// Login success
		if ( result[0] ) {

			location = '/account';

			request.session.userids = obj.id;
			request.session.passwords = obj.password;

			//response.cookie ( 'userid', obj.id, { expire: new Date ( Date.now + 60 * 60 ), domain: 'www.quater.zz.am', signed: true } ).cookie ( 'password', obj.password, { expire: new Date ( Date.now + 60 * 60 ), domain: 'www.quater.zz.am', signed: true } );

			var body = '[LOGIN]      [' + getTimeString() + '] ['+userip+'] ['+request.body.id+']';
			logWriteAppend ( body );

		}

		response.redirect ( location );

	} );

} );

app.post ( '/post', function ( request, response ) {

	var obj = request.body;

	obj.comment = [];

	obj.writeDate = getTimeString();

	obj.hits = 0;

	var userObj = { id: request.session.userids, password: request.session.passwords };

	accountsDB.accounts.find ( userObj, function ( error, result ) {

		if ( error )
			return;
		else if ( !result[0] )
			return;

		obj.writer = result[0].callName;

		boardDB.board.find ( {}, function ( error, result ) {

			if ( error )
				return;
			else if ( !result[0] )
				return;

			obj.postNumber = result[0].postPrimaryKey;

			boardDB.board.update ( {}, { $set: { postPrimaryKey: (result[0].postPrimaryKey+1) } }, function ( error, result ) {

				if ( error )
					return;

				postsDB.posts.insert ( obj, function ( error, result ) {

					if ( error )
						return;

					response.redirect ( '/board?index=0' );

				} );

			} );

		} );

	} );

} );

app.post ( '/comment', function ( request, response ) {

} );

/* Account response */

// 
app.get ( '/accountUpdate/:id:id2', function ( request, response ) {

	request.params.id = request.params.id.substring ( 1, request.params.id.length );
	request.params.id2 = request.params.id2.substring ( 1, request.params.id2.length );

	var obj = qs.parse ( request.params.id );
	var obj2 = qs.parse ( request.params.id2 );

	response.json ( { result: updateDB ( obj, obj2 ) } );

} );

app.get ( '/accountRemove/:id', function ( request, response ) {

	request.params.id = request.params.id.substring ( 1, request.params.id.length );

	var obj = qs.parse ( request.params.id );

	response.json ( { result: removeDB ( obj ) } );

} );

/* Server listen */

// 
server = app.listen ( 3000, function () {

	console.log ( '[SERVERAPP]  [' + getTimeString() + '] [listening...]' );

} );

host = getIPAddress();
port = server.address().port;

console.log ( '[SERVERAPP]  [' + getTimeString() + '] [Running at http://' + host + ':' + port + '/]' );
