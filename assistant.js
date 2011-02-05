var http = require( "http" ),
    sys = require( "sys" ),
    htmlparser = require( "htmlparser" ),
    jsdom = require( "jsdom" ),

    humane = require( "./lib/humane" ),
    util = require( "./lib/util" );

var xyrnize = module.exports = function xyrnize( bot ) {

function reportStatus( key, val ) {
    if ( bot.opt.debug ) {
        if ( val === undefined ) {
            sys.log( "\033[0;33m" + key + "\033[0m" );
            return;
        } else if ( val % 1 ) {
            val = util.round( val, 2 );
        }
        sys.log( key + ": \033[0;33m" + val + "\033[0m" );
    }
}

bot.initStatus = function( channel ) {
    if ( !this.status ) {
        this.status = {};
    }
    if ( !this.times ) {
        this.times = {};
    }

    this.status[ channel ] = {
        funniness: 0, // 화기애애한 정도
        prosperity: 0 // 흥한 정도
    };
    this.times[ channel ] = {
        silenced: new Date()
    };

    var fn = (function( channel ) {
        var stat = this.status[ channel ],
            time = this.times[ channel ];
            decrease = function( n ) {
                return Math.max( 0, n - 1 );
            },
            half = function( n ) {
                return Math.floor( n / 2 );
            };
        return function() {
            var now = new Date(),
                prev;

            if ( stat.prosperity ) {
                if ( now - time.funned > 10000 ) {
                    // 10초 이상 안웃음
                    prev = stat.funniness;
                    stat.funniness = half( prev );
                    if ( prev !== stat.funniness ) {
                        reportStatus( "funniness", stat.funniness );
                    }
                }
                if ( now - time.updated > 60000 ) {
                    // 1분 이상 정전
                    stat.prosperity = half( stat.prosperity );
                    if ( !stat.prosperity ) {
                        time.silenced = now;
                        reportStatus( "silenced" );
                    }
                }
            } else if ( time.silenced ) {
                prev = util.round( stat.stillness, 2 );
                stat.stillness = (now - time.silenced) / 3600000;
                util.probably( stat.stillness, function() {
                    bot.emit( "silence", channel );
                });
                if ( prev !== util.round( stat.stillness, 2 ) ) {
                    reportStatus( "stillness", stat.stillness );
                }
            }

            util.probably( .25, function() {
                bot.emit( "period", channel );
            });
        };
    }).call( this, channel );
    //this.intervals[ channel ] = setInterval( fn, 3000 );
};
bot.intervals = {};

bot.updateStatus = function( channel, message ) {
    var stat = this.status[ channel ],
        time = this.times[ channel ],
        now = new Date(),
        match;
        
    time.updated = now;
};

bot.addListener( "kick", function( channel, who, by, reason ) {
    clearInterval( this.intervals[ channel ] );

    if ( who === this.nick ) {
        // 강퇴 당하면 다시 돌아옴
        setTimeout(function() {
            bot.join( channel, function() {});
        }, util.rand( 2000, 20000 ) );
    }
});

bot.addListener( "join", function( channel, who ) {
    if ( this.nick === who ) {
        this.initStatus( channel );
    }
});

bot.addListener( "message", function( from, to, message ) {
    this.updateStatus( to, message );
    this.answer( from, to, message );
});

bot.addListener( "silence", function( channel ) {
});

bot.addListener( "period", function( channel ) {
});

bot.answer = function( from, to, message ) {
    if( /*this.opt.debug == true ||*/ /(홍민희|HongMinhee|sumin(_w?)?)/.exec( from ) ) {
        var matches = message.match( /[0-9A-Z]{2,5}/g );
        if( matches != null ) {
            // Acronyms are detected!
            
            for( var key in matches ) {
                this.talk( to, "http://www.wikipedia.org/wiki/"+matches[ key ] );
            }
        }
    }
    this.status[ to ].answered = [ from, new Date() ];
};

return bot;
};
