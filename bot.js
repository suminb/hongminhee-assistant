var sys = require( "sys" ),
    path = require( "path" ),
    fs = require( "fs" );
try {
    var irc = require( "irc" );
} catch ( err ) {
    console.error( "cannot found `irc` module. try `npm install irc`" );
    return;
}
var xyrn = require( "./xyrn" );

var configPath = path.join( __dirname, "config.json" );
fs.readFile( configPath, function( err, data ) {
    if ( err ) {
        throw err;
    }
    var config = JSON.parse( data );
    config.userName = config.userName || config.nick;
    config.realName = config.realName || config.nick;
    xyrn( new irc.Client( null, null, config ) );
});
