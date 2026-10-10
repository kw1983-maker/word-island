// Word Island · Unit 7 (Super Minds pp. 82-93: Get dressed!).
// Pictures live in img/u7/. The first choice of every question is the right one.
WORD_ISLAND_UNITS.u7 = (() => {
  const TOPICS = {
    clothes: "Clothes",
    like: "Do you like this / these …?",
    song: "The cool cat",
    wearing: "Is he / she wearing …?",
    story: "The cap",
    phonics: "Phonics: sp / st",
    materials: "Materials"
  };

  const MAZE = [
    look("u7m-tshirt", "clothes", { img: "c-bluetshirt" }, "a blue T-shirt", "What's this?", ["a T-shirt", "a jacket", "a sweater"], "It's a T-shirt."),
    look("u7m-cap", "clothes", { img: "c-cap" }, "a pink cap", "What's this?", ["a cap", "a hat", "a shoe"], "It's a cap."),
    look("u7m-jacket", "clothes", { img: "c-jacket" }, "a green jacket", "What's this?", ["a jacket", "a T-shirt", "a skirt"], "It's a jacket."),
    look("u7m-jeans", "clothes", { img: "c-jeans" }, "blue jeans", "What are these?", ["jeans", "socks", "shorts"], "They're jeans."),
    look("u7m-socks", "clothes", { img: "c-socks" }, "purple socks", "What are these?", ["socks", "shoes", "jeans"], "They're socks."),
    look("u7m-shoes", "clothes", { img: "c-shoes" }, "red shoes", "What are these?", ["shoes", "socks", "trousers"], "They're shoes."),
    look("u7m-trousers", "clothes", { img: "c-trousers" }, "black trousers", "What are these?", ["trousers", "shorts", "socks"], "They're trousers.", { challenge: true }),
    look("u7m-shorts", "clothes", { img: "m-shorts" }, "checked shorts", "What are these?", ["shorts", "trousers", "a skirt"], "They're shorts.", { challenge: true }),
    look("u7m-sweater", "clothes", { img: "m-sweater" }, "a white sweater", "What's this?", ["a sweater", "a T-shirt", "a jacket"], "It's a sweater."),
    look("u7m-redsocks", "clothes", { img: "c-redsocks" }, "red socks", "What colour are the socks?", ["They're red.", "They're purple.", "It's red."], "These socks are red."),
    look("u7m-greycap", "clothes", { img: "c-greycap" }, "a grey cap", "What colour is the cap?", ["It's grey.", "It's pink.", "They're grey."], "This cap is grey."),
    look("u7m-l-hat", "like", { img: "l-hat" }, "a white hat", "What can you ask?", ["Do you like this hat?", "Do you like these hat?", "Do you like this hats?"], "Do you like this hat?"),
    look("u7m-l-boots", "like", { img: "l-boots" }, "two pink boots", "What can you ask?", ["Do you like these boots?", "Do you like this boots?", "Do you like these boot?"], "Do you like these boots?", { challenge: true }),
    look("u7m-l-jacket", "like", { img: "l-jacket" }, "a jacket with stars", "What can you ask?", ["Do you like this jacket?", "Do you like these jacket?", "Do you like this jackets?"], "Do you like this jacket?"),
    look("u7m-l-trousers", "like", { img: "l-trousers" }, "orange trousers", "What can you ask?", ["Do you like these trousers?", "Do you like this trousers?", "Do you like this trouser?"], "Do you like these trousers?", { challenge: true }),
    look("u7m-cat", "song", { img: "cat" }, "a cat with a hat and a skirt", "What does the song say?", ["I'm a cool, cool cat.", "I'm a big, big dog.", "I'm a super, super hat."], "I'm a cool, cool cat. Meow, meow, meow!"),
    look("u7m-naomi", "wearing", { img: "k-naomi" }, "Naomi", "What's Naomi wearing?", ["a black skirt", "a black hat", "blue shorts"], "Naomi is wearing a red hat, a blue sweater and a black skirt."),
    look("u7m-amy", "wearing", { img: "k-amy" }, "Amy", "What's Amy wearing?", ["a blue skirt and red socks", "a black skirt and green socks", "blue jeans"], "Amy is wearing a blue skirt and red socks."),
    look("u7m-james", "wearing", { img: "k-james" }, "James", "What colour is James's cap?", ["black", "red", "white"], "James is wearing a black cap, not a red hat.", { challenge: true }),
    look("u7m-oscar", "wearing", { img: "k-oscar" }, "Oscar", "What's Oscar wearing on his head?", ["a white hat", "a blue cap", "a red hat"], "Oscar is wearing a white hat."),
    look("u7m-tom", "wearing", { img: "tom" }, "Tom on his bike", "What's Tom doing?", ["He's riding a bike.", "He's riding a pony.", "He's playing football."], "Tom is riding a bike."),
    look("u7m-gary", "story", { img: "s-gary" }, "Gary with a blue cap", "What does Gary say?", ["No, it's my cap.", "Thanks.", "Get my cap, please."], "No, it's my cap."),
    look("u7m-bird", "story", { img: "s-bird" }, "a bird takes Gary's cap", "What does Gary say?", ["Hey!", "Thanks.", "It's OK."], "Hey! The bird takes the cap."),
    look("u7m-thanks", "story", { img: "s-thanks" }, "the bird puts the cap on Whisper's head", "What does Whisper say?", ["Thanks.", "Hey!", "It's OK."], "Thanks. The bird gives Whisper the cap."),
    look("u7m-chair", "story", { img: "s-chair" }, "a cap under the chair at home", "What does Whisper say?", ["Oh no! That's my cap!", "Stop! That's my cap.", "My cap isn't here."], "Oh no! That's my cap! His cap is at home.", { challenge: true }),
    look("u7m-sorry", "story", { img: "s-sorry" }, "Whisper gives the cap back to Gary", "What does Whisper say?", ["I'm very sorry, Gary.", "No problem.", "Stop!"], "I'm very sorry, Gary."),
    look("u7m-spiders", "phonics", { img: "spiders" }, "six spiders on the stairs", "How many spiders are there?", ["six", "two", "ten"], "Six spiders stop for sandwiches on the stairs."),
    look("u7m-cotton", "materials", { img: "m-cotton" }, "a cotton plant", "What comes from this plant?", ["cotton", "wool", "leather"], "Cotton comes from plants."),
    look("u7m-cow", "materials", { img: "m-cow" }, "a cow", "What comes from cows?", ["leather", "cotton", "wool"], "Leather comes from cows."),
    look("u7m-sheep", "materials", { img: "m-sheep" }, "a sheep", "What comes from sheep?", ["wool", "leather", "cotton"], "Wool comes from sheep."),
    look("u7m-woolhat", "materials", { img: "m-woolhat" }, "a purple woolly hat", "What is it made of?", ["wool", "leather", "cotton"], "It's wool. Wool is warm."),
    look("u7m-belt", "materials", { img: "m-belt" }, "a brown belt", "What is it made of?", ["leather", "wool", "cotton"], "It's leather. Leather is strong."),
    look("u7m-gloves", "materials", { img: "m-gloves" }, "blue gloves", "What are they made of?", ["wool", "leather", "cotton"], "They're wool.", { challenge: true }),
    look("u7m-m-tshirt", "materials", { img: "m-tshirt" }, "a red T-shirt", "What is it made of?", ["cotton", "wool", "leather"], "It's cotton. Cotton is cool."),
    look("u7m-m-jacket", "materials", { img: "m-jacket" }, "a brown jacket", "What is it made of?", ["leather", "cotton", "wool"], "It's leather. You can wear leather jackets."),
    look("u7m-m-socks", "materials", { img: "m-socks" }, "striped socks", "What are they made of?", ["wool", "leather", "cotton"], "They're wool. You can wear woollen socks.", { challenge: true })
  ];

  const MOLES = [
    ask("u7o-like-hat", "like", { img: "l-greenhat" }, "a green hat", "Do you like this hat? (You like it.)", ["Yes, I do.", "No, I don't.", "Yes, it is."]),
    ask("u7o-like-boots", "like", { img: "l-redboots" }, "red boots", "Do you like these boots? (You don't like them.)", ["No, I don't.", "Yes, I do.", "No, it isn't."]),
    ask("u7o-like-tuxedo", "like", { img: "l-tuxedo" }, "a dark blue jacket", "Do you like this jacket? (You like it.)", ["Yes, I do.", "No, I don't.", "Yes, they are."]),
    ask("u7o-this-these", "like", { quote: "Do you like ___ shoes?" }, "Do you like ___ shoes?", "Which word?", ["these", "this", "a"], { speakQ: "Do you like this or these shoes?", challenge: true }),
    ask("u7o-this-hat", "like", { quote: "Do you like ___ hat?" }, "Do you like ___ hat?", "Which word?", ["this", "these", "they"], { speakQ: "Do you like this or these hat?", challenge: true }),
    ask("u7o-cat-hat", "song", { quote: "I'm a cool, cool cat. I like this super …" }, "The song: I like this super …", "Finish the song.", ["hat.", "shorts.", "socks."], { speakQ: "I'm a cool, cool cat. I like this super … Finish the song." }),
    ask("u7o-cats-hats", "song", { quote: "We're cool, cool cats. We like these super …" }, "The song: We like these super …", "Finish the song.", ["hats.", "hat.", "cat."], { speakQ: "We're cool, cool cats. We like these super … Finish the song.", challenge: true }),
    ask("u7o-naomi", "wearing", { img: "k-naomi" }, "Naomi", "Is Naomi wearing a black skirt?", ["Yes, she is.", "No, she isn't.", "Yes, he is."]),
    ask("u7o-james", "wearing", { img: "k-james" }, "James", "Is James wearing a red hat?", ["No, he isn't.", "Yes, he is.", "No, she isn't."]),
    ask("u7o-david", "wearing", { img: "k-david" }, "David", "Is David wearing a blue and red sweater?", ["No, he isn't.", "Yes, he is.", "Yes, she is."], { challenge: true }),
    ask("u7o-oscar", "wearing", { img: "k-oscar" }, "Oscar", "Is Oscar wearing a blue cap?", ["No, he isn't.", "Yes, he is.", "No, I don't."]),
    ask("u7o-amy", "wearing", { img: "k-amy" }, "Amy", "Is Amy wearing a blue skirt and red socks?", ["Yes, she is.", "No, she isn't.", "Yes, he is."]),
    ask("u7o-hannah", "wearing", { img: "k-hannah" }, "Hannah", "Is Hannah wearing black trainers?", ["No, she isn't.", "Yes, she is.", "No, he isn't."], { challenge: true }),
    ask("u7o-tom", "wearing", { img: "tom" }, "Tom", "Is Tom riding a pony?", ["No, I think he's riding a bike.", "Yes, he is.", "No, she isn't."]),
    ask("u7o-cap-here", "story", { quote: "My cap isn't here." }, "Whisper says: My cap isn't here.", "What do his friends say?", ["Oh no!", "Thanks.", "It's OK."], { speakQ: "My cap isn't here. What do his friends say?" }),
    ask("u7o-sure", "story", { quote: "Look! Gary's wearing my cap." }, "Whisper says: Look! Gary's wearing my cap.", "What does his friend say?", ["Are you sure?", "Thanks.", "No problem."], { speakQ: "Look! Gary's wearing my cap. What does his friend say?" }),
    ask("u7o-stop", "story", { quote: "Stop!" }, "Someone says: Stop!", "Who says it?", ["Whisper.", "Gary.", "The bird."], { speakQ: "Stop! Who says it?" }),
    ask("u7o-noproblem", "story", { quote: "Get my cap, please." }, "Whisper says to the bird: Get my cap, please.", "What does the bird say?", ["No problem.", "Hey!", "I'm very sorry."], { speakQ: "Get my cap, please. What does the bird say?" }),
    ask("u7o-ok", "story", { quote: "I'm very sorry, Gary." }, "Whisper says: I'm very sorry, Gary.", "What does Gary say?", ["It's OK.", "Thanks.", "Oh no!"], { speakQ: "I'm very sorry, Gary. What does Gary say?" }),
    ask("u7o-value", "story", { img: "s-sorry" }, "Whisper gives the cap back", "You make a mistake. What do you say?", ["I'm sorry.", "No problem.", "Hey!"], { challenge: true }),
    ask("u7o-spiders", "phonics", { img: "spiders" }, "spiders on the stairs", "Where do the spiders stop?", ["On the stairs.", "On the bus.", "In the shop."]),
    ask("u7o-warm", "materials", { img: "m-woolhat" }, "a woolly hat", "Wool is …", ["warm.", "strong.", "cool."]),
    ask("u7o-strong", "materials", { img: "m-belt" }, "a leather belt", "Leather is …", ["strong.", "warm.", "cool."]),
    ask("u7o-cool", "materials", { img: "m-tshirt" }, "a cotton T-shirt", "Cotton is …", ["cool.", "strong.", "warm."]),
    ask("u7o-boots", "materials", { img: "m-boots" }, "red boots", "What are the boots made of?", ["Leather.", "Wool.", "Cotton."], { challenge: true })
  ];

  const HANGMAN = [
    spell("u7h-cap", "clothes", { img: "c-cap" }, "a cap", "cap"),
    spell("u7h-hat", "clothes", { img: "l-hat" }, "a hat", "hat"),
    spell("u7h-socks", "clothes", { img: "c-socks" }, "socks", "socks"),
    spell("u7h-shoes", "clothes", { img: "c-shoes" }, "shoes", "shoes"),
    spell("u7h-jeans", "clothes", { img: "c-jeans" }, "jeans", "jeans"),
    spell("u7h-shorts", "clothes", { img: "m-shorts" }, "shorts", "shorts"),
    spell("u7h-skirt", "clothes", { img: "k-amy" }, "a skirt", "skirt"),
    spell("u7h-jacket", "clothes", { img: "c-jacket" }, "a jacket", "jacket"),
    spell("u7h-sweater", "clothes", { img: "m-sweater" }, "a sweater", "sweater", { challenge: true }),
    spell("u7h-trousers", "clothes", { img: "c-trousers" }, "trousers", "trousers", { challenge: true }),
    spell("u7h-cat", "song", { img: "cat" }, "a cat", "cat"),
    spell("u7h-cool", "song", { img: "cat" }, "a cool cat", "cool"),
    spell("u7h-bird", "story", { img: "s-bird" }, "a bird", "bird"),
    spell("u7h-six", "phonics", { img: "spiders" }, "six", "six"),
    spell("u7h-stop", "phonics", { img: "spiders" }, "stop", "stop"),
    spell("u7h-stairs", "phonics", { img: "spiders" }, "stairs", "stairs", { challenge: true }),
    spell("u7h-spider", "phonics", { img: "spiders" }, "a spider", "spider"),
    spell("u7h-wool", "materials", { img: "m-sheep" }, "wool", "wool"),
    spell("u7h-sheep", "materials", { img: "m-sheep" }, "a sheep", "sheep"),
    spell("u7h-cow", "materials", { img: "m-cow" }, "a cow", "cow"),
    spell("u7h-warm", "materials", { img: "m-gloves" }, "warm", "warm"),
    spell("u7h-cotton", "materials", { img: "m-cotton" }, "cotton", "cotton", { challenge: true })
  ];

  const PLANES = [
    hear("u7p-tshirt", "clothes", "Put on your T-shirt.", ["c-tshirt", "c-jacket", "c-socks"], { pics: true, alts: ["T-shirt", "jacket", "socks"] }),
    hear("u7p-trousers", "clothes", "Put on your trousers.", ["c-trousers", "m-shorts", "c-jeans"], { pics: true, alts: ["trousers", "shorts", "jeans"], challenge: true }),
    hear("u7p-sweater", "clothes", "Put on your sweater.", ["m-sweater", "m-tshirt", "c-jacket"], { pics: true, alts: ["sweater", "T-shirt", "jacket"] }),
    hear("u7p-socks", "clothes", "Put on your socks.", ["c-socks", "c-shoes", "c-cap"], { pics: true, alts: ["socks", "shoes", "cap"] }),
    hear("u7p-shoes", "clothes", "Put on your shoes.", ["c-shoes", "c-redsocks", "c-trousers"], { pics: true, alts: ["shoes", "socks", "trousers"] }),
    hear("u7p-cap", "clothes", "Put on your cap.", ["c-greycap", "l-hat", "m-woolhat"], { pics: true, alts: ["cap", "hat", "woolly hat"], challenge: true }),
    hear("u7p-these", "like", "Do you like these shoes? No, I don't.", ["No, I don't.", "Yes, I do.", "No, it isn't."]),
    hear("u7p-this", "like", "Do you like this hat? Yes, I do.", ["Yes, I do.", "No, I don't.", "Yes, it is."]),
    hear("u7p-greenhat", "like", "Do you like this green hat?", ["l-greenhat", "l-hat", "c-cap"], { pics: true, alts: ["green hat", "white hat", "pink cap"] }),
    hear("u7p-cat", "song", "I'm a cool, cool cat. Meow, meow, meow!", ["I'm a cool, cool cat.", "I'm a cool, cool dog.", "I'm a super, super hat."]),
    hear("u7p-amy", "wearing", "She's wearing a blue skirt and red socks.", ["k-amy", "k-naomi", "k-hannah"], { pics: true, alts: ["Amy", "Naomi", "Hannah"], challenge: true }),
    hear("u7p-james", "wearing", "He's wearing a black cap.", ["k-james", "k-david", "k-oscar"], { pics: true, alts: ["James", "David", "Oscar"] }),
    hear("u7p-oscar", "wearing", "He's wearing a white hat.", ["k-oscar", "k-james", "k-david"], { pics: true, alts: ["Oscar", "James", "David"] }),
    hear("u7p-isnt", "wearing", "Is he wearing a red hat? No, he isn't.", ["No, he isn't.", "No, she isn't.", "Yes, he is."], { challenge: true }),
    hear("u7p-sorry", "story", "I'm very sorry, Gary.", ["I'm very sorry, Gary.", "Stop! That's my cap, Gary.", "Thanks, Gary."]),
    hear("u7p-noproblem", "story", "No problem.", ["No problem.", "Oh no!", "It's OK."]),
    hear("u7p-sure", "story", "Are you sure? Maybe Gary has got the same cap.", ["Maybe Gary has got the same cap.", "Gary's wearing my cap.", "My cap isn't here."], { challenge: true }),
    hear("u7p-spiders", "phonics", "Six spiders stop for sandwiches on the stairs.", ["Six spiders stop for sandwiches on the stairs.", "Six spiders sit for sandwiches on the stairs.", "Six spiders stop for sandwiches on the street."], { challenge: true }),
    hear("u7p-sheep", "materials", "Wool comes from sheep.", ["m-sheep", "m-cow", "m-cotton"], { pics: true, alts: ["a sheep", "a cow", "a cotton plant"] }),
    hear("u7p-cow", "materials", "Leather comes from cows.", ["m-cow", "m-sheep", "m-cotton"], { pics: true, alts: ["a cow", "a sheep", "a cotton plant"] }),
    hear("u7p-cotton", "materials", "Cotton comes from plants.", ["m-cotton", "m-sheep", "m-cow"], { pics: true, alts: ["a cotton plant", "a sheep", "a cow"] }),
    hear("u7p-leather", "materials", "You can wear leather shoes.", ["m-shoes", "m-socks", "m-tshirt"], { pics: true, alts: ["leather shoes", "woollen socks", "a cotton T-shirt"] })
  ];

  // Teacher explain page: a hint per topic to give before the answer.
  const HINTS = {
    clothes: "Say the chant: T-shirt, trousers, sweater, shoes, socks and cap. Do the clothes rap!",
    like: "One thing: this. More than one: these. Yes, I do. / No, I don't.",
    song: "Sing The cool cat: I'm a cool, cool cat. I like this super hat.",
    wearing: "Look at the picture first. A boy: Yes, he is. / No, he isn't. A girl: Yes, she is. / No, she isn't.",
    story: "Remember the story The cap. Whisper thinks Gary has his cap, but his cap is at home.",
    phonics: "Listen for sp and st: sp-iders, st-op, st-airs.",
    materials: "Cotton comes from plants and is cool. Leather comes from cows and is strong. Wool comes from sheep and is warm."
  };

  // Notes for single questions: a better hint, and why the answer is right.
  const NOTES = {
    "u7m-trousers": { hint: "Long or short?", why: "Long: trousers. Short: shorts." },
    "u7m-shorts": { hint: "Long or short?", why: "They're short, so they're shorts." },
    "u7m-redsocks": { why: "Socks: more than one, so They're red. These socks are red." },
    "u7m-greycap": { why: "One cap: It's grey. This cap is grey." },
    "u7m-l-boots": { hint: "One boot, or two boots?", why: "Two boots: these boots." },
    "u7m-l-trousers": { hint: "Trousers always take these.", why: "We say these trousers, like these jeans and these shorts." },
    "u7m-james": { hint: "Look at his head.", why: "James is wearing a black cap. It isn't red." },
    "u7m-chair": { hint: "Where is the cap now?", why: "His cap is at home under the chair. Gary's cap is Gary's." },
    "u7m-gloves": { hint: "Are they warm and soft?", why: "Woollen gloves keep your hands warm." },
    "u7m-m-socks": { hint: "Warm and soft?", why: "You can wear woollen socks. Wool is warm." },
    "u7o-this-these": { hint: "Shoes: one or two?", why: "Shoes are more than one, so these shoes." },
    "u7o-this-hat": { hint: "Hat: one or lots?", why: "One hat: this hat." },
    "u7o-cats-hats": { why: "We're cool cats, so we like these super hats." },
    "u7o-david": { hint: "Look at his sweater. What colour is it?", why: "David's sweater is green, so: No, he isn't." },
    "u7o-james": { why: "James is wearing a black cap: No, he isn't." },
    "u7o-oscar": { why: "Oscar is wearing a white hat: No, he isn't." },
    "u7o-hannah": { hint: "Look at her feet.", why: "Hannah is wearing green shoes, not black trainers: No, she isn't." },
    "u7o-tom": { why: "Tom is riding a bike: No, I think he's riding a bike." },
    "u7o-stop": { why: "Whisper says: Stop! That's my cap, Gary." },
    "u7o-value": { why: "The story teaches us to say sorry: I'm very sorry, Gary." },
    "u7o-boots": { why: "The boots are shiny and strong. They're leather." },
    "u7p-trousers": { hint: "Long or short? Jeans are blue.", why: "Put on your trousers: long, black trousers." },
    "u7p-cap": { hint: "A cap has a peak at the front.", why: "A cap, not a hat." },
    "u7p-amy": { hint: "Listen for the skirt and socks.", why: "Amy is wearing a blue skirt and red socks." },
    "u7p-isnt": { hint: "He or she? Is or isn't?", why: "A boy, and no: No, he isn't." },
    "u7p-sure": { why: "His friend says: Are you sure? Maybe Gary has got the same cap." },
    "u7p-spiders": { hint: "Listen: stop or sit? stairs or street?", why: "Six spiders stop for sandwiches on the stairs." }
  };

  return {
    id: "u7",
    number: 7,
    title: "Get dressed!",
    h1: "Do you like this hat?",
    lede: "Clothes, Do you like this / these …?, Is he / she wearing …?, the story The cap, and materials. Come to Word Island. Play, and practise.",
    topics: TOPICS,
    hints: HINTS,
    notes: NOTES,
    banks: { maze: MAZE, moles: MOLES, hangman: HANGMAN, planes: PLANES }
  };
})();
