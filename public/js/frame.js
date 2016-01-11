
var iframe = document.getElementById ( 'iframe' );
var browserDiv = document.getElementById ( 'browserDiv' );
var browserAtag = document.getElementById ( 'browserAtag' );

autosize ();

var browserInfo = navigator.userAgent.toLowerCase();
var browserName;

if ( /*@cc_on true || @*/ false ) 
	browserName = 'Internet Explorer';
else if ( browserInfo.indexOf ( 'msie 6' ) != -1 ) 
	browserName = 'Internet Explorer 6';
else if ( browserInfo.indexOf ( 'msie 7' ) != -1 ) 
	browserName = 'Internet Explorer 7';
else if ( browserInfo.indexOf ( 'msie 8' ) != -1 ) 
	browserName = 'Internet Explorer 8';
else if ( !!window.opera ) 
	browserName = 'Opera';
else if ( browserInfo.indexOf ( 'mac' ) != -1 ) 
	browserName = 'Mac';
else if ( browserInfo.indexOf ( 'firefox' ) != -1 ) 
	browserName = 'FireFox';
else if ( browserInfo.indexOf ( 'safari' ) != -1 || browserInfo.indexOf ( 'applewebkit/5' ) != -1 || browserInfo.indexOf ( 'chrome' ) != -1 ) 
	browserName = 'Chrome and Safari';
else 
	browserName = 'Other';

browserDiv.textContent = 'Browser is ' + browserName;

browserAtag.textContent = browserInfo.indexOf ( 'chrome' ) != -1 ? '' : 'Download Chrome';

function onHomeClick () {

	iframe.src = '/home';

	autosize ();

}

function onGameClick () {

	iframe.src = '/game';

	autosize ();

}

function onNoticeClick () {

	iframe.src = '/notice';

	autosize ();

}

function onFormClick () {

	iframe.src = 'https://docs.google.com/forms/d/1f4R8ato-2vQ9AS_e2IudnYK-1ZFxAriP2yxUbluNlTg/viewform?embedded=true';

}

function onAccountClick () {

	iframe.src = '/account';

	autosize ();

}

function onBoardClick () {

	iframe.src = '/board/?index=0';

	autosize ();

}

function autosize(){

	try {

		if ( iframe.style.height !== iframe.contentDocument.body.clientHeight + "px" )
			iframe.style.height = iframe.contentDocument.body.clientHeight + "px";

	} catch ( e ) {

		

	}

}

setInterval ( autosize, 100 );

