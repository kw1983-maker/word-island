// Treasure Quest · Unit 7 island (Super Minds pp. 82-93: Get dressed!).
// Spots say where each puzzle sits; every play draws fresh questions for them from units/u7.js.
// Riddles and sentences are the only new text: check them on quest/review.html?unit=u7.
// The first choice of every riddle is the right one; the game shuffles them.
// Anchor names are places on the clothes town map (quest/islands/u7-map.js, spec 0012).
export default {
  unit: "u7",
  year: 2,
  bonus: 20,
  spots: [
    { id: "s1", type: "chest", anchor: "pier-end" },
    { id: "s2", type: "chest", anchor: "clothes-shop" },
    { id: "s3", type: "chest", anchor: "washing-line" },
    { id: "s4", type: "chest", anchor: "cat-stage" },
    { id: "s5", type: "chest", anchor: "bird-tree" },
    { id: "s6", type: "chest", anchor: "stairs" },
    { id: "s7", type: "riddle", anchor: "sheep" },
    { id: "s8", type: "riddle", anchor: "cotton-field" },
    { id: "s9", type: "find", anchor: "cow" },
    { id: "s10", type: "find", anchor: "hat-stall" },
    { id: "s11", type: "blocks", anchor: "park-bench" },
    { id: "s12", type: "blocks", anchor: "wardrobe" }
  ],
  riddles: [
    {
      id: "u7q-r-sheep", topic: "materials", by: "Robo",
      lines: ["I am white and soft.", "I live on a farm.", "Wool comes from me."],
      choices: ["m-sheep", "m-cow", "m-cotton"], pics: true, alts: ["a sheep", "a cow", "a cotton plant"],
      hint: "Your woolly hat comes from me.",
      why: "Wool comes from sheep. You can wear a woolly hat."
    },
    {
      id: "u7q-r-cow", topic: "materials", by: "Mei",
      lines: ["I am big and black and white.", "I live on a farm.", "Leather comes from me."],
      choices: ["m-cow", "m-sheep", "m-cotton"], pics: true, alts: ["a cow", "a sheep", "a cotton plant"],
      hint: "Your leather shoes come from me.",
      why: "Leather comes from cows. You can wear leather shoes."
    },
    {
      id: "u7q-r-cotton", topic: "materials", by: "Jie",
      lines: ["I am a plant.", "I am white and soft.", "Your T-shirt comes from me."],
      choices: ["m-cotton", "m-sheep", "m-cow"], pics: true, alts: ["a cotton plant", "a sheep", "a cow"],
      hint: "I grow in a field.",
      why: "Cotton comes from plants. You can wear a cotton T-shirt."
    },
    {
      id: "u7q-r-gloves", topic: "clothes", by: "Ming",
      lines: ["You wear us on your hands.", "We keep you warm.", "We are made of wool."],
      choices: ["m-gloves", "m-socks", "m-belt"], pics: true, alts: ["gloves", "socks", "a belt"],
      hint: "Put us on when it's cold.",
      why: "Gloves keep your hands warm. These gloves are made of wool."
    },
    {
      id: "u7q-r-cat", topic: "song", by: "Robo",
      lines: ["I wear a hat and a skirt.", "I sing: Meow, meow, meow!", "Who am I?"],
      choices: ["cat", "s-gary", "s-bird"], pics: true, alts: ["the cool cat", "Gary", "the bird"],
      hint: "I'm a cool, cool …",
      why: "It's the cool cat. I'm a cool, cool cat. Meow, meow, meow!"
    },
    {
      id: "u7q-r-cap", topic: "story", by: "Mei",
      lines: ["I am blue.", "A bird takes me.", "Gary wears me on his head."],
      choices: ["a cap", "a sock", "a shoe"],
      hint: "You wear me on your head.",
      why: "It's Gary's cap. Whisper says: I'm very sorry, Gary."
    }
  ],
  sentences: [
    { id: "u7q-s-jacket", text: "Put on your jacket.", topic: "clothes" },
    { id: "u7q-s-hat", text: "Do you like this hat?", topic: "like" },
    { id: "u7q-s-skirt", text: "She's wearing a blue skirt.", topic: "wearing" },
    { id: "u7q-s-cat", text: "I'm a cool cat.", topic: "song" },
    { id: "u7q-s-cap", text: "That's my cap.", topic: "story" },
    { id: "u7q-s-wool", text: "Wool comes from sheep.", topic: "materials" }
  ]
};
