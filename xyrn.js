var http = require( "http" ),
    sys = require( "sys" ),
    htmlparser = require( "htmlparser" ),
    jsdom = require( "jsdom" ),

    humane = require( "./lib/humane" ),
    util = require( "./lib/util" );

var xyrnize = module.exports = function xyrnize( bot ) {
/**:xyrnize( bot )

IRC 봇을 xyrn 화 시킴
*/

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
    this.times[ channel ] = {};

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
                    }
                    reportStatus( "silenced" );
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
        };
    }).call( this, channel );
    setInterval( fn, 3000 );
};

bot.updateStatus = function( channel, message ) {
    var stat = this.status[ channel ],
        time = this.times[ channel ],
        now = new Date(),
        match;

    if ( match = /ㅋㅋㅋㅋㅋ+/.exec( message ) ) {
        if ( stat.funniness ) {
            stat.funniness = (stat.funniness + match[ 0 ].length) / 2;
        } else {
            stat.funniness = match[ 0 ].length;
        }
        time.funned = now;
        reportStatus( "funniness", stat.funniness );
    }

    stat.prosperity++;
    time.updated = now;
    reportStatus( "prosperity", stat.prosperity );
};

bot.addListener( "kick", function( channel, who, by, reason ) {
    if ( who === this.nick ) {
        // 강퇴 당하면 다시 돌아옴
        setTimeout(function() {
            bot.join( channel, function() {
                this.talk( channel, [[
                    "아 진짴ㅋㅋㅋㅋㅋ",
                    "ㅠㅠ",
                    "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ",
                    "아오"
                ]]);
            });
        }, util.rand( 2000, 20000 ) );
    }
});

bot.addListener( "join", function( channel, who ) {
    if ( this.nick === who ) {
        this.initStatus( channel );
    }
});

bot.addListener( "message", function( from, to, message ) {
    var stat = this.status[ to ],
        match;

    if ( humane.talk.ing || /-github$/.exec( from ) ) {
        // 아직 이전 대답을 하지 않았을 경우 멈춤
        return;
    }

    if ( /xy(m|rn)|씸|성(용|룡)/.exec( message ) ) {
        var random = Math.random();
        if ( random < .50 ) {
            // 50% 확률로 대답함
            this.answer.apply( this, arguments );
        } else if ( random < .75 ) {
            // 25% 확률로 무언가 발사함
            this.shoot.apply( this, arguments );
        }
    }

    if ( stat.funniness > 5 ) {
        util.probably( stat.prosperity / 5, function() {
            this.giggle.apply( this, arguments );

            // 10% 확률로 화기애애수치 초기화
            util.probably( .10, function() {
                stat.funniness = 0;
            }, this );
        }, this, arguments );
    }

    this.updateStatus( to, message );
});

bot.addListener( "silence", function( channel ) {
    util.probably( .50,
        this.shuttle,
        this, arguments
    ).or( .50,
        this.github,
        this, arguments
    );
});

bot.answer = function( from, to, message ) {
    /**:bot.answer( from, to, message )

    상대에 따라 반말 또는 존댓말로 대답
    */
    var talkDown = /^(subl|홍민희|kijun|치도리)/,
        answers;
    if ( talkDown.exec( from ) ) {
        answers = [ "dd", "ㅇㅇ", "ㅇㅇ?", "?", "응", "응?" ];
    } else {
        answers = [ "네", "네?", "음?" ];
    }
    if ( Math.random() < .75 ) {
        this.talk( to, [ answers ]);
    } else {
        for ( var i = 0; i < answers.length; i++ ) {
            answers[ i ] = from + ": " + answers[ i ];
        }
        this.talk( to, [ answers ], util.gaussianRand( 10000, 5000 ) );
    }
};

bot.shoot = function( from, to, message ) {
    /**:bot.shoot( from, to, message )

    무언가 발사
    */
    var messages = [[
        "아몰라", "아오몰라", "몰라몰라", "모른다고", "모른다니까?"
    ],[
        "오줌발싸", "오줌발사", "오존발사", "옷좀발사", "똥발싸",
        "고종발사", "우주발사", "옵좀발사", "나로호발사", "왼발~왼발싸",
        "이발사", "숟갈발사", "외주발사", "전방을 향하여 힘찬 함성 발사",
        "ㅇㅈ발사", "ㅇㅅㅇ", "인중발사", "인증발사", "소변발사",
        "위성발사", "포탄발사", "재석 선배 맥북에어 발사", "역장발사"
    ]];
    this.talk( to, messages );

    // 10% 확률로 반성
    util.probably( .10, function() {
        this.talk( to, [[
            "아 맞다 여기 공개채널이지ㅠㅠ",
            "아 여기 공개채널이었지"
        ]]);
    }, this );
};

bot.giggle = function( from, to, message ) {
    /**:bot.giggle( from, to, message, match )

    남들이 웃는 만큼만 웃기
    */
    var weight = this.status[ to ].funniness,
        len = util.gaussianRand( weight, weight / 2 ),
        message = "";
    for ( var i = 0; i < len; i++ ) {
        message += "ㅋ";
    }
    this.talk( to, message );
};

bot.shuttle = humane.coolTime(function( channel ) {
    /**:bot.shuttle( channel )

    4camel 개드립 셔틀
    */
    var homepage = "http://4camel.net",
        url = homepage + "/xe/?mid=dogdrip";

    util.loadHTML( url, function( window, $ ) {
        var articles = $( ".boardList .bg2" ),
            article = articles.eq( util.rand( articles.length - 1 ) ),
            path = article.find( ".title a:eq(0)" ).attr( "href" );

        path = path.replace( /&PHPSESSID.*$/, "" ); // 더미인자 제거
        var url = path.replace( /^/, homepage );

        if ( $.inArray( url, bot.shuttle.history ) < 0 ) { // 뒷북 검사
            util.loadHTML( url, function( window, $ ) {
                var comments = [];
                $( ".replyContent .xe_content" ).each(function() {
                    comments.push( $( this ).text() );
                });
                if ( comments.length < 4 ) {
                    // 댓글 4개 미만은 망한 걸로 간주하고 셔틀하지 않음
                    return;
                }
                bot.talk( channel, [[ url ], comments ] );
                bot.shuttle.history.push( url );
            });
        }
    });
}, function() { return util.rand( 20000, 3600000 ); });
bot.shuttle.history = [];

bot.github = humane.coolTime(function( channel ) {
    var projects = [ "lessipy" ],
        project = util.choice( projects ),
        nick = project + "-github",
        githubBot = new this.constructor( this.opt.server, nick, {
            port: this.opt.port,
            password: this.opt.password,
            userName: nick,
            realName: nick,
            channels: [ channel ],
            autoRejoin: false
        });

    githubBot.addListener( "join", function( chan, who ) {
        if ( chan !== channel || who !== nick ) {
            return;
        }
        var commitHash = "0123456789abcdef",
            bitlyHash = commitHash + "ghijklmnopqrsluvwxyz",
            commit = "",
            bitly = "",
            log = util.choice([
                "Added test files", "Changed parser, ast.",
                "Deleted deprecated tests", "Added Accessor, Mixin, Ruleset",
                "modified parser, added some ast", "Very many changes",
                "modified parser", "changed classifiers, and etc",
                "Changed license"
            ]);

        for ( var i = 0; i < 7; i++ ) {
            commit += util.choice( commitHash );
        }
        for ( var bit, i = 0; i < 6; i++ ) {
            bit = util.choice( bitlyHash );
            if ( Math.random() < .50 ) {
                bit = bit.toUpperCase();
            }
            bitly += bit;
        }

        var msg = project + ": master " + bot.nick + " * " + commit;
        msg += " (" + util.rand(1, 10) + " files in " + util.rand( 1, 5 );
        msg += " dirs): " + log + " - http://bit.ly/" + bitly;
        this.say( channel, msg );
        this.part( channel );
        this.disconnect();
    });
}, function() { return util.rand( 3600000, 21600000 ); });

bot.suggestDinnerMenu = function( channel ) {
    /**:bot.suggestDinnerMenu( channel )

    저녁메뉴 제안
    */
    var messages = [[
        "홍민희: 오늘 머뭑지?", "홍민희: 이따 뭐 먹을거?"
    ],[
        "피자 먹자 피자", "홍민희: 도시락 or 치킨 or 『피자』",
        "피자 시키자", "피자나 시킬까", "피ㅣ자나 시킬까",
        "너 피자 아직도 있더라"
    ]];
    this.talk( to, messages );
};

return bot;
};
