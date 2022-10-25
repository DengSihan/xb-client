Array.prototype.shuffle = function() {

    let arr = [...this],
        currentIndex = arr.length,
        randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
    }

    return arr;
}

const extendAElementFromSelf = (arr, requiredLength) => {

}


Array.prototype.randomElements = function(minLength) {

    let arr = [...this];

    if (arr.length < minLength) {
        
    }
}