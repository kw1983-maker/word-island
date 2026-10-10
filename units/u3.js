// Word Island · Unit 3 (Super Minds pp. 34-45: Pet show).
// Pictures live in img/u3/. The first choice of every question is the right one.
WORD_ISLAND_UNITS.u3 = (() => {
  const TOPICS = {
    pets: "Pets",
    chant: "Pet show chant",
    where: "In, on, under",
    song: "Look at the animals",
    like: "I like / I don't like …",
    story: "The spider",
    phonics: "Phonics: short i",
    camouflage: "Camouflage"
  };

  const MAZE = [
    look("u3m-lizard", "pets", { img: "q-lizard" }, "a lizard on a rock", "This is …", ["a lizard", "a frog", "a spider"], "This is a lizard."),
    look("u3m-spider", "pets", { img: "spider" }, "a big spider on a hand", "This is …", ["a spider", "a rat", "a lizard"], "This is a spider."),
    look("u3m-rat", "pets", { img: "rat-on-book" }, "a rat on a book", "What animal is it?", ["a rat", "a cat", "a dog"], "It's a rat."),
    look("u3m-frog", "pets", { img: "frog-in-bag" }, "a frog in a bag", "What animal is it?", ["a frog", "a lizard", "a duck"], "It's a frog."),
    look("u3m-cat", "pets", { img: "cat-on-book" }, "a cat on a book", "What animal is it?", ["a cat", "a dog", "a rat"], "It's a cat."),
    look("u3m-elephants", "pets", { img: "s-elephants" }, "two elephants", "What animals are they?", ["elephants", "ducks", "dogs"], "They're elephants."),
    look("u3m-ducks", "pets", { img: "s-ducks" }, "ducks on books", "What animals are they?", ["ducks", "frogs", "cats"], "They're ducks."),
    look("u3m-dogs", "pets", { img: "s-dogs" }, "dogs on a table", "What animals are they?", ["dogs", "cats", "rats"], "They're dogs."),
    look("u3m-lizard-on", "where", { img: "lizard-on-bag" }, "a lizard on top of a bag", "Where's the lizard?", ["on the bag", "in the bag", "under the bag"], "The lizard is on the bag."),
    look("u3m-rat-under", "where", { img: "rat-under-desk" }, "a rat below a desk", "Where's the rat?", ["under the desk", "on the desk", "in the desk"], "The rat is under the desk."),
    look("u3m-rat-on", "where", { img: "rat-on-book" }, "a rat on top of a book", "Where's the rat?", ["on the book", "under the book", "in the book"], "The rat is on the book."),
    look("u3m-spider-in", "where", { img: "spider-in-case" }, "a spider inside a pencil case", "Where's the spider?", ["in the pencil case", "on the pencil case", "under the pencil case"], "The spider is in the pencil case.", { challenge: true }),
    look("u3m-spider-under", "where", { img: "spider-under-book" }, "a spider below a book", "Where's the spider?", ["under the book", "on the book", "in the book"], "The spider is under the book.", { challenge: true }),
    look("u3m-frog-on", "where", { img: "frog-on-bag" }, "a frog on top of a bag", "Where's the frog?", ["on the bag", "in the bag", "under the bag"], "The frog is on the bag."),
    look("u3m-frog-under", "where", { img: "frog-under-case" }, "a frog below a pencil case", "Where's the frog?", ["under the pencil case", "in the pencil case", "on the pencil case"], "The frog is under the pencil case."),
    look("u3m-frog-in", "where", { img: "frog-in-bag" }, "a frog inside a bag", "Where's the frog?", ["in the bag", "on the bag", "under the bag"], "The frog is in the bag."),
    look("u3m-cat-under", "where", { img: "cat-under-desk" }, "a cat sleeping below a desk", "Where's the cat?", ["under the desk", "on the desk", "in the desk"], "The cat is under the desk."),
    look("u3m-dog-tree", "where", { img: "dog-tree" }, "a little dog in the snow by a tree", "Where's the little dog?", ["under a tree", "on a tree", "in a bag"], "There's a little dog under a tree."),
    look("u3m-dog-hug", "pets", { img: "dog-hug" }, "a boy hugs a little dog", "What does the boy do?", ["Hug the little dog.", "Open the door.", "Catch the frog."], "He's cold. Pick him up. Hug the little dog."),
    look("u3m-cat-bag", "where", { img: "q-cat-bag" }, "a cat inside a blue bag", "The cat is ___ the bag.", ["in", "on", "under"], "The cat is in the bag.", { challenge: true }),
    look("u3m-s-spiders", "song", { img: "s-spiders" }, "spiders on a red pencil case", "Where are the spiders?", ["on the pencil case", "under the pencil case", "in the bag"], "Six spiders are on the pencil case."),
    look("u3m-s-cats", "song", { img: "s-cats" }, "cats below a table", "Where are the cats?", ["under the table", "on the table", "in the box"], "The cats are under the table."),
    look("u3m-s-lizards", "song", { img: "s-lizards" }, "lizards in a green bag", "Where are the lizards?", ["in the bag", "on the bag", "under the bag"], "The lizards are in the bag."),
    look("u3m-s-frogs", "song", { img: "s-frogs" }, "frogs below a chair", "Where are the frogs?", ["under the chair", "on the chair", "in the chair"], "The frogs are under the chair.", { challenge: true }),
    look("u3m-likecats", "like", { img: "like-cats" }, "a girl with two cats", "What does the girl say?", ["I like cats.", "I don't like cats.", "I like spiders."], "I like cats."),
    look("u3m-likespiders", "like", { img: "like-spiders" }, "a girl runs from a spider", "What does the girl say?", ["I don't like spiders.", "I like spiders.", "I like cats."], "I don't like spiders.", { challenge: true }),
    look("u3m-come", "story", { img: "st-come" }, "Whisper with a spider", "What does Whisper say?", ["Come back, he's beautiful. Look!", "Oh no. I don't like spiders.", "They're great."], "Come back, he's beautiful. Look!"),
    look("u3m-under", "story", { img: "st-under" }, "the spider runs below the table", "Where's the spider?", ["under the table", "on the table", "in the tree"], "Look, he's under the table."),
    look("u3m-clever", "story", { img: "st-clever" }, "the spider and its web", "What do the friends say?", ["He's clever.", "Oh no!", "Touch him, Misty."], "He's clever. He's amazing!"),
    look("u3m-tree", "story", { img: "st-tree" }, "the spider talks to Whisper", "What does the spider say?", ["My brothers and sisters are in the tree!", "I like spiders.", "Come back!"], "My brothers and sisters are in the tree!", { challenge: true }),
    look("u3m-ohno", "story", { img: "st-ohno" }, "lots of spiders come from the tree", "What do the friends say?", ["Oh no!", "They're great.", "He's clever."], "Oh no! Aagh!"),
    look("u3m-timkim", "phonics", { img: "timkim" }, "two spiders", "This is Tim and his silly sister …", ["Kim", "Jim", "Sam"], "This is Tim and his silly sister Kim."),
    look("u3m-snake", "camouflage", { img: "snake" }, "a green and black snake", "What animal is it?", ["a snake", "a lizard", "a crocodile"], "It's a snake. The snake is green and black."),
    look("u3m-crocodile", "camouflage", { img: "crocodile" }, "a crocodile", "What animal is it?", ["a crocodile", "a snake", "a lizard"], "It's a crocodile."),
    look("u3m-butterfly", "camouflage", { img: "butterfly" }, "a butterfly", "What animal is it?", ["a butterfly", "a bird", "a spider"], "It's a butterfly."),
    look("u3m-tiger", "camouflage", { img: "tiger" }, "a tiger", "What animal is it?", ["a tiger", "a cat", "a giraffe"], "It's a tiger."),
    look("u3m-giraffe", "camouflage", { img: "giraffe" }, "a giraffe", "What animal is it?", ["a giraffe", "an elephant", "a tiger"], "It's a giraffe."),
    look("u3m-cam-croc", "camouflage", { img: "cam-croc" }, "eyes in green water", "What animal is in picture 1?", ["a crocodile", "a frog", "a spider"], "There's a crocodile. The crocodile is green and the water is green.", { challenge: true }),
    look("u3m-cam-spider", "camouflage", { img: "cam-spider" }, "a white animal with eight legs on sand", "What animal is it?", ["a spider", "a frog", "a crocodile"], "There's a spider. The spider is white and the sand is white."),
    look("u3m-cam-frog", "camouflage", { img: "cam-frog" }, "a brown animal on a brown leaf", "What animal is it?", ["a frog", "a spider", "a lizard"], "There's a frog. The frog is brown and the leaf is brown.", { challenge: true }),
    look("u3m-log", "camouflage", { img: "q-log" }, "a log", "This is …", ["a log", "a leaf", "grass"], "This is a log.")
  ];

  const MOLES = [
    ask("u3o-whisper", "chant", { img: "spider" }, "a spider", "Whisper and his …", ["spider.", "dog.", "rat."]),
    ask("u3o-daisy", "chant", { quote: "Daisy and her …" }, "The chant: Daisy and her …", "Finish the chant.", ["dog.", "cat.", "duck."], { speakQ: "Daisy and her … Finish the chant." }),
    ask("u3o-lenny", "chant", { quote: "Lenny and his …" }, "The chant: Lenny and his …", "Finish the chant.", ["lizard.", "frog.", "elephant."], { speakQ: "Lenny and his … Finish the chant." }),
    ask("u3o-donnie", "chant", { quote: "Donnie and his …" }, "The chant: Donnie and his …", "Finish the chant.", ["duck.", "dog.", "spider."], { speakQ: "Donnie and his … Finish the chant." }),
    ask("u3o-thunder", "chant", { quote: "Thunder and his …" }, "The chant: Thunder and his …", "Finish the chant.", ["elephant.", "lizard.", "cat."], { speakQ: "Thunder and his … Finish the chant.", challenge: true }),
    ask("u3o-misty", "chant", { quote: "Misty and her …" }, "The chant: Misty and her …", "Finish the chant.", ["rat.", "frog.", "dog."], { speakQ: "Misty and her … Finish the chant.", challenge: true }),
    ask("u3o-lizard", "where", { img: "lizard-on-bag" }, "a lizard on a bag", "Where's the lizard?", ["It's on the bag.", "It's in the bag.", "It's under the bag."]),
    ask("u3o-rat", "where", { img: "rat-under-desk" }, "a rat under a desk", "Where's the rat?", ["It's under the desk.", "It's on the desk.", "It's in the desk."]),
    ask("u3o-frog", "where", { img: "frog-in-bag" }, "a frog in a bag", "Where's the frog?", ["It's in the bag.", "It's on the bag.", "It's under the bag."]),
    ask("u3o-spider", "where", { img: "spider-under-book" }, "a spider under a book", "Where's the spider?", ["It's under the book.", "It's on the book.", "It's in the book."], { challenge: true }),
    ask("u3o-dogs", "song", { img: "s-dogs" }, "dogs on a table", "Where are the dogs?", ["On the table.", "Under the table.", "In the box."]),
    ask("u3o-ducks", "song", { img: "s-ducks" }, "ducks on books", "Where are the ducks?", ["On the books.", "Under the chair.", "In the bag."]),
    ask("u3o-elephants", "song", { img: "s-elephants" }, "elephants on a ruler", "Where are the elephants?", ["On the ruler.", "Under the ruler.", "In the bag."], { challenge: true }),
    ask("u3o-too", "like", { quote: "I like dogs." }, "Your friend says: I like dogs. You like dogs too.", "What do you say?", ["I like dogs too.", "I don't like dogs.", "I like dog."], { speakQ: "I like dogs. You like dogs too. What do you say?" }),
    ask("u3o-dont", "like", { quote: "I like dogs." }, "Your friend says: I like dogs. You don't like dogs.", "What do you say?", ["I don't like dogs.", "I like dogs too.", "I not like dogs."], { speakQ: "I like dogs. You don't like dogs. What do you say?", challenge: true }),
    ask("u3o-boy", "like", { img: "like-cats" }, "a boy behind a tree, away from the cats", "What does the boy say?", ["I don't like cats.", "I like cats.", "I like cats too."]),
    ask("u3o-pet", "story", { img: "st-come" }, "Whisper with a spider", "Whisper's pet is …", ["a spider.", "a rat.", "a frog."]),
    ask("u3o-touch", "story", { quote: "Touch him, Misty." }, "Someone says: Touch him, Misty.", "Who says it?", ["Whisper.", "Misty.", "Thunder."], { speakQ: "Touch him, Misty. Who says it?" }),
    ask("u3o-misty-likes", "story", { img: "st-great" }, "Misty and her friends with the spider", "What does Misty say?", ["I like spiders.", "I don't like spiders.", "Oh no!"]),
    ask("u3o-idea", "story", { quote: "They like spiders! I've got an idea." }, "The spider says: They like spiders! I've got an idea.", "What does Whisper say?", ["What?", "Thanks.", "Come back!"], { speakQ: "They like spiders! I've got an idea. What does Whisper say?", challenge: true }),
    ask("u3o-brave", "story", { img: "st-great" }, "the friends look at the spider", "Misty touches the spider. She is …", ["brave.", "silly.", "cold."], { challenge: true }),
    ask("u3o-tim", "phonics", { quote: "Tim · him · spider" }, "The words Tim, him, spider", "Which word has a different sound?", ["spider", "Tim", "him"], { speakQ: "Tim, him, spider. Which word has a different sound?", challenge: true }),
    ask("u3o-croc", "camouflage", { img: "cam-croc" }, "a crocodile in green water", "Why is it difficult to see the crocodile?", ["The crocodile is green and the water is green.", "The crocodile is big.", "The crocodile is under the table."]),
    ask("u3o-tigers", "camouflage", { img: "grass" }, "tall grass", "Where do tigers hide?", ["In tall grass.", "In the water.", "Under the desk."]),
    ask("u3o-tiger-colour", "camouflage", { img: "tiger" }, "a tiger", "Tigers are …", ["orange, white and black.", "red, yellow and brown.", "green and black."])
  ];

  const HANGMAN = [
    spell("u3h-cat", "pets", { img: "cat-on-book" }, "a cat", "cat"),
    spell("u3h-dog", "pets", { img: "s-dogs" }, "a dog", "dog"),
    spell("u3h-rat", "pets", { img: "rat-on-book" }, "a rat", "rat"),
    spell("u3h-frog", "pets", { img: "frog-in-bag" }, "a frog", "frog"),
    spell("u3h-duck", "pets", { img: "s-ducks" }, "a duck", "duck"),
    spell("u3h-lizard", "pets", { img: "q-lizard" }, "a lizard", "lizard"),
    spell("u3h-spider", "pets", { img: "spider" }, "a spider", "spider"),
    spell("u3h-elephant", "pets", { img: "s-elephants" }, "an elephant", "elephant", { challenge: true }),
    spell("u3h-on", "where", { img: "frog-on-bag" }, "a frog on a bag", "on"),
    spell("u3h-in", "where", { img: "frog-in-bag" }, "a frog in a bag", "in"),
    spell("u3h-under", "where", { img: "cat-under-desk" }, "a cat under a desk", "under", { challenge: true }),
    spell("u3h-tree", "story", { img: "st-tree" }, "a tree", "tree"),
    spell("u3h-table", "story", { img: "st-under" }, "a table", "table"),
    spell("u3h-kim", "phonics", { img: "timkim" }, "Kim", "Kim"),
    spell("u3h-tim", "phonics", { img: "timkim" }, "Tim", "Tim"),
    spell("u3h-silly", "phonics", { img: "timkim" }, "silly", "silly"),
    spell("u3h-snake", "camouflage", { img: "snake" }, "a snake", "snake"),
    spell("u3h-tiger", "camouflage", { img: "tiger" }, "a tiger", "tiger"),
    spell("u3h-log", "camouflage", { img: "q-log" }, "a log", "log"),
    spell("u3h-grass", "camouflage", { img: "grass" }, "grass", "grass"),
    spell("u3h-giraffe", "camouflage", { img: "giraffe" }, "a giraffe", "giraffe", { challenge: true }),
    spell("u3h-crocodile", "camouflage", { img: "crocodile" }, "a crocodile", "crocodile", { challenge: true })
  ];

  const PLANES = [
    hear("u3p-frog", "pets", "a frog", ["frog-in-bag", "q-lizard", "rat-on-book"], { pics: true, alts: ["a frog", "a lizard", "a rat"] }),
    hear("u3p-lizard", "pets", "a lizard", ["q-lizard", "frog-on-bag", "spider"], { pics: true, alts: ["a lizard", "a frog", "a spider"] }),
    hear("u3p-ducks", "pets", "ducks", ["s-ducks", "s-dogs", "s-cats"], { pics: true, alts: ["ducks", "dogs", "cats"] }),
    hear("u3p-elephants", "pets", "elephants", ["s-elephants", "s-rats", "s-frogs"], { pics: true, alts: ["elephants", "rats", "frogs"] }),
    hear("u3p-rats", "pets", "rats", ["s-rats", "s-cats", "s-lizards"], { pics: true, alts: ["rats", "cats", "lizards"], challenge: true }),
    hear("u3p-cat-under", "where", "The cat is under the desk.", ["cat-under-desk", "cat-on-book", "q-cat-bag"], { pics: true, alts: ["cat under the desk", "cat on the book", "cat in the bag"] }),
    hear("u3p-frog-on", "where", "The frog is on the bag.", ["frog-on-bag", "frog-in-bag", "frog-under-case"], { pics: true, alts: ["frog on the bag", "frog in the bag", "frog under the pencil case"] }),
    hear("u3p-frog-in", "where", "The frog is in the bag.", ["frog-in-bag", "frog-on-bag", "frog-under-case"], { pics: true, alts: ["frog in the bag", "frog on the bag", "frog under the pencil case"], challenge: true }),
    hear("u3p-rat-under", "where", "The rat is under the desk.", ["rat-under-desk", "rat-on-book", "cat-under-desk"], { pics: true, alts: ["rat under the desk", "rat on the book", "cat under the desk"], challenge: true }),
    hear("u3p-spider-in", "where", "The spider is in the pencil case.", ["spider-in-case", "spider-under-book", "s-spiders"], { pics: true, alts: ["spider in the pencil case", "spider under the book", "spiders on the pencil case"] }),
    hear("u3p-show", "song", "Come and see the cats, dogs, rats, ducks and lizards.", ["show-right", "show-frog", "show-spider"], { pics: true, alts: ["cats, dogs, rats, ducks and lizards", "with a frog", "with a spider"], challenge: true }),
    hear("u3p-likecats", "like", "I like cats.", ["I like cats.", "I don't like cats.", "I like hats."]),
    hear("u3p-dontlike", "like", "I don't like spiders.", ["I don't like spiders.", "I like spiders.", "I don't like spider."]),
    hear("u3p-too", "like", "I like dogs too.", ["I like dogs too.", "I don't like dogs.", "I like dogs."], { challenge: true }),
    hear("u3p-great", "story", "I like spiders. They're great.", ["They're great.", "He's clever.", "Oh no!"]),
    hear("u3p-amazing", "story", "He's amazing!", ["He's amazing!", "He's beautiful.", "He's under the table."]),
    hear("u3p-timkim", "phonics", "This is Tim and his silly sister Kim.", ["This is Tim and his silly sister Kim.", "This is Tim and his silly sister Jim.", "This is Tom and his silly sister Kim."], { challenge: true }),
    hear("u3p-snake", "camouflage", "a snake", ["snake", "crocodile", "butterfly"], { pics: true, alts: ["a snake", "a crocodile", "a butterfly"] }),
    hear("u3p-giraffe", "camouflage", "a giraffe", ["giraffe", "tiger", "bird"], { pics: true, alts: ["a giraffe", "a tiger", "a bird"] }),
    hear("u3p-butterfly", "camouflage", "a butterfly", ["butterfly", "bird", "snake"], { pics: true, alts: ["a butterfly", "a bird", "a snake"] }),
    hear("u3p-grass", "camouflage", "Tigers hide in tall grass.", ["grass", "leaves", "trees"], { pics: true, alts: ["tall grass", "leaves", "trees"] }),
    hear("u3p-logs", "camouflage", "logs", ["logs", "trees", "leaves"], { pics: true, alts: ["logs", "trees", "leaves"], challenge: true })
  ];

  // Teacher explain page: a hint per topic to give before the answer.
  const HINTS = {
    pets: "Say the animals: elephant, rat, lizard, frog, spider, duck, dog, cat.",
    chant: "Say the chant: Whisper and his spider, Daisy and her dog, Lenny and his lizard, Sandra and her frog …",
    where: "In: inside. On: on top. Under: below.",
    song: "Sing Look at the animals. Where is each animal: on, in or under?",
    like: "Like it: I like … Don't like it: I don't like … Like it too: I like … too.",
    story: "Remember The spider. Whisper's pet spider is clever, and his friends are brave.",
    phonics: "Listen for the short i sound: T-i-m, K-i-m, s-i-lly, h-i-s.",
    camouflage: "Look at the colours. The animal and the place are the same colour, so it is difficult to see."
  };

  // Notes for single questions: a better hint, and why the answer is right.
  const NOTES = {
    "u3m-spider-in": { hint: "Can you see all of the spider?", why: "The spider is inside the pencil case: in." },
    "u3m-spider-under": { hint: "Is the spider on top, or below?", why: "The spider is below the book: under." },
    "u3m-cat-bag": { hint: "Is the cat inside the bag?", why: "The cat's body is in the bag: The cat is in the bag." },
    "u3m-s-frogs": { why: "The song picture shows the frogs under the chair." },
    "u3m-likespiders": { hint: "Is she happy or scared?", why: "She runs away, so: I don't like spiders." },
    "u3m-tree": { hint: "Where do the other spiders come from?", why: "The spider says: My brothers and sisters are in the tree!" },
    "u3m-cam-croc": { hint: "Look for the eyes.", why: "The crocodile is green and the water is green, so it's difficult to see." },
    "u3m-cam-frog": { hint: "Look for the legs on the leaf.", why: "The frog is brown and the leaf is brown." },
    "u3o-thunder": { why: "The chant says: Thunder and his elephant." },
    "u3o-misty": { why: "The chant says: Misty and her rat." },
    "u3o-spider": { why: "The spider is below the book: It's under the book." },
    "u3o-elephants": { why: "In the song picture, the elephants walk on a ruler." },
    "u3o-dont": { hint: "Do you like dogs? No.", why: "We say: I don't like dogs. Not: I not like dogs." },
    "u3o-touch": { why: "Whisper says: Touch him, Misty." },
    "u3o-idea": { why: "Whisper can talk to animals. He asks the spider: What?" },
    "u3o-brave": { why: "The story is about being brave. Misty touches the spider." },
    "u3o-tim": { hint: "Say them: T-i-m, h-i-m, sp-i-der.", why: "Tim and him have a short i. Spider has a long i sound." },
    "u3p-rats": { hint: "Rats or cats?", why: "Rats: the white animals in the box." },
    "u3p-frog-in": { hint: "In, on or under?", why: "The frog is inside the bag: in the bag." },
    "u3p-rat-under": { hint: "Listen for the animal and the word under.", why: "The rat is under the desk." },
    "u3p-show": { hint: "Is there a frog or a spider in the sentence?", why: "Cats, dogs, rats, ducks and lizards: no frog and no spider." },
    "u3p-too": { why: "I like dogs too: we both like dogs." },
    "u3p-timkim": { hint: "Listen: Tim or Tom? Kim or Jim?", why: "This is Tim and his silly sister Kim." },
    "u3p-logs": { why: "Logs are pieces of a tree on the ground." }
  };

  return {
    id: "u3",
    number: 3,
    title: "Pet show",
    h1: "Where's the lizard?",
    lede: "Pets, in, on and under, I like / I don't like, the story The spider, and camouflage. Come to Word Island. Play, and practise.",
    topics: TOPICS,
    hints: HINTS,
    notes: NOTES,
    banks: { maze: MAZE, moles: MOLES, hangman: HANGMAN, planes: PLANES }
  };
})();
