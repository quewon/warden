var G = {
  weightedRandom: function(P) {
    var key;

    let max = 0;
    for (let k in P) {
      max += P[k];
    }

    let random = Math.round(Math.random() * max);

    let i = 0;
    for (let k in P) {
      key = k;
      i += P[k];
      if (random <= i) {
        break;
      }
    }

    return key
  },

  arrayRandom: function(arr) {
    return arr[Math.random() * arr.length | 0];
  }
}