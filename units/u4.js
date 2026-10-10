// Word Island · Unit 4 (Super Minds pp. 46-57: Lunchtime).
// Pictures live in img/u4/. The first choice of every question is the right one.
WORD_ISLAND_UNITS.u4 = (() => {
  const TOPICS = {
    food: "Food",
    chant: "Lunchtime chant",
    ivegot: "I've got / I haven't got …",
    song: "Tommy's in the kitchen",
    haveany: "Have we got any …?",
    story: "The pizza",
    phonics: "Phonics: short o",
    numbers: "Numbers 11-20",
    fruitveg: "Fruit and veg"
  };

  const NUMS = ["eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];

  const MAZE = [
    look("u4m-chicken", "food", { img: "chicken" }, "a chicken", "What's this?", ["chicken", "cheese", "cake"], "It's chicken."),
    look("u4m-banana", "food", { img: "banana" }, "bananas", "What are these?", ["bananas", "carrots", "apples"], "They're bananas."),
    look("u4m-milk", "food", { img: "milk" }, "a glass of milk", "What's this?", ["milk", "juice", "cheese"], "It's milk."),
    look("u4m-juice", "food", { img: "juice" }, "a carton of orange juice", "What's this?", ["juice", "milk", "cake"], "It's juice."),
    look("u4m-apples", "food", { img: "apples" }, "green apples", "What are these?", ["apples", "peas", "bananas"], "They're apples."),
    look("u4m-carrots", "food", { img: "carrots" }, "carrots", "What are these?", ["carrots", "bananas", "sausages"], "They're carrots."),
    look("u4m-sausage", "food", { img: "sausage" }, "sausages", "What are these?", ["sausages", "carrots", "bananas"], "They're sausages."),
    look("u4m-cake", "food", { img: "cake" }, "a cake", "What's this?", ["cake", "cheese", "pizza"], "It's cake."),
    look("u4m-peas", "food", { img: "peas" }, "peas", "What are these?", ["peas", "apples", "carrots"], "They're peas.", { challenge: true }),
    look("u4m-pizza", "food", { img: "pizza" }, "a pizza", "What's this?", ["pizza", "cake", "cheese"], "It's pizza."),
    look("u4m-cheese", "food", { img: "cheese" }, "cheese", "What's this?", ["cheese", "cake", "chicken"], "It's cheese.", { challenge: true }),
    look("u4m-sandwich", "food", { img: "sandwich" }, "a sandwich", "What's this?", ["a sandwich", "a pizza", "a cake"], "It's a sandwich."),
    look("u4m-kid1", "ivegot", { img: "box-sandwich-apple" }, "a lunchbox with a sandwich and an apple", "What can you say?", ["I've got a sandwich and an apple.", "I've got pizza and a banana.", "I've got a sandwich and a banana."], "I've got a sandwich and an apple."),
    look("u4m-kid2", "ivegot", { img: "box-sandwich-banana" }, "a lunchbox with a sandwich and a banana", "What can you say?", ["I've got a sandwich and a banana.", "I've got a sandwich and an apple.", "I've got pizza and an apple."], "I've got a sandwich and a banana."),
    look("u4m-kid3", "ivegot", { img: "box-pizza-banana" }, "a lunchbox with pizza and a banana", "What can you say?", ["I haven't got an apple.", "I haven't got a banana.", "I haven't got pizza."], "I've got pizza and a banana. I haven't got an apple.", { challenge: true }),
    look("u4m-kid4", "ivegot", { img: "box-apple-pizza" }, "a lunchbox with pizza and an apple", "What can you say?", ["I haven't got a banana.", "I haven't got an apple.", "I haven't got pizza."], "I've got pizza and an apple. I haven't got a banana.", { challenge: true }),
    look("u4m-where", "story", { img: "st-where" }, "the friends in the lunch line", "What does Thunder say?", ["Where's Misty?", "Pizza, please.", "Thank you."], "Where's Misty?"),
    look("u4m-fair", "story", { img: "st-misty" }, "Misty at the front of the line", "What do the friends say?", ["Hey! That isn't fair.", "Fantastic!", "Here you are."], "Look at Misty! Hey! That isn't fair."),
    look("u4m-sorry", "story", { img: "st-sorry" }, "the dinner lady talks to Misty", "What does the dinner lady say?", ["Sorry, we haven't got pizza.", "A new pizza. Nice and hot.", "Where's Misty?"], "Sorry, we haven't got pizza."),
    look("u4m-sausages", "story", { img: "st-sausages" }, "Misty points at the sausages", "What does Misty say?", ["OK. Sausages and peas, please.", "Pizza, please.", "Fantastic!"], "OK. Sausages and peas, please."),
    look("u4m-thanks", "story", { img: "st-thanks" }, "the dinner lady gives Misty her lunch", "Here you are. What does Misty say?", ["Thank you.", "Pizza, please.", "Hey!"], "Here you are. Thank you."),
    look("u4m-new", "story", { img: "st-new" }, "the dinner lady with a new pizza", "What does the dinner lady say?", ["A new pizza. Nice and hot.", "Sorry, we haven't got pizza.", "Here you are."], "Look! A new pizza. Nice and hot.", { challenge: true }),
    look("u4m-table", "story", { img: "st-table" }, "the friends with pizza at the table", "What do the friends say?", ["We've got pizza. Nice and hot!", "We haven't got pizza.", "Where's Misty?"], "We've got pizza. Nice and hot!"),
    look("u4m-polly", "phonics", { img: "polly" }, "Polly at the shops", "Polly stops at the shop for a …", ["hot dog", "pizza", "cake"], "Polly stops at the shop for a hot dog."),
    ...NUMS.map((word, k) => look(`u4m-n${k + 11}`, "numbers", { img: `n${k + 11}` }, `${k + 11} cakes`, "What number is it?",
      [word, NUMS[(k + 1) % 10], NUMS[(k + 9) % 10]], `${cap(word)}.`, k === 2 || k === 4 ? { challenge: true } : {})),
    look("u4m-coconut", "fruitveg", { img: "coconut" }, "a coconut", "What is it?", ["a coconut", "an onion", "an orange"], "It's a coconut. Coconuts are fruit."),
    look("u4m-onion", "fruitveg", { img: "onion" }, "an onion", "What is it?", ["an onion", "an apple", "a coconut"], "It's an onion. Onions are vegetables."),
    look("u4m-corn", "fruitveg", { img: "corn" }, "corn", "What is it?", ["corn", "green beans", "a banana"], "It's corn. Corn is a vegetable."),
    look("u4m-orange", "fruitveg", { img: "orange" }, "oranges", "What are they?", ["oranges", "apples", "onions"], "They're oranges. Oranges are fruit."),
    look("u4m-greenbeans", "fruitveg", { img: "greenbeans" }, "green beans", "What are they?", ["green beans", "peas", "carrots"], "They're green beans.", { challenge: true })
  ];

  const MOLES = [
    ask("u4o-chant-chicken", "chant", { quote: "I don't like chicken, and I don't like …" }, "The chant: I don't like chicken, and I don't like …", "Finish the chant.", ["cheese.", "cake.", "steak."], { speakQ: "I don't like chicken, and I don't like … Finish the chant." }),
    ask("u4o-chant-pizza", "chant", { quote: "I don't like pizza, and I don't like …" }, "The chant: I don't like pizza, and I don't like …", "Finish the chant.", ["peas.", "apples.", "carrots."], { speakQ: "I don't like pizza, and I don't like … Finish the chant." }),
    ask("u4o-chant-apples", "chant", { quote: "Oh, I like apples, and I like …" }, "The chant: Oh, I like apples, and I like …", "Finish the chant.", ["steak.", "peas.", "cheese."], { speakQ: "Oh, I like apples, and I like … Finish the chant." }),
    ask("u4o-chant-carrots", "chant", { quote: "Oh, I like carrots, and I like …" }, "The chant: Oh, I like carrots, and I like …", "Finish the chant.", ["cake! Yummy!", "chicken!", "pizza!"], { speakQ: "Oh, I like carrots, and I like … Finish the chant.", challenge: true }),
    ask("u4o-kid1", "ivegot", { img: "kid1" }, "the girl with plaits", "What has she got?", ["A sandwich and an apple.", "Pizza and a banana.", "Pizza and an apple."]),
    ask("u4o-kid2", "ivegot", { img: "kid2" }, "the boy with glasses", "What has he got?", ["A sandwich and a banana.", "Pizza and an apple.", "A sandwich and an apple."]),
    ask("u4o-kid3", "ivegot", { img: "kid3" }, "the boy who waves", "Has he got an apple?", ["No. He's got pizza and a banana.", "Yes. He's got an apple.", "No. He's got a sandwich."], { challenge: true }),
    ask("u4o-kid4", "ivegot", { img: "kid4" }, "the girl with a headband", "Has she got a banana?", ["No. She's got pizza and an apple.", "Yes. She's got a banana.", "No. She's got a sandwich."], { challenge: true }),
    ask("u4o-same", "ivegot", { quote: "I've got a sandwich and an apple." }, "Your friend: I've got a sandwich and an apple. You've got the same lunch.", "What do you say?", ["Me too!", "I haven't got.", "No, I don't."], { speakQ: "I've got a sandwich and an apple. You've got the same lunch. What do you say?" }),
    ask("u4o-song-apple", "song", { quote: "I've got an apple in my …" }, "Tommy's song: I've got an apple in my …", "Finish the song.", ["sandwich.", "peas.", "cake."], { speakQ: "I've got an apple in my … Finish the song." }),
    ask("u4o-song-milk", "song", { quote: "I've got milk on my …" }, "Tommy's song: I've got milk on my …", "Finish the song.", ["peas.", "pizza.", "sausage."], { speakQ: "I've got milk on my … Finish the song." }),
    ask("u4o-song-carrots", "song", { quote: "I've got carrots on my …" }, "Tommy's song: I've got carrots on my …", "Finish the song.", ["pizza.", "cheese.", "cake."], { speakQ: "I've got carrots on my … Finish the song." }),
    ask("u4o-song-cake", "song", { quote: "I've got chicken with my …" }, "Tommy's song: I've got chicken with my …", "Finish the song.", ["cake.", "sandwich.", "peas."], { speakQ: "I've got chicken with my … Finish the song.", challenge: true }),
    ask("u4o-fridge-cheese", "haveany", { img: "fridge" }, "a fridge with cheese, cake, bananas, carrots, milk, apples, sausages and steak", "Have we got any cheese?", ["Yes, we have.", "No, we haven't.", "Yes, I do."]),
    ask("u4o-fridge-pizza", "haveany", { img: "fridge" }, "a fridge with cheese, cake, bananas, carrots, milk, apples, sausages and steak", "Have we got any pizza?", ["No, we haven't.", "Yes, we have.", "No, I don't."]),
    ask("u4o-fridge-carrots", "haveany", { img: "fridge" }, "a fridge with cheese, cake, bananas, carrots, milk, apples, sausages and steak", "Have we got any carrots?", ["Yes, we have.", "No, we haven't.", "Yes, it is."]),
    ask("u4o-fridge-peas", "haveany", { img: "fridge" }, "a fridge with cheese, cake, bananas, carrots, milk, apples, sausages and steak", "Have we got any peas?", ["No, we haven't.", "Yes, we have.", "No, it isn't."], { challenge: true }),
    ask("u4o-mark", "haveany", { img: "mark" }, "Mark with his basket", "Mark: I've got chicken in my basket. Yes or no?", ["Yes.", "No.", "Maybe."]),
    ask("u4o-tony", "haveany", { img: "tony" }, "Tony with his basket", "Tony: I've got a cheese sandwich in my basket. Yes or no?", ["No.", "Yes.", "Maybe."], { challenge: true }),
    ask("u4o-lynn", "haveany", { img: "lynn" }, "Lynn with her basket", "Lynn: I haven't got any bananas in my basket. Yes or no?", ["No. She's got bananas.", "Yes.", "No. She's got pizza."], { challenge: true }),
    ask("u4o-pizza-please", "story", { quote: "Pizza, please." }, "Misty says: Pizza, please.", "What does the dinner lady say?", ["Sorry, we haven't got pizza.", "Yes, we have.", "Fantastic!"], { speakQ: "Pizza, please. What does the dinner lady say?" }),
    ask("u4o-here", "story", { quote: "Here you are." }, "The dinner lady says: Here you are.", "What does Misty say?", ["Thank you.", "That isn't fair.", "Where's Misty?"], { speakQ: "Here you are. What does Misty say?" }),
    ask("u4o-fantastic", "story", { img: "st-new" }, "a new pizza", "A new pizza. Nice and hot. What do the friends say?", ["Fantastic!", "Sorry.", "Hey!"]),
    ask("u4o-turn", "story", { img: "st-misty" }, "Misty goes to the front of the line", "Misty doesn't wait her turn. Is it fair?", ["No, it isn't fair.", "Yes, it's fair.", "Yes, we have."], { challenge: true }),
    ask("u4o-polly", "phonics", { img: "polly" }, "Polly at the shops", "Where does Polly stop?", ["At the shop.", "At the school.", "At the park."]),
    ask("u4o-onion-grow", "fruitveg", { img: "onion" }, "an onion", "Where do onions grow?", ["In the ground.", "On trees.", "In the sea."]),
    ask("u4o-coconut-grow", "fruitveg", { img: "coconut" }, "a coconut", "Where do coconuts grow?", ["On trees.", "In the ground.", "Under the table."]),
    ask("u4o-fruit-veg", "fruitveg", { img: "orange" }, "oranges", "Fruit or vegetable?", ["Fruit.", "Vegetable.", "Sandwich."]),
    ask("u4o-healthy", "fruitveg", { quote: "Fruit and vegetables" }, "Fruit and vegetables", "Why do we eat fruit and vegetables?", ["To be healthy.", "To be cold.", "To be late."])
  ];

  const HANGMAN = [
    spell("u4h-cake", "food", { img: "cake" }, "a cake", "cake"),
    spell("u4h-milk", "food", { img: "milk" }, "milk", "milk"),
    spell("u4h-peas", "food", { img: "peas" }, "peas", "peas"),
    spell("u4h-apple", "food", { img: "apples" }, "an apple", "apple"),
    spell("u4h-juice", "food", { img: "juice" }, "juice", "juice"),
    spell("u4h-pizza", "food", { img: "pizza" }, "pizza", "pizza"),
    spell("u4h-cheese", "food", { img: "cheese" }, "cheese", "cheese"),
    spell("u4h-banana", "food", { img: "banana" }, "a banana", "banana"),
    spell("u4h-carrot", "food", { img: "carrots" }, "a carrot", "carrot"),
    spell("u4h-chicken", "food", { img: "chicken" }, "chicken", "chicken", { challenge: true }),
    spell("u4h-sausage", "food", { img: "sausage" }, "a sausage", "sausage", { challenge: true }),
    spell("u4h-sandwich", "food", { img: "sandwich" }, "a sandwich", "sandwich", { challenge: true }),
    spell("u4h-hot", "phonics", { img: "polly" }, "a hot dog", "hot"),
    spell("u4h-dog", "phonics", { img: "polly" }, "a hot dog", "dog"),
    spell("u4h-shop", "phonics", { img: "polly" }, "a shop", "shop"),
    spell("u4h-eleven", "numbers", { img: "n11" }, "11", "eleven"),
    spell("u4h-twelve", "numbers", { img: "n12" }, "12", "twelve"),
    spell("u4h-twenty", "numbers", { img: "n20" }, "20", "twenty"),
    spell("u4h-onion", "fruitveg", { img: "onion" }, "an onion", "onion"),
    spell("u4h-corn", "fruitveg", { img: "corn" }, "corn", "corn"),
    spell("u4h-orange", "fruitveg", { img: "orange" }, "an orange", "orange"),
    spell("u4h-tree", "fruitveg", { img: "tree" }, "a tree", "tree")
  ];

  const PLANES = [
    hear("u4p-pizza", "food", "pizza", ["pizza", "cake", "cheese"], { pics: true, alts: ["pizza", "cake", "cheese"] }),
    hear("u4p-peas", "food", "peas", ["peas", "apples", "carrots"], { pics: true, alts: ["peas", "apples", "carrots"] }),
    hear("u4p-juice", "food", "juice", ["juice", "milk", "cheese"], { pics: true, alts: ["juice", "milk", "cheese"] }),
    hear("u4p-sausage", "food", "a sausage", ["sausage", "carrots", "banana"], { pics: true, alts: ["sausages", "carrots", "bananas"] }),
    hear("u4p-chicken", "food", "chicken", ["chicken", "cake", "cheese"], { pics: true, alts: ["chicken", "cake", "cheese"], challenge: true }),
    hear("u4p-box1", "ivegot", "I've got a sandwich and a banana.", ["box-sandwich-banana", "box-sandwich-apple", "box-pizza-banana"], { pics: true, alts: ["sandwich and banana", "sandwich and apple", "pizza and banana"] }),
    hear("u4p-box2", "ivegot", "I've got pizza and an apple. I haven't got a banana.", ["box-apple-pizza", "box-pizza-banana", "box-sandwich-apple"], { pics: true, alts: ["pizza and apple", "pizza and banana", "sandwich and apple"], challenge: true }),
    hear("u4p-havent", "ivegot", "I haven't got a banana.", ["I haven't got a banana.", "I've got a banana.", "I haven't got an apple."]),
    hear("u4p-yeswe", "haveany", "Have we got any cheese? Yes, we have.", ["Yes, we have.", "No, we haven't.", "Yes, I do."]),
    hear("u4p-nowe", "haveany", "Have we got any pizza? No, we haven't.", ["No, we haven't.", "Yes, we have.", "No, I don't."], { challenge: true }),
    hear("u4p-sorry", "story", "Sorry, we haven't got pizza.", ["Sorry, we haven't got pizza.", "Look! A new pizza.", "We've got pizza."]),
    hear("u4p-fair", "story", "Hey! That isn't fair.", ["Hey! That isn't fair.", "Hey! That's fantastic.", "Here you are."]),
    hear("u4p-hot", "story", "A new pizza. Nice and hot.", ["A new pizza. Nice and hot.", "A new pizza. Nice and cold.", "An old pizza. Nice and hot."], { challenge: true }),
    hear("u4p-polly", "phonics", "Polly stops at the shop for a hot dog.", ["Polly stops at the shop for a hot dog.", "Polly stops at the shop for a hot pot.", "Polly shops at the stop for a hot dog."], { challenge: true }),
    hear("u4p-n13", "numbers", "thirteen", ["13", "30", "3"], { big: true, show: "thirteen" }),
    hear("u4p-n15", "numbers", "fifteen", ["15", "50", "5"], { big: true, show: "fifteen" }),
    hear("u4p-n17", "numbers", "seventeen", ["17", "70", "7"], { big: true, show: "seventeen" }),
    hear("u4p-n19", "numbers", "nineteen", ["19", "90", "9"], { big: true, show: "nineteen", challenge: true }),
    hear("u4p-n12", "numbers", "twelve", ["12", "20", "2"], { big: true, show: "twelve" }),
    hear("u4p-n20", "numbers", "twenty", ["20", "12", "2"], { big: true, show: "twenty" }),
    hear("u4p-ground", "fruitveg", "Onions grow in the ground.", ["ground", "palmtree", "tree"], { pics: true, alts: ["in the ground", "on a palm tree", "on a tree"] }),
    hear("u4p-coconut", "fruitveg", "Coconuts grow on trees.", ["palmtree", "ground", "beanplant"], { pics: true, alts: ["on a palm tree", "in the ground", "on a plant"] }),
    hear("u4p-cornplant", "fruitveg", "Corn grows on plants.", ["cornplant", "ground", "palmtree"], { pics: true, alts: ["corn plants", "in the ground", "on a palm tree"], challenge: true }),
    hear("u4p-corn", "fruitveg", "corn", ["corn", "greenbeans", "onion"], { pics: true, alts: ["corn", "green beans", "an onion"] })
  ];

  // Teacher explain page: a hint per topic to give before the answer.
  const HINTS = {
    food: "Say the lunch words: banana, cake, cheese sandwich, apple, pizza, sausage, chicken, steak, peas, carrots.",
    chant: "Say the chant: I don't like chicken, cheese, pizza or peas. I like apples, steak, carrots and cake!",
    ivegot: "I've got: it's in my lunchbox. I haven't got: it isn't there.",
    song: "Sing Tommy's in the kitchen. Tommy puts the food in silly places!",
    haveany: "Look in the fridge. It's there: Yes, we have. It isn't there: No, we haven't.",
    story: "Remember The pizza. Misty doesn't wait her turn, so there's no pizza for her.",
    phonics: "Listen for the short o sound: P-o-lly, st-o-ps, sh-o-p, h-o-t d-o-g.",
    numbers: "Count from eleven to twenty: eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty.",
    fruitveg: "Fruit grows on trees: apples, oranges, coconuts. Vegetables like onions grow in the ground."
  };

  // Notes for single questions: a better hint, and why the answer is right.
  const NOTES = {
    "u4m-kid3": { hint: "Look in the lunchbox. What is missing?", why: "Pizza and a banana are there. There's no apple: I haven't got an apple." },
    "u4m-kid4": { hint: "Look in the lunchbox. What is missing?", why: "Pizza and an apple are there. There's no banana: I haven't got a banana." },
    "u4m-peas": { hint: "Small and green and round.", why: "Peas are small, round and green." },
    "u4m-cheese": { why: "Cheese is yellow with holes." },
    "u4m-new": { why: "The dinner lady brings a new pizza: Nice and hot." },
    "u4m-greenbeans": { hint: "Long and thin, or small and round?", why: "Green beans are long and thin. Peas are small and round." },
    "u4m-n13": { hint: "Look at the flag.", why: "13 is thirteen." },
    "u4m-n15": { hint: "Look at the flag.", why: "15 is fifteen." },
    "u4o-chant-carrots": { why: "The chant ends: Oh, I like carrots, and I like cake! Yummy!" },
    "u4o-kid3": { why: "He says: I've got pizza and a banana. I haven't got an apple." },
    "u4o-kid4": { why: "She says: I've got pizza and an apple. I haven't got a banana." },
    "u4o-song-cake": { why: "Tommy sings: I've got chicken with my cake." },
    "u4o-fridge-peas": { hint: "Look on every shelf. Can you see peas?", why: "There are no peas in the fridge: No, we haven't." },
    "u4o-fridge-pizza": { why: "There's no pizza in the fridge: No, we haven't." },
    "u4o-tony": { hint: "Look in Tony's basket.", why: "Tony has apples and a cake, but no cheese sandwich." },
    "u4o-lynn": { hint: "Look in Lynn's basket. Is there anything yellow?", why: "Lynn has bananas in her basket, so the sentence is wrong." },
    "u4o-turn": { why: "The story is about waiting your turn. Misty pushes in, and that isn't fair." },
    "u4p-box2": { hint: "Listen for pizza and apple.", why: "Pizza and an apple, no banana." },
    "u4p-nowe": { why: "Have we got any pizza? No, we haven't." },
    "u4p-hot": { hint: "Listen: new or old? hot or cold?", why: "A new pizza. Nice and hot." },
    "u4p-polly": { hint: "Listen: stops at the shop, for a hot dog.", why: "Polly stops at the shop for a hot dog." },
    "u4p-n19": { hint: "Listen to the end: -teen or -ty?", why: "Nineteen is 19. Ninety is 90." }
  };

  return {
    id: "u4",
    number: 4,
    title: "Lunchtime",
    h1: "What's for lunch?",
    lede: "Food, I've got / I haven't got, Have we got any …?, the story The pizza, numbers 11-20, and fruit and vegetables. Come to Word Island. Play, and practise.",
    topics: TOPICS,
    hints: HINTS,
    notes: NOTES,
    banks: { maze: MAZE, moles: MOLES, hangman: HANGMAN, planes: PLANES }
  };
})();
