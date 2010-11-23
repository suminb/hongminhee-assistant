var util = require( "./util" ),
    irc = require( "irc" );

var typingDelay = exports.typingDelay = function( text, tpm ) {
    tpm = tpm || 500;
    var thinking = 500,
        typing = text.length * (60 / tpm * 1000);
    return thinking + util.rand( typing );
};

var sayingQueue = [],
    readingDelay = 300,
    talking,
    talk = function( client ) {
        function reserve() {
            var delay = typingDelay( sayingQueue[ 0 ][ 1 ] );
            return setTimeout(function() {
                talk( client );
            }, delay ); 
        }
        if ( !talking && sayingQueue.length === 1 ) {
            talking = reserve();
        } else {
            var saying = sayingQueue.shift();
            client.say.apply( client, saying );
            if ( sayingQueue.length ) {
                talking = reserve();
            } else {
                talking = null;
            }
        }
    };

irc.Client.prototype.talk = function( to, message ) {
    sayingQueue.push( arguments );
    if ( !talking ) {
        talk( this );
    }
};

exports.talk = talk;
