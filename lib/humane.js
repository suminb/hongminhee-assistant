var util = require( "./util" ),
    irc = require( "irc" );

var typingDelay = exports.typingDelay = function( text, tpm ) {
    tpm = tpm || 500; // 분당 타자 속도
    var thinking = 250,
        typing = text.length * (60 / tpm * 1000);
    return thinking + util.rand( typing );
};

var talk = function( client ) {
    function reserve() {
        var delay = typingDelay( talk.queue[ 0 ][ 1 ] );
        return setTimeout(function() {
            talk( client );
        }, delay ); 
    }
    if ( !talk.ing && talk.queue.length === 1 ) {
        talk.ing = reserve();
    } else {
        var saying = talk.queue.shift();
        client.say.apply( client, saying );
        if ( talk.queue.length ) {
            talk.ing = reserve();
        } else {
            delete talk.ing;
        }
    }
};
talk.queue = [];

irc.Client.prototype.talk = function( to, message ) {
    if ( message.constructor === Array ) {
        var self = this;
        message.forEach(function( messages ) {
            self.talk( to, util.choice( messages ) );
        });
    } else {
        talk.queue.push( arguments );
        if ( !talk.ing ) {
            talk( this );
        }
    }
};

exports.talk = talk;
