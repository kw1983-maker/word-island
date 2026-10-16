// Treasure Quest · Unit 9 island (Super Minds pp. 106-117: At the beach).
// Spots say where each puzzle sits; every play draws fresh questions for them from units/u9.js.
// Riddles and sentences are the only new text: check them on quest/review.html?unit=u9.
// The first choice of every riddle is the right one; the game shuffles them.
// Anchor names are places on the beach island map (feature 7 builds them).
export default {
  unit: "u9",
  year: 2,
  bonus: 20,
  spots: [
    { id: "s1", type: "chest", anchor: "pier-end" },
    { id: "s2", type: "chest", anchor: "palm-tree" },
    { id: "s3", type: "chest", anchor: "boat" },
    { id: "s4", type: "chest", anchor: "big-rock" },
    { id: "s5", type: "chest", anchor: "hill-top" },
    { id: "s6", type: "chest", anchor: "lighthouse" },
    { id: "s7", type: "riddle", anchor: "hut" },
    { id: "s8", type: "riddle", anchor: "ice-cream-cart" },
    { id: "s9", type: "find", anchor: "rock-pool" },
    { id: "s10", type: "find", anchor: "beach-towel" },
    { id: "s11", type: "blocks", anchor: "bench" },
    { id: "s12", type: "blocks", anchor: "sandcastle" }
  ],
  riddles: [
    {
      id: "u9q-r-sandcastle", topic: "beach", by: "Robo",
      lines: ["I am made of sand.", "I have towers and flags.", "The sea can wash me away."],
      choices: ["castle", "icecream", "football"], pics: true, alts: ["a sandcastle", "an ice cream", "a football"],
      hint: "You make me with a bucket and a spade.",
      why: "A sandcastle is made of sand. Let's make a sandcastle!"
    },
    {
      id: "u9q-r-icecream", topic: "lets", by: "Mei",
      lines: ["I am cold and sweet.", "I melt in the hot sun.", "You can eat me at the beach."],
      choices: ["icecream", "openbook", "guitar"], pics: true, alts: ["an ice cream", "a book", "a guitar"],
      hint: "You can eat me.",
      why: "An ice cream is cold and sweet. Let's eat ice cream!"
    },
    {
      id: "u9q-r-guitar", topic: "lets", by: "Jie",
      lines: ["I have strings.", "You play me with your fingers.", "I make music."],
      choices: ["guitar", "football", "rod"], pics: true, alts: ["a guitar", "a football", "a fishing rod"],
      hint: "You can play me and sing a song.",
      why: "A guitar has strings and makes music. Let's play the guitar!"
    },
    {
      id: "u9q-r-koala", topic: "places", by: "Ming",
      lines: ["I am grey and soft.", "I sleep in a tree.", "You find me in Australia."],
      choices: ["koala", "rod", "castle"], pics: true, alts: ["a koala", "a fishing rod", "a sandcastle"],
      hint: "I am an animal.",
      why: "A koala is a grey animal. It sleeps in trees in Australia."
    },
    {
      id: "u9q-r-sun", topic: "weather", by: "Robo",
      lines: ["I am big and yellow.", "I am up in the sky.", "When you see me, it's hot."],
      choices: ["w-sunny", "w-cloudy", "w-snowing"], pics: true, alts: ["the sun", "clouds", "snow"],
      hint: "Look up in the sky on a hot day.",
      why: "The sun is big and yellow. It's hot and sunny!"
    },
    {
      id: "u9q-r-thunder", topic: "story", by: "Mei",
      lines: ["I am very strong.", "I move the big rock for Flash.", "Who am I?"],
      choices: ["Thunder", "Flash", "Misty"],
      hint: "He says: Just wait and see.",
      why: "Thunder is strong. He moves the rock, and Flash says: Thanks, Thunder."
    }
  ],
  sentences: [
    { id: "u9q-s-sandcastle", text: "Let's make a sandcastle.", topic: "beach" },
    { id: "u9q-s-swim", text: "Let's swim in the sea.", topic: "song" },
    { id: "u9q-s-sunny", text: "It's hot and sunny.", topic: "weather" },
    { id: "u9q-s-toybox", text: "They're in the red toy box.", topic: "where" }
  ]
};
