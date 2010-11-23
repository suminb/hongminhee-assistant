var rand = exports.rand = function( min, max ) {
    if ( max === undefined ) {
        max = min;
        min = 0;
    }
    return min + Math.floor( Math.random() * (max + 1 - min) );
};

var choice = exports.choice = function( arr ) {
    return arr[ rand( arr.length - 1 ) ];
};

var probably = exports.probably = function( probability, callback, context ) {
    if ( Math.random() < probability ) {
        callback.call( context );
    }
};
