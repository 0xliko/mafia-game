module.exports = {
    random: function (min, max) {
    	return Math.floor(Math.random() * (max - min + 1) + min);
    },
    randArrVal: function (arr, splice) {
        var index = this.random(0, arr.length - 1);
        var res = arr[index];

        if (splice)
            arr.splice(index, 1);

        return res;
    },
    randomizeArray: function (arr) {
        let newArr = [];

        while (arr.length)
            newArr.push(this.randArrVal(arr, true));

        return newArr;
    }
};
