var Config = {
  keyMap: {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
    interact: " "
  },

  bg: "#397485",

  filter: {
    // // scenes
    // 52: [30, 37, 38],
    // 132: [75, 102, 110],
    // 175: [161, 187, 191],
    // 201: [153, 194, 199],
    // 226: [193, 227, 230],

    // // aliens
    // 94: [92, 85, 66],
    // 237: [255, 214, 99],

    52: [52, 52, 52],
    132: [132, 132, 132],
    175: [175, 175, 175],
    201: [201, 201, 201],
    226: [226, 226, 226],
    94: [94, 94, 94],
    237: [237, 237, 237]
  },
  hardLightRadius: 3,
  softLightRadius: 6,
  ambientLight: 0.2, //max: 0.99, min: 0.001 | 0.2, 0.6
  imageSmoothingEnabled: false,

  colKey: {
    "wall": [255, 0, 0],
    "playerspawn": [0, 255, 0],
    "alienspawn": [0, 0, 255],
  },

  viewportWidth: 20,
  viewportHeight: 20,
  viewportScale: 4,
}