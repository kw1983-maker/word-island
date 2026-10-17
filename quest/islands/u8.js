// Treasure Quest · Unit 8 island (Super Minds pp. 94-105: The robot).
// Spots say where each puzzle sits; every play draws fresh questions for them from units/u8.js.
// Riddles and sentences are the only new text: check them on quest/review.html?unit=u8.
// The first choice of every riddle is the right one; the game shuffles them.
// Anchor names are places on the robot town map (quest/islands/u8-map.js, spec 0014).
export default {
  unit: "u8",
  year: 2,
  bonus: 20,
  spots: [
    { id: "s1", type: "chest", anchor: "pier-end" },
    { id: "s2", type: "chest", anchor: "workshop" },
    { id: "s3", type: "chest", anchor: "music-stage" },
    { id: "s4", type: "chest", anchor: "monkey-tree" },
    { id: "s5", type: "chest", anchor: "pool" },
    { id: "s6", type: "chest", anchor: "museum" },
    { id: "s7", type: "riddle", anchor: "animal-park" },
    { id: "s8", type: "riddle", anchor: "horse" },
    { id: "s9", type: "find", anchor: "battery-stall" },
    { id: "s10", type: "find", anchor: "bike" },
    { id: "s11", type: "blocks", anchor: "tennis" },
    { id: "s12", type: "blocks", anchor: "go-kart" }
  ],
  riddles: [
    {
      id: "u8q-r-cheetah", topic: "song", by: "Robo",
      lines: ["I am yellow with black spots.", "I can run very fast.", "Who am I?"],
      choices: ["s-cheetah", "s-kangaroo", "s-dolphin"], pics: true, alts: ["Charlie Cheetah", "Kate Kangaroo", "Dan Dolphin"],
      hint: "I look like a big cat.",
      why: "It's Charlie Cheetah. He can run very fast."
    },
    {
      id: "u8q-r-kangaroo", topic: "song", by: "Mei",
      lines: ["I am brown.", "I have got a big tail.", "I can jump up high."],
      choices: ["s-kangaroo", "s-cheetah", "s-ladybird"], pics: true, alts: ["Kate Kangaroo", "Charlie Cheetah", "Lucy Ladybird"],
      hint: "Jump, jump, jump!",
      why: "It's Kate Kangaroo. She can jump up high."
    },
    {
      id: "u8q-r-dolphin", topic: "song", by: "Jie",
      lines: ["I live in the sea.", "I am grey and clever.", "I can swim."],
      choices: ["s-dolphin", "s-bird", "s-lizard"], pics: true, alts: ["Dan Dolphin", "Bella Bird", "Larry Lizard"],
      hint: "Look in the pool.",
      why: "It's Dan Dolphin. He can swim."
    },
    {
      id: "u8q-r-horse", topic: "canyou", by: "Ming",
      lines: ["I have got four long legs.", "I can run fast.", "You can ride me."],
      choices: ["a-horse", "a-bike", "a-piano"], pics: true, alts: ["a horse", "a bike", "a piano"],
      hint: "Can you ride a …?",
      why: "You can ride a horse. Can you ride a horse?"
    },
    {
      id: "u8q-r-batteries", topic: "story", by: "Robo",
      lines: ["The robot needs us.", "Without us, it can't move.", "What are we?"],
      choices: ["batteries", "a head", "a leg"],
      hint: "Thunder says: We haven't got …",
      why: "Batteries! The robot needs batteries."
    },
    {
      id: "u8q-r-octo", topic: "funny", by: "Mei",
      lines: ["I am purple.", "I have got eight arms.", "I can dance."],
      choices: ["octo", "zak", "klump"], pics: true, alts: ["Octo", "Zak", "Klump"],
      hint: "Count my arms: eight!",
      why: "It's Octo. He has got eight arms and he can dance."
    }
  ],
  sentences: [
    { id: "u8q-s-robot", text: "Let's make a robot!", topic: "chant" },
    { id: "u8q-s-toes", text: "I can't touch my toes.", topic: "can" },
    { id: "u8q-s-horse", text: "Can you ride a horse?", topic: "canyou" },
    { id: "u8q-s-swim", text: "I can swim.", topic: "song" },
    { id: "u8q-s-head", text: "Here's the head.", topic: "story" },
    { id: "u8q-s-bones", text: "Bones are strong.", topic: "skeleton" }
  ]
};
