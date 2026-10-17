// Treasure Quest · Unit 4 island (Super Minds pp. 46-57: Lunchtime).
// Spots say where each puzzle sits; every play draws fresh questions for them from units/u4.js.
// Riddles are the only new text: check them on quest/review.html?unit=u4. Year 1 has no sentences.
// The first choice of every riddle is the right one; the game shuffles them (Year 1 shows two).
// Anchor names are places on the lunchtime town map (quest/islands/u4-map.js, spec 0013).
export default {
  unit: "u4",
  year: 1,
  bonus: 20,
  spots: [
    { id: "s1", type: "chest", anchor: "pier-end" },
    { id: "s2", type: "chest", anchor: "canteen" },
    { id: "s3", type: "chest", anchor: "kitchen" },
    { id: "s4", type: "chest", anchor: "apple-tree" },
    { id: "s5", type: "chest", anchor: "pizza-oven" },
    { id: "s6", type: "chest", anchor: "fruit-stall" },
    { id: "s7", type: "riddle", anchor: "shop" },
    { id: "s8", type: "riddle", anchor: "garden" },
    { id: "s9", type: "find", anchor: "juice-stall" },
    { id: "s10", type: "find", anchor: "coconut-palm" },
    { id: "s11", type: "blocks", anchor: "picnic" },
    { id: "s12", type: "blocks", anchor: "lunch-table" }
  ],
  riddles: [
    {
      id: "u4q-r-banana", topic: "food", by: "Robo",
      lines: ["I am long and yellow.", "I am a fruit.", "You can eat me at lunchtime."],
      choices: ["banana", "apples", "carrots"], pics: true, alts: ["bananas", "apples", "carrots"],
      hint: "I am yellow.",
      why: "Bananas are long and yellow. I've got a sandwich and a banana!"
    },
    {
      id: "u4q-r-pizza", topic: "story", by: "Mei",
      lines: ["I am round and hot.", "I have cheese on top.", "Misty wants me for lunch."],
      choices: ["pizza", "cake", "sandwich"], pics: true, alts: ["pizza", "cake", "a sandwich"],
      hint: "A new one is nice and hot!",
      why: "It's pizza. A new pizza. Nice and hot!"
    },
    {
      id: "u4q-r-coconut", topic: "fruitveg", by: "Jie",
      lines: ["I am brown and round.", "I am white inside.", "I grow on a tree."],
      choices: ["coconut", "onion", "orange"], pics: true, alts: ["a coconut", "an onion", "an orange"],
      hint: "Look up at the palm tree.",
      why: "A coconut is brown and round. Coconuts grow on trees."
    },
    {
      id: "u4q-r-carrot", topic: "food", by: "Ming",
      lines: ["I am long and orange.", "I am a vegetable.", "I grow in the ground."],
      choices: ["carrots", "banana", "corn"], pics: true, alts: ["carrots", "bananas", "corn"],
      hint: "I am orange.",
      why: "Carrots are orange vegetables. They grow in the ground."
    },
    {
      id: "u4q-r-milk", topic: "food", by: "Robo",
      lines: ["I am white.", "I come from a cow.", "You can drink me."],
      choices: ["milk", "juice", "cheese"], pics: true, alts: ["milk", "juice", "cheese"],
      hint: "Have we got any milk?",
      why: "Milk is white and comes from cows. You can drink milk."
    },
    {
      id: "u4q-r-misty", topic: "story", by: "Mei",
      lines: ["I don't wait in the line.", "I want pizza for lunch.", "Who am I?"],
      choices: ["Misty", "Thunder", "Whisper"],
      hint: "The friends say: Hey! That isn't fair.",
      why: "Misty goes to the front of the line. Hey! That isn't fair."
    }
  ],
  sentences: []
};
