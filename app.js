
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
var accountsDB = mongojs ( '', ['accounts'] ); // TODO
var postsDB = mongojs ( '', ['posts'] ); // TODO
var boardsDB = mongojs ( '', ['boards'] ); // TODO
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

	delete request.session.callName;

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

	var index = obj.index;

	delete obj.index;

	obj.postNumber -= 0;

	postsDB.posts.find ( obj, function ( error, result ) {

		if ( error )
			console.log ( '[DATABASE]   [' + getTimeString() + '] [find] [error] [', obj, '] [', result, ']' );

		// Find success
		if ( result[0] ) {

			var ejsObj = result[0];

			ejsObj.requester = request.session.callName;

			ejsObj.index = index;

			response.render ( 'post', ejsObj );
			return;

		}

		response.redirect ( '/board?index=0' );

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

	// User IP
	var userip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

	// Loging
	var body = '[SERVER]     [' + getTimeString() + '] ['+userip+'] ['+request.body.email+'/'+request.body.id+'/'+request.body.name+'/'+request.body.callName+']';
	logWriteAppend ( body );

	// Account information
	var obj = request.body;

	// Redirect setting
	var location = '/join';
	request.method = 'GET';

	// Checking informations length
	if ( obj.email.length > 30 || obj.id.length > 20 || obj.password.length > 20 || obj.name.length > 30 || obj.callName > 20 ||
		obj.id.length < 5 || obj.password.length < 5 || obj.name.length < 2 || obj.callName < 2 ) {

		response.redirect ( location );
		return;

	}

	// Password confilm checking
	if ( obj.password !== obj.passwordConfilm ) {

		response.redirect ( location );
		return;

	}

	// Delete password confilm content
	delete obj.passwordConfilm;

	// Writing when account create
	obj.createDate = getTimeString();

	// ID overlap checking
	accountsDB.accounts.find ( { id: obj.id }, function ( error, result ) {

		if ( !error && !result[0] )
			// Email overlap checking
			accountsDB.accounts.find ( { email: obj.email }, function ( error, result2 ) {

				if ( !error && !result2[0] )
					// Call Name overlap checking
					accountsDB.accounts.find ( { callName: obj.callName }, function ( error, result3 ) {

						if ( !error && !result3[0] )
							// Create Account
							accountsDB.accounts.insert ( obj, function ( error, result ) {

								if ( error )
									console.log ( '[DATABASE]   [' + getTimeString() + '] [insert] [error] [', obj, '] [', result, ']' );
								// Successful
								else {

									location = '/login';
									var body = '[JOIN]       [' + getTimeString() + '] ['+userip+'] ['+request.body.email+'/'+request.body.id+'/'+request.body.name+'/'+request.body.callName+']';
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
			request.session.callName = result[0].callName;

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

		boardsDB.boards.find ( {}, function ( error, result ) {

			if ( error )
				return;
			else if ( !result[0] )
				return;

			obj.postNumber = result[0].postPrimaryKey;

			boardsDB.boards.update ( {}, { $set: { postPrimaryKey: (result[0].postPrimaryKey+1) } }, function ( error, result ) {

				if ( error )
					return;

				obj.commentPrimaryKey = 0;

				postsDB.posts.insert ( obj, function ( error, result ) {

					if ( error )
						return;

					response.redirect ( '/board?index=0' );

				} );

			} );

		} );

	} );

} );

app.post ( '/postDelete', function ( request, response ) {

	if ( !request.session.userids || !request.session.passwords ) {
		response.redirect ( '/login' );
		return;
	}

	var obj = request.query;

	obj.postNumber -= 0;

	var requesterObj = { id: request.session.userids };

	accountsDB.accounts.find ( { id: obj.writer }, function ( error, result ) {

		if ( error || !result[0] || result[0].id !== requesterObj.id ) {
			response.redirect ( '/board?index=0' );
			return;
		}

		postsDB.posts.remove ( { postNumber: obj.postNumber }, function ( error, result ) {

			if ( error )
				return;

			response.redirect ( '/board?index=0' );

		} );

	} );

} );

app.post ( '/comment', function ( request, response ) {

	if ( !request.session.userids || !request.session.passwords ) {
		response.redirect ( '/login' );
		return;
	}

	var obj = request.query;

	obj.postNumber -= 0;

	obj.writeDate = getTimeString();

	var commentPrimaryKey;

	postsDB.posts.find ( { postNumber: obj.postNumber }, function ( error, result ) {

		if ( error )
			return;

		commentPrimaryKey = result[0].commentPrimaryKey;

		postsDB.posts.update ( { postNumber: obj.postNumber }, { $push: { comment: { writer: request.session.callName, content: request.body.commentContent, writeDate: obj.writeDate, commentNumber: result[0].commentPrimaryKey } } }, function ( error, result ) {

			if ( error )
				return;

			postsDB.posts.update ( { postNumber: obj.postNumber }, { $set: { commentPrimaryKey: commentPrimaryKey + 1 } }, function ( error, result ) {

				if ( error )
					return;

				request.method = 'GET';

				response.redirect ( '/post?postNumber=' + obj.postNumber );

			} );

		} );

	} );

} );

app.post ( '/commentDelete', function ( request, response ) {

	if ( !request.session.userids || !request.session.passwords || request.query.writer !== request.session.callName ) {
		response.redirect ( '/login' );
		return;
	}

	var obj = request.query;

	obj.postNumber -= 0;
	obj.commentNumber -= 0;

	postsDB.posts.update ( { postNumber: obj.postNumber }, { $pull: { comment: { commentNumber: obj.commentNumber } } }, function ( error, result ) {

		if ( error )
			return;

		request.method = 'GET';

		response.redirect ( '/post?postNumber=' + obj.postNumber );

	} );

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

