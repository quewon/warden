var Config = {
  keyMap: {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
  },

  alienTexture: "wavy",
  bgTexture: "carpet",
  filter: {
    // grayscale
    // 52: [52, 52, 52],
    // 132: [132, 132, 132],
    // 175: [175, 175, 175],
    // 201: [201, 201, 201],
    // 226: [226, 226, 226],
    // 94: [94, 94, 94],
    // 237: [237, 237, 237],

    // dreamscape8 + contrast
    52: [74, 46, 61],
    132: [76, 77, 94],
    175: [101, 120, 126],
    201: [153, 169, 154],
    226: [214, 216, 176],
    94: [175, 107, 72],
    237: [209, 174, 98],

    // nyx8
    // 52: [8, 20, 30],
    // 94: [32, 57, 79],
    // 132: [78, 73, 95],
    // 175: [129, 98, 113],
    // 201: [153, 117, 119],
    // 226: [195, 163, 138],
    // 237: [246, 214, 189],

    // calm sunset
    // 52: [104, 73, 113],
    // 94: [104, 73, 113],
    // 132: [225, 174, 164],
    // 175: [249, 216, 161],
    // 201: [255, 236, 178],
    // 226: [255, 252, 241],
    // 237: [203, 124, 162],

    // pastel qt
    // 52: [101, 80, 87],
    // 94: [109, 141, 138],
    // 132: [203, 129, 117],
    // 175: [226, 169, 126],
    // 201: [240, 207, 142],
    // 226: [168, 200, 166],
    // 237: [246, 237, 205],
  },
  hardLightRadius: 3,
  softLightRadius: 6,
  imageSmoothingEnabled: false,

  colKey: {
    "wall": [255, 0, 0],
    "playerspawn": [0, 255, 0],
    "alienspawn": [0, 0, 255],
    "doormanv": [0, 255, 255],
    "doormanh": [255, 255, 0],
    "lightswitch": [255, 190, 0]
  },

  viewportWidth: 32,
  viewportHeight: 24,
  viewportScale: 3.5,
}