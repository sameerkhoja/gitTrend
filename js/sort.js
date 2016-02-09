module.exports = {
    sort: function(array) {
        var frequency = {}, value;

        // compute frequencies of each value
        for(var i = 0; i < array.length; i++) {
            value = array[i];
            if(value in frequency) {
                frequency[value]++;
            }
            else {
                frequency[value] = 1;
            }
        }

        // make array from the frequency object to de-duplicate
        var uniques = [];
        for(value in frequency) {
            uniques.push(value);
        }

        // sort the uniques array in descending order by frequency
        function compareFrequency(a, b) {
            return frequency[b] - frequency[a];
        }

        return uniques.sort(compareFrequency);
    }
}

