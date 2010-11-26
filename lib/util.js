var rand = exports.rand = function( min, max ) {
    if ( max === undefined ) {
        max = min;
        min = 0;
    }
    return min + Math.floor( Math.random() * (max + 1 - min) );
};

var gaussianRand = exports.gaussianRand = function( m, s ) {
    function r() {
        return Math.random() * 2 - 1;
    }
    return (r() + r() + r()) * s + m;
};

var choice = exports.choice = function( arr ) {
    return arr[ rand( arr.length - 1 ) ];
};

var probably = function( probability, callback, context, args ) {
    if ( Math.random() < probability ) {
        callback.apply( context, args );
        return { or: function() {} };
    }
    return { or: arguments.callee };
};
exports.probably = probably;

var jQueryify = exports.jQueryify = function( window, jQueryPath, callback ) {
    var jsdom = require( "jsdom" ),
        fs = require( "fs" );

    var navigator = window.navigator,
        location = window.location;
    window.XMLHttpRequest = function() {};

    fs.readFile( jQueryPath, function( err, data ) {
        if ( err ) {
            throw err;
        }
        eval( data.toString() );
        if ( callback ) {
            function $() {
                return window.jQuery.apply( window, arguments );
            }
            window.jQuery.extend( $, window.jQuery );
            callback( window, $ );
        }
    });
};

var loadHTML = exports.loadHTML = function( url, callback ) {
    url = require( "url" ).parse( url );
    var client = require( "http" ).createClient( 80, url.host ),
        request = client.request( "GET", url.pathname + url.search, {
            host: url.host
        });
    request.end();
    request.on( "response", function( response ) {
        if ( response.statusCode !== 200 ) {
            return;
        }
        response.setEncoding( "utf8" );
        response.html = "";
        response.on( "data", function( data ) {
            this.html += data;
        });
        response.on( "end", function() {
            if ( callback ) {
                var jsdom = require( "jsdom" ).jsdom,
                    window = jsdom( this.html ).createWindow(),
                    jQuery = "lib/jquery.js";
                jQueryify( window, jQuery, callback );
            }
        });
    });
};

var round = exports.round = function( n, precision ) {
    var denominator = Math.pow( 10, precision || 0 );
    return Math.round( n * denominator ) / denominator;
};
