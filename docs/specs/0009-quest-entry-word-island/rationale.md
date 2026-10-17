# 0009. Rationale: quest entry in Word Island

## Context

Treasure Quest's Unit 9 island now plays from start to finish, but pupils can only reach it by a typed address. Feature 5 adds the way in from Word Island. You decided that a unit's island should open only after the pupil finishes that unit's five Word Island games, and that it should show on the unit's main page, locked until then.

Word Island already keeps, on the pupil's device, a record per unit of which games were finished (`word-island-<unit>-v2`, its `done` flags), and it already locks games in a chain with a short reason on each locked card. The quest page already checks the pupil, the island file and the class's open units before it loads the 3D engine (spec 0001). Only Unit 9 has an island today; eight more are planned.

Pupils are 7 year olds who share devices at school and use phones at home. The lock should feel like the existing game chain, never block a teacher in a lesson, and never send or store anything new.

## Options considered

### Option 1: A shared rule file and a sixth gate card (chosen)

`shared/quest.js` holds the island list and the open rule; Word Island draws a sixth card from the same gate card code, and the quest page checks the same rule.

**Pros**:
- Looks and behaves like the five game cards pupils already know.
- One rule for both pages, so they can't disagree.
- No new storage, no online calls.

**Cons**:
- A new shared file to load in both pages and in the quiz copy.
- The lock is per device.

### Option 2: Check online results

The open rule reads the pupil's results from the teacher's results in Firebase.

**Pros**:
- Follows the pupil to any device.

**Cons**:
- Pupils are not signed in to read results; it would need new rules, sign in and waiting on the network, for a learning nudge.

### Option 3: Lock only the card

Word Island locks the card, but the quest page opens for anyone with the link.

**Pros**:
- The least code.

**Cons**:
- A shared link skips the five games, which you wanted to prevent.

## Rationale

Option 1 matches your choices and the game's existing patterns. The sixth card reuses Word Island's own gate cards, so locked and open look and sound like the games before it, and the record it reads is the one that already unlocks game 2 after game 1. Putting the rule in one shared file used by both pages means the card and the quest page never disagree, and the quest page check stops a shared link from skipping the games. Option 2 would buy cross device unlocking at the cost of sign in and network waits for a nudge; it can come later with feature 10. Option 3 leaves the hole you asked to close.

Some calls were mine. The island list lives in the shared file with a checker rule tying it to the island files (runner up: Word Island fetching the quest's island files to see which exist, which costs a network request on every unit page). The quest page runs the five games check after the class check, so a pupil whose class can't play the unit still sees "This island is not open" first, the more useful message (runner up: games first, which would tell such a pupil to play games their class can't reach). `open=all` is carried on the card's link so a teacher demonstrating with it gets straight in.
