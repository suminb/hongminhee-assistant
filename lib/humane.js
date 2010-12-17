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

var coolTime = exports.coolTime = function( func, coolTime ) {
    coolTime = coolTime || 0;
    return function() {
        var now = new Date();
        if ( func.callable > now ) {
            return;
        } else if ( typeof coolTime === "function" ) {
            coolTime = coolTime();
        }
        func.callable = now.getTime() + coolTime;
        func.called = now;
        return func.apply( this, arguments );
    };
};

var activeTime = exports.activeTime = function( func, times ) {
    function test( date, time ) {
        function t( actual, expr ) {
            if ( expr === undefined ) {
                return true;
            }
            var isNumber = typeof expr === "number";
            if ( isNumber ) {
                return actual === expr;
            }
            var match,
                range = /(\d+)-(\d+)/g,
                sep = /,/g,
                exprs = expr.split( sep );

            for ( var i = 0; i < exprs.length; i++ ) {
                isNumber = typeof exprs[ i ] === "number";
                if ( isNumber || !exprs[ i ].match( range ) ) {
                    if ( actual === parseInt( exprs[ i ] ) ) {
                        return true;
                    }
                }
                while ( match = range.exec( exprs[ i ] ) ) {
                    var from = parseInt( match[ 1 ] ),
                        to = parseInt( match[ 2 ] );
                    if ( from <= actual && actual <= to ) {
                        return true;
                    }
                }
            }
            return false;
        }
        var elements = { minutes: 60, hours: 24, date: 31, month: 12, day: 7 };
        for ( var el in elements ) {
            var meth = "get" + el.charAt( 0 ).toUpperCase() + el.substr( 1 );
            if ( !t( date[ meth ](), time[ el ] ) ) {
                return false;
            }
        }
        return true;
    }
    return function() {
        var now = new Date();
        for ( var time, i = 0; i < times.length; i++ ) {
            time = times[ i ];
            if ( test( now, time ) ) {
                return func.apply( this, arguments );
            }
        }
    };
};

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
