var humane = require( "./lib/humane" ),
    util = require( "./lib/util" );

module.exports = function xyrnize( bot ) {

bot.addListener( "kick", function( channel, who, by, reason ) {
    if ( who === this.nick ) {
        this.join( channel, function() {
            this.talk( channel, "아 진짴ㅋㅋㅋㅋㅋ" );
        });
    }
});

bot.addListener( "message", function( from, to, message ) {
    if ( /xy(m|rn)|씸|성(용|룡)/.exec( message ) ) {
        this.shoot.apply( this, arguments );
    }
});

bot.shoot = function( from, to, message ) {
    var messages = [[
        "아몰라", "아오몰라", "몰라몰라", "모른다고", "모른다니까?"
    ],[
        "오줌발싸", "오줌발사", "오존발사", "옷좀발사", "똥발싸",
        "고종발사", "우주발사", "옵좀발사", "나로호발사", "왼발~왼발싸",
        "이발사", "숟갈발사", "외주발사", "전방을 향하여 힘찬 함성 발사",
        "ㅇㅈ발사", "ㅇㅅㅇ", "인중발사", "인증발사", "소변발사",
        "위성발사", "포탄발사", "재석 선배 맥북에어 발사"
    ]];
    this.talk( to, util.choice( messages[ 0 ] ) );
    this.talk( to, util.choice( messages[ 1 ] ) );
    util.probably( .10, function() {
        this.talk( to, "아 여기 공개채널이었지" );
    }, this );
};

bot.suggestDinnerMenu = function( channel ) {
    var messages = [[
        "홍민희: 오늘 머뭑지?", "홍민희: 이따 뭐 먹을거?"
    ],[
        "피자 먹자 피자", "홍민희: 도시락 or 치킨 or 『피자』",
        "피자 시키자", "피자나 시킬까", "피ㅣ자나 시킬까",
        "너 피자 아직도 있더라"
    ]];
    this.talk( to, util.choice( messages[ 0 ] ) );
    this.talk( to, util.choice( messages[ 1 ] ) );
};

return bot;
};
