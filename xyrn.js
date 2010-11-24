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
var stat = {
    funniness: 0, // 화기애애한 정도
    prosperity: 0 // 흥한 정도
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

bot.addListener( "message", function( from, to, message ) {
    var match;

    if ( humane.talk.ing ) {
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

    if ( match = /ㅋㅋㅋ+/.exec( message ) ) {
        if ( match[ 0 ].length >= 5 ) {
            stat.funniness++;
        }
        if ( stat.funniness > 2 ) {
            util.probably( .75, function() {
                this.giggle.call( this, from, to, message, match );
            }, this );
        }
    } else {
        stat.funniness = Math.max( --stat.funniness, 0 );
    }

    if ( /4camel/.exec( message ) ) {
        this.shuttle.apply( this, arguments );
    }
});

bot.answer = function( from, to, message ) {
    /**:bot.answer( from, to, message )

    상대에 따라 반말 또는 존댓말로 대답
    */
    var talkDown = /sublee|홍민희|kijun|치도리/,
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

bot.giggle = function( from, to, message, match ) {
    /**:bot.giggle( from, to, message, match )

    남들이 웃는 만큼만 웃기
    */
    var ml = match[ 0 ].length,
        len = util.gaussianRand( ml, ml / 2 ),
        message = "";
    for ( var i = 0; i < len; i++ ) {
        message += "ㅋ";
    }
    this.talk( to, message );

    // 10% 확률로 화기애애수치 초기화
    util.probably( .10, function() {
        stat.funniness = 0;
    }, this );
};

bot.shuttle = function( from, to, message ) {
    /**:bot.shuttle( from, to, message )

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
                bot.talk( to, [[ url ], comments ] );
                bot.shuttle.history.push( url );
            });
        }
    });
};
bot.shuttle.history = [];

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
