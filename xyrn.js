var sys = require( "sys" ),
    path = require( "path" ),
    fs = require( "fs" ),
    ircPath = path.join( __dirname, "..", "forks", "node-irc", "lib" );
require.paths.unshift( ircPath );
require.paths.unshift( __dirname );

var irc = require( "irc" ),
    ai = require( "ai" );

var configPath = path.join( __dirname, "config.json" );
fs.readFile( configPath, function( err, data ) {
    if ( err ) {
        throw err;
    }
    var config = JSON.parse( data );
    ai.xyrnize( new irc.Client( null, null, config ) );
});
