exports.xyrnize = function xyrnize( bot ) {

bot.addListener( "kick", function( channel, who, by, reason ) {
    if ( who === this.nick ) {
        this.join( channel, function() {
            this.say( channel, "아 진짴ㅋㅋㅋㅋㅋ" );
        });
    }
});

bot.addListener( "message", function( from, to, message ) {
    if ( /xy(m|rn)|씸|성(용|룡)/.exec( message ) ) {
        this.say( to, "아몰라" );
        this.say( to, "오줌발사" );
    }
});

return bot;
}
