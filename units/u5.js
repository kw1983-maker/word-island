// Word Island · Unit 5 (Super Minds pp. 58-69: Free time).
// Pictures live in img/u5/. The first choice of every question is the right one.
WORD_ISLAND_UNITS.u5 = (() => {
  const TOPICS = {
    days: "Days of the week",
    free: "Free time",
    when: "I … on Mondays.",
    doyou: "Do you …?",
    story: "We're lost!",
    phonics: "Phonics: short u",
    healthy: "I'm healthy!",
    piano: "The piano"
  };

  const MAZE = [
    look("u5m-d1", "days", { days: ["Monday", "Tuesday"] }, "Monday, Tuesday, and then", "What day comes next?", ["Wednesday", "Thursday", "Friday"], "Monday, Tuesday, Wednesday."),
    look("u5m-d2", "days", { days: ["Wednesday", "Thursday"] }, "Wednesday, Thursday, and then", "What day comes next?", ["Friday", "Saturday", "Tuesday"], "Wednesday, Thursday, Friday."),
    look("u5m-d3", "days", { days: ["Friday", "Saturday"] }, "Friday, Saturday, and then", "What day comes next?", ["Sunday", "Monday", "Thursday"], "Friday, Saturday, Sunday."),
    look("u5m-d4", "days", { days: ["Tuesday", "Wednesday"] }, "Tuesday, Wednesday, and then", "What day comes next?", ["Thursday", "Tuesday", "Friday"], "Tuesday, Wednesday, Thursday.", { challenge: true }),
    look("u5m-d5", "days", { days: ["Saturday", "Sunday"] }, "Saturday, Sunday, and then", "What day comes next?", ["Monday", "Friday", "Tuesday"], "Saturday, Sunday, Monday.", { challenge: true }),
    look("u5m-match", "days", { img: "match" }, "a football match", "When is the football match?", ["On Saturday.", "On Sunday.", "On Monday."], "The football match is on Saturday."),
    look("u5m-lake", "days", { img: "lake" }, "a lake", "When is the trip to the lake?", ["On Sunday.", "On Saturday.", "On Friday."], "The trip to the lake is on Sunday."),
    look("u5m-swim", "free", { img: "swim" }, "Children in the water", "What do they say?", ["We go swimming.", "We play football.", "We sing."], "We go swimming."),
    look("u5m-sing", "free", { img: "sing" }, "Children with songs", "What do they say?", ["We sing.", "We go swimming.", "We watch TV."], "We sing."),
    look("u5m-games", "free", { img: "games" }, "Children on a sofa", "What do they say?", ["We play computer games.", "We watch TV.", "We play football."], "We play computer games."),
    look("u5m-hide", "free", { img: "hideseek" }, "Children in a bush", "What do they say?", ["We play hide-and-seek.", "We play football.", "We sing."], "We play hide-and-seek."),
    look("u5m-friends", "free", { img: "friends" }, "Children with a ball", "What do they say?", ["We play with friends.", "We go swimming.", "We sleep."], "We play with friends."),
    look("u5m-bike", "free", { img: "bike" }, "A boy on a bike", "What does he say?", ["I ride my bike.", "I play with toys.", "I go swimming."], "I ride my bike."),
    look("u5m-toys", "free", { img: "toys" }, "A boy with a train", "What does he say?", ["I play with toys.", "I ride my bike.", "I watch TV."], "I play with toys."),
    look("u5m-swim2", "free", { img: "swim2" }, "A boy in the water", "What does he say?", ["I go swimming.", "I ride my bike.", "I sleep."], "I go swimming."),
    look("u5m-sleep", "free", { img: "sleep" }, "A boy on a sofa", "What does he say?", ["I watch TV and sleep.", "I go swimming.", "I play with friends."], "I watch TV and sleep."),
    look("u5m-games2", "free", { img: "games2" }, "A boy with a game", "What does he say?", ["I play computer games.", "I play with toys.", "I watch TV."], "I play computer games.", { challenge: true }),
    look("u5m-rabbit", "story", { img: "rabbit" }, "The Super Friends and a rabbit", "Who helps the Super Friends?", ["a rabbit", "a cat", "a duck"], "A rabbit helps them."),
    look("u5m-where", "story", { img: "lake" }, "a lake", "Where do the Super Friends want to go?", ["to the lake", "to school", "to the football match"], "They want to go to the lake."),
    look("u5m-duck", "phonics", { img: "duck" }, "a duck", "What's this?", ["a duck", "a rabbit", "a cat"], "It's a duck."),
    look("u5m-mud", "phonics", { img: "mud" }, "Mum and the ducks", "Where does Mum jump?", ["in the mud", "in the lake", "on the bike"], "Mum jumps in the mud with the ducks."),
    look("u5m-mum", "phonics", { img: "mum" }, "Mum", "What does Mum do?", ["She jumps.", "She sleeps.", "She sings."], "Mum jumps in the mud."),
    look("u5m-h-fruit", "healthy", { img: "h-fruit" }, "A girl eating fruit", "Healthy or unhealthy?", ["healthy", "unhealthy"], "It's healthy."),
    look("u5m-h-sport", "healthy", { img: "h-sport" }, "A girl playing badminton", "Healthy or unhealthy?", ["healthy", "unhealthy"], "It's healthy."),
    look("u5m-h-sleep", "healthy", { img: "h-sleep" }, "A girl sleeping at eight o'clock", "Healthy or unhealthy?", ["healthy", "unhealthy"], "It's healthy."),
    look("u5m-h-sweets", "healthy", { img: "h-sweets" }, "A boy eating ice cream and sweets", "Healthy or unhealthy?", ["unhealthy", "healthy"], "It's unhealthy."),
    look("u5m-h-tv", "healthy", { img: "h-tvnight" }, "A boy watching TV at night", "Healthy or unhealthy?", ["unhealthy", "healthy"], "It's unhealthy."),
    look("u5m-h-late", "healthy", { img: "h-late" }, "A boy awake at twelve o'clock", "Healthy or unhealthy?", ["unhealthy", "healthy"], "It's unhealthy. Sleep!", { challenge: true }),
    look("u5m-p-ears", "piano", { img: "p-ears" }, "A girl", "What does the teacher say?", ["Oh no! Cover your ears.", "Open the piano.", "Sit down at the piano."], "Oh no! Cover your ears."),
    look("u5m-p-cat", "piano", { img: "p-cat" }, "A girl and a piano", "What does the teacher say?", ["Look! Your cat is in the piano.", "Put it on the floor.", "Start playing the piano."], "Look! Your cat is in the piano."),
    look("u5m-p-open", "piano", { img: "p-open" }, "A girl and a piano", "What does the teacher say?", ["Open the piano.", "Sit down at the piano.", "Put it on the floor."], "Open the piano."),
    look("u5m-p-play", "piano", { img: "p-play" }, "A girl at a piano", "What does the teacher say?", ["Start playing the piano.", "Sit down at the piano.", "Cover your ears."], "Start playing the piano."),
    look("u5m-p-floor", "piano", { img: "p-floor" }, "A girl and a cat", "What does the teacher say?", ["Put it on the floor.", "Open the piano.", "Cover your ears."], "Put it on the floor.", { challenge: true }),
    look("u5m-p-sit", "piano", { img: "p-sit" }, "A girl at a piano", "What does the teacher say?", ["Sit down at the piano.", "Start playing the piano.", "Open the piano."], "Sit down at the piano.", { challenge: true })
  ];

  const MOLES = [
    ask("u5o-after", "days", { cal: "SUN" }, "Sunday", "What day comes after Sunday?", ["Monday.", "Saturday.", "Friday."]),
    ask("u5o-before", "days", { cal: "FRI" }, "Friday", "What day comes before Friday?", ["Thursday.", "Saturday.", "Tuesday."]),
    ask("u5o-school", "days", { cal: "MON" }, "Monday", "Do you go to school on Mondays?", ["Yes, I do.", "No, I don't.", "It's Monday."]),
    ask("u5o-sunday", "days", { cal: "SUN" }, "Sunday", "Do you go to school on Sundays?", ["No, I don't.", "Yes, I do.", "It's Sunday."]),
    ask("u5o-tv-yes", "doyou", { img: "tv-yes" }, "A girl watching TV", "Do you watch TV at the weekend?", ["Yes, I do.", "No, I don't.", "I watch TV."]),
    ask("u5o-tv-no", "doyou", { img: "tv-no" }, "A girl with a book, not the TV", "Do you watch TV at the weekend?", ["No, I don't.", "Yes, I do.", "I don't know."]),
    ask("u5o-games-yes", "doyou", { img: "games-yes" }, "A girl at a computer", "Do you play computer games at the weekend?", ["Yes, I do.", "No, I don't.", "I play football."]),
    ask("u5o-games-no", "doyou", { img: "games-no" }, "A girl with a ball, not the computer", "Do you play computer games at the weekend?", ["No, I don't.", "Yes, I do.", "I play computer games."]),
    ask("u5o-mon", "when", { img: "swim2" }, "A boy in the water", "What do you do on Mondays?", ["I go swimming on Mondays.", "I go swimming on Fridays.", "I ride my bike on Mondays."]),
    ask("u5o-sat", "when", { img: "match" }, "a football match", "What do you do on Saturdays?", ["I play football on Saturdays.", "I play football on Sundays.", "I go swimming on Saturdays."]),
    ask("u5o-sing", "when", { img: "sing" }, "Children with songs", "What do you do on Saturdays?", ["We sing on Saturdays.", "We sing on Mondays.", "We play football on Saturdays."]),
    ask("u5o-sun", "when", { img: "hideseek" }, "Children in a bush", "What do you do on Sundays?", ["We play hide-and-seek on Sundays.", "We play football on Sundays.", "We sing on Sundays."]),
    ask("u5o-tue", "when", { img: "bike" }, "A boy on a bike", "What do you do on Tuesdays?", ["I ride my bike on Tuesdays.", "I ride my bike on Thursdays.", "I play with toys on Tuesdays."], { challenge: true }),
    ask("u5o-hours", "when", { img: "h-sport" }, "A girl playing badminton", "How many hours a week do you do sport?", ["I do sport four hours a week.", "Yes, I do.", "On Mondays."], { challenge: true }),
    ask("u5o-lake", "story", { quote: "Where's the lake?" }, "Someone says: Where's the lake?", "What's the answer?", ["I don't know.", "Here you are.", "Yes, I do."], { speakQ: "Where's the lake?" }),
    ask("u5o-idea", "story", { quote: "I've got an idea." }, "Someone says: I've got an idea.", "What's the answer?", ["What?", "Thank you very much.", "Watch out!"], { speakQ: "I've got an idea." }),
    ask("u5o-come", "story", { quote: "Rabbit, we're lost. Where's the lake?" }, "Someone says: Rabbit, we're lost. Where's the lake?", "What does the rabbit say?", ["Come with me.", "I'm four.", "No, I don't."], { speakQ: "Rabbit, we're lost. Where's the lake? What does the rabbit say?" }),
    ask("u5o-fun", "story", { quote: "This isn't much fun." }, "Someone says: This isn't much fun.", "Who says it?", ["Thunder.", "Whisper.", "The rabbit."], { speakQ: "This isn't much fun. Who says it?" }),
    ask("u5o-talk", "story", { img: "rabbit" }, "The Super Friends and a rabbit", "Who talks to the rabbit?", ["Whisper.", "Thunder.", "Misty."]),
    ask("u5o-lost", "story", { quote: "Now, I'm lost." }, "Someone says: Now, I'm lost.", "Who says it?", ["The rabbit.", "Whisper.", "Flash."], { speakQ: "Now, I'm lost. Who says it?", challenge: true }),
    ask("u5o-mud", "phonics", { img: "mud" }, "Mum and the ducks", "Who jumps in the mud?", ["Mum.", "The rabbit.", "Thunder."]),
    ask("u5o-fun2", "healthy", { img: "friends" }, "Children with a ball", "How do you have fun?", ["I play with my friends.", "I sleep.", "Yes, I do."]),
    ask("u5o-fit", "healthy", { img: "h-sport" }, "A girl playing badminton", "How do you keep fit?", ["I do sport.", "I watch TV.", "I eat sweets."]),
    ask("u5o-food", "healthy", { img: "h-fruit" }, "A girl eating fruit", "What is important for a healthy life?", ["Eat healthy food.", "Watch TV at night.", "Eat sweets."]),
    ask("u5o-sweets", "healthy", { img: "h-sweets" }, "A boy eating ice cream and sweets", "Is it healthy?", ["No, it isn't.", "Yes, it is.", "I do sport."])
  ];

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const HANGMAN = [
    ...DAYS.map((day) => spell(`u5h-${day.toLowerCase()}`, "days", { cal: day.slice(0, 3).toUpperCase() }, day, day,
      day === "Wednesday" || day === "Thursday" ? { challenge: true } : {})),
    spell("u5h-swimming", "free", { img: "swim2" }, "A boy in the water", "swimming", { challenge: true }),
    spell("u5h-football", "free", { img: "match" }, "a football match", "football"),
    spell("u5h-sing", "free", { img: "sing" }, "Children with songs", "sing"),
    spell("u5h-bike", "free", { img: "bike" }, "a bike", "bike"),
    spell("u5h-toys", "free", { img: "toys" }, "toys", "toys"),
    spell("u5h-sleep", "free", { img: "sleep" }, "A boy sleeping", "sleep"),
    spell("u5h-tv", "free", { img: "tv-yes" }, "a TV", "TV"),
    spell("u5h-piano", "piano", { img: "p-play" }, "a piano", "piano"),
    spell("u5h-lake", "story", { img: "lake" }, "a lake", "lake"),
    spell("u5h-rabbit", "story", { img: "rabbit" }, "a rabbit", "rabbit"),
    spell("u5h-duck", "phonics", { img: "duck" }, "a duck", "duck"),
    spell("u5h-mud", "phonics", { img: "mud" }, "mud", "mud"),
    spell("u5h-mum", "phonics", { img: "mum" }, "Mum", "Mum")
  ];

  const PLANES = [
    hear("u5p-mon", "days", "Monday", ["Monday", "Sunday", "Friday"]),
    hear("u5p-wed", "days", "Wednesday", ["Wednesday", "Monday", "Friday"]),
    hear("u5p-fri", "days", "Friday", ["Friday", "Thursday", "Sunday"]),
    hear("u5p-sun", "days", "Sunday", ["Sunday", "Saturday", "Monday"]),
    hear("u5p-tue", "days", "Tuesday", ["Tuesday", "Thursday", "Wednesday"], { challenge: true }),
    hear("u5p-thu", "days", "Thursday", ["Thursday", "Tuesday", "Saturday"], { challenge: true }),
    hear("u5p-swim", "free", "I go swimming.", ["swim2", "bike", "toys"], { pics: true, alts: ["go swimming", "ride a bike", "play with toys"] }),
    hear("u5p-bike", "free", "I ride my bike.", ["bike", "swim2", "sleep"], { pics: true, alts: ["ride a bike", "go swimming", "sleep"] }),
    hear("u5p-games", "free", "We play computer games.", ["games", "sing", "hideseek"], { pics: true, alts: ["play computer games", "sing", "play hide-and-seek"] }),
    hear("u5p-sing", "free", "We sing.", ["sing", "games", "swim"], { pics: true, alts: ["sing", "play computer games", "go swimming"] }),
    hear("u5p-toys", "free", "I play with toys.", ["toys", "bike", "games2"], { pics: true, alts: ["play with toys", "ride a bike", "play computer games"] }),
    hear("u5p-sleep", "free", "I watch TV and sleep.", ["sleep", "toys", "swim2"], { pics: true, alts: ["watch TV and sleep", "play with toys", "go swimming"] }),
    hear("u5p-tv-no", "doyou", "Do you watch TV at the weekend? No, I don't.", ["tv-no", "tv-yes", "games-yes"], { pics: true, alts: ["No, I don't watch TV.", "Yes, I watch TV.", "Yes, I play computer games."], challenge: true }),
    hear("u5p-games-yes", "doyou", "Do you play computer games at the weekend? Yes, I do.", ["games-yes", "games-no", "tv-no"], { pics: true, alts: ["Yes, I play computer games.", "No, I don't play computer games.", "No, I don't watch TV."] }),
    hear("u5p-food", "healthy", "Eat healthy food.", ["h-fruit", "h-sweets", "h-tvnight"], { pics: true, alts: ["eat fruit", "eat sweets", "watch TV at night"] }),
    hear("u5p-sleep2", "healthy", "Sleep.", ["h-sleep", "h-late", "h-tvnight"], { pics: true, alts: ["sleep at eight o'clock", "awake at twelve o'clock", "watch TV at night"], challenge: true }),
    hear("u5p-open", "piano", "Open the piano.", ["p-open", "p-sit", "p-play"], { pics: true, alts: ["Open the piano.", "Sit down at the piano.", "Start playing the piano."] }),
    hear("u5p-ears", "piano", "Oh no! Cover your ears.", ["p-ears", "p-cat", "p-floor"], { pics: true, alts: ["Cover your ears.", "Your cat is in the piano.", "Put it on the floor."] }),
    hear("u5p-floor", "piano", "Put it on the floor.", ["p-floor", "p-cat", "p-open"], { pics: true, alts: ["Put it on the floor.", "Your cat is in the piano.", "Open the piano."], challenge: true }),
    hear("u5p-sit", "piano", "Sit down at the piano.", ["p-sit", "p-play", "p-open"], { pics: true, alts: ["Sit down at the piano.", "Start playing the piano.", "Open the piano."], challenge: true }),
    hear("u5p-lost", "story", "We're lost!", ["We're lost!", "Watch out!", "Yippee!"]),
    hear("u5p-thanks", "story", "Thank you very much.", ["Thank you very much.", "Come with me.", "Here you are."]),
    hear("u5p-mud", "phonics", "Mum jumps in the mud with the ducks.", ["Mum jumps in the mud with the ducks.", "Mum runs in the mud with the ducks.", "Mum jumps in the lake with the ducks."], { challenge: true })
  ];

  // Teacher explain page: a hint per topic to give before the answer.
  const HINTS = {
    days: "Say the days in order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.",
    free: "What are they doing in the picture? Swimming, football, singing …?",
    when: "Two things: what do you do, and on which day?",
    doyou: "Is she doing it? Then Yes, I do. Is she not doing it? Then No, I don't.",
    story: "Remember the story We're lost! A rabbit helps the Super Friends find the lake.",
    phonics: "Listen for the short u sound: m-u-d, d-u-ck, M-u-m.",
    healthy: "Is it good for your body? Fruit, sport and sleep are healthy.",
    piano: "Look at her hands and the arrows. What is she doing with the piano?"
  };

  // Notes for single questions: a better hint, and why the answer is right.
  const NOTES = {
    "u5m-d4": { why: "After Wednesday comes Thursday. Tuesday and Thursday sound alike at the start: t and th." },
    "u5m-d5": { hint: "After the weekend, what day is it?", why: "After Sunday the week starts again: Monday." },
    "u5m-match": { hint: "Remember the board on page 58.", why: "The board says Saturday: football match." },
    "u5m-lake": { hint: "Remember the board on page 58.", why: "The board says Sunday: trip to the lake." },
    "u5m-games2": { hint: "Look at his hands. Is it a toy or a game?", why: "He is holding a computer game: I play computer games." },
    "u5m-sleep": { why: "He is on the sofa next to the TV: I watch TV and sleep." },
    "u5m-rabbit": { why: "The rabbit shows them the way: Come with me." },
    "u5m-mum": { why: "Mum jumps in the mud with the ducks." },
    "u5m-h-sleep": { hint: "Look at the clock.", why: "Eight o'clock is a good time to sleep. Sleep is healthy." },
    "u5m-h-sweets": { why: "Ice cream and sweets every day are not healthy." },
    "u5m-h-tv": { hint: "Look at the moon. Is it day or night?", why: "Watching TV late at night is not healthy." },
    "u5m-h-late": { hint: "Look at the clock. Is it late?", why: "Twelve o'clock at night is very late. We need sleep to be healthy." },
    "u5m-p-ears": { why: "The music is too loud: Oh no! Cover your ears." },
    "u5m-p-cat": { why: "There is a cat inside the piano: Look! Your cat is in the piano." },
    "u5m-p-floor": { hint: "Look at the arrow and the cat.", why: "She puts the cat down: Put it on the floor." },
    "u5m-p-sit": { hint: "Is she sitting down, or playing?", why: "Her hands are not on the keys yet: Sit down at the piano." },
    "u5m-p-play": { why: "Music comes out of the piano: Start playing the piano." },
    "u5o-sunday": { why: "There is no school on Sunday: No, I don't." },
    "u5o-tv-no": { hint: "Is she watching TV, or walking away with a book?", why: "She doesn't watch TV, so she says: No, I don't." },
    "u5o-games-no": { hint: "Is she at the computer?", why: "She plays football, not computer games: No, I don't." },
    "u5o-mon": { hint: "Check the day in the answer: Mondays or Fridays?", why: "The question asks about Mondays: I go swimming on Mondays." },
    "u5o-tue": { hint: "Tuesdays or Thursdays? Read the question again.", why: "The question says Tuesdays: I ride my bike on Tuesdays." },
    "u5o-hours": { hint: "The question asks how many hours.", why: "We answer with a number of hours: I do sport four hours a week." },
    "u5o-lake": { why: "Nobody knows where the lake is: I don't know. We're lost." },
    "u5o-idea": { why: "Whisper has an idea. The others ask: What?" },
    "u5o-come": { why: "The rabbit helps them: Come with me." },
    "u5o-fun": { hint: "Who is not happy in the forest?", why: "Thunder says: This isn't much fun." },
    "u5o-talk": { hint: "Who can talk to animals?", why: "Whisper can talk to animals, so he talks to the rabbit." },
    "u5o-lost": { hint: "Who is lost at the end of the story?", why: "The rabbit says: Now, I'm lost. Whisper says: Now, he's lost!" },
    "u5o-mud": { why: "Mum jumps in the mud with the ducks." },
    "u5p-tue": { hint: "Listen to the start: t or th?", why: "Tuesday starts with t. Thursday starts with th." },
    "u5p-thu": { hint: "Listen to the start: t or th?", why: "Thursday starts with th. Tuesday starts with t." },
    "u5p-tv-no": { hint: "Listen to the end: Yes, I do or No, I don't?", why: "No, I don't: she does not watch TV." },
    "u5p-sleep2": { hint: "Healthy sleep is early, not late.", why: "Sleep at eight o'clock is healthy." },
    "u5p-floor": { hint: "Where does the cat go?", why: "Put it on the floor: she puts the cat down." },
    "u5p-sit": { hint: "Sit down or start playing?", why: "Sit down at the piano: she sits, but does not play yet." },
    "u5p-mud": { hint: "Listen: jumps or runs? mud or lake?", why: "Mum jumps in the mud with the ducks." }
  };

  return {
    id: "u5",
    number: 5,
    title: "Free time",
    h1: "What do you do on Mondays?",
    lede: "Days of the week, free time, Do you …?, the story We're lost!, and healthy habits. Come to Word Island. Play, and practise.",
    topics: TOPICS,
    hints: HINTS,
    notes: NOTES,
    banks: { maze: MAZE, moles: MOLES, hangman: HANGMAN, planes: PLANES }
  };
})();
