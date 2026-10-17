// Treasure Quest · Unit 3 island (Super Minds pp. 34-45: Pet show).
// Spots say where each puzzle sits; every play draws fresh questions for them from units/u3.js.
// Riddles are the only new text: check them on quest/review.html?unit=u3. Year 1 has no sentences.
// The first choice of every riddle is the right one; the game shuffles them (Year 1 shows two).
// Anchor names are places on the pet show park map (quest/islands/u3-map.js, spec 0011).
export default {
  unit: "u3",
  year: 1,
  bonus: 20,
  spots: [
    { id: "s1", type: "chest", anchor: "pier-end" },
    { id: "s2", type: "chest", anchor: "pet-show" },
    { id: "s3", type: "chest", anchor: "dog-pen" },
    { id: "s4", type: "chest", anchor: "big-tree" },
    { id: "s5", type: "chest", anchor: "pond" },
    { id: "s6", type: "chest", anchor: "crocodile" },
    { id: "s7", type: "riddle", anchor: "school" },
    { id: "s8", type: "riddle", anchor: "prize-stall" },
    { id: "s9", type: "find", anchor: "log" },
    { id: "s10", type: "find", anchor: "tall-grass" },
    { id: "s11", type: "blocks", anchor: "desk" },
    { id: "s12", type: "blocks", anchor: "cat-pen" }
  ],
  riddles: [
    {
      id: "u3q-r-spider", topic: "story", by: "Robo",
      lines: ["I am small and I have eight legs.", "I make a web.", "My brothers and sisters are in the tree."],
      choices: ["spider", "snake", "butterfly"], pics: true, alts: ["a spider", "a snake", "a butterfly"],
      hint: "Whisper likes me. Look in the big tree.",
      why: "A spider has eight legs and makes a web. Whisper and his spider!"
    },
    {
      id: "u3q-r-frog", topic: "pets", by: "Mei",
      lines: ["I am small and green.", "I can jump.", "I like the pond."],
      choices: ["frog-in-bag", "q-lizard", "rat-on-book"], pics: true, alts: ["a frog", "a lizard", "a rat"],
      hint: "I can jump in the water.",
      why: "A frog is small and green. It can jump!"
    },
    {
      id: "u3q-r-giraffe", topic: "camouflage", by: "Jie",
      lines: ["I am very tall.", "I have a long neck.", "I am yellow and brown."],
      choices: ["giraffe", "tiger", "crocodile"], pics: true, alts: ["a giraffe", "a tiger", "a crocodile"],
      hint: "I can eat the leaves at the top of a tree.",
      why: "A giraffe is very tall. It has a long neck."
    },
    {
      id: "u3q-r-crocodile", topic: "camouflage", by: "Ming",
      lines: ["I am green.", "I live in the water.", "I have a big mouth."],
      choices: ["crocodile", "snake", "butterfly"], pics: true, alts: ["a crocodile", "a snake", "a butterfly"],
      hint: "The water is green and I am green too.",
      why: "A crocodile is green and the water is green, so it can hide."
    },
    {
      id: "u3q-r-tiger", topic: "camouflage", by: "Robo",
      lines: ["I am orange and black.", "I look like a big cat.", "I hide in the tall grass."],
      choices: ["tiger", "giraffe", "snake"], pics: true, alts: ["a tiger", "a giraffe", "a snake"],
      hint: "Tigers hide in tall grass.",
      why: "A tiger is orange and black. Tigers hide in tall grass."
    },
    {
      id: "u3q-r-whisper", topic: "story", by: "Mei",
      lines: ["I have a spider.", "I say: Come back, he's beautiful!", "Who am I?"],
      choices: ["Whisper", "Misty", "Thunder"],
      hint: "Whisper and his …",
      why: "Whisper likes spiders. He says: Come back, he's beautiful. Look!"
    }
  ],
  sentences: []
};
