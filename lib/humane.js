var sys = require( "sys" ),
    util = require( "./util" ),
    irc = require( "irc" );

var typingDelay = exports.typingDelay = function( text, min, tpm ) {
    min = min || 250; // 최소 시간
    tpm = tpm || 500; // 분당 타자 속도
    var typing = text.length * (60 / tpm * 1000);
    return min + util.rand( typing );
};

var talk = function( client ) {
    function reserve() {
        var next = talk.queue[ 0 ],
            delay,
            min;

        if ( next.length === 3 ) {
            min = Array.prototype.pop.call( talk.queue[ 0 ] );
        }
        delay = typingDelay( next[ 1 ], min );

        if ( client.opt.debug ) {
            var msg = "\033[0;36m" + delay + "ms after: \033[0m" + next[ 1 ];
            sys.log( msg );
        }

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

irc.Client.prototype.talk = function( to, message, min ) {
    if ( message.constructor === Array ) {
        var self = this;
        message.forEach(function( messages ) {
            self.talk( to, util.choice( messages ), min );
        });
    } else {
        talk.queue.push( arguments );
        if ( !talk.ing ) {
            talk( this );
        }
    }
};

exports.talk = talk;
