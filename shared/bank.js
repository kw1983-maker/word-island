// Word Island · shared question bank helpers.
// Loaded as a classic script before any units/uN.js, by Word Island and by Treasure Quest.
// Unit files build their questions with these helpers and use COLOURS, NUM and cap while they load.
const COLOURS = ["red", "yellow", "orange", "purple", "blue", "green", "black", "white"];
const NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

function cap(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Game 1: look at the picture, choose the answer. The first choice is always the right one.
function look(id, topic, pic, alt, q, choices, say, extra) {
  return { id, topic, pic, alt, q, choices, say, ...extra };
}

// Game 2: question and answer. The first choice is always the right one.
function ask(id, topic, pic, alt, q, choices, extra) {
  return { id, topic, pic, alt, q, choices, say: choices[0], ...extra };
}

// Game 3: spelling.
function spell(id, topic, pic, alt, word, extra) {
  return { id, topic, pic, alt, word, say: word, ...extra };
}

// Game 4: listen, then shoot the right plane.
function hear(id, topic, say, choices, extra) {
  return { id, topic, say, choices, ...extra };
}

const WORD_ISLAND_UNITS = {};
