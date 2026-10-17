# 0008. Rationale: island finish and score

## Context

With spec 0007, a pupil can open all 12 chests on the beach island, but nothing happens after the last one. Spec 0002 fixes the island maximum at 12 × 10 + `bonus` (140 on Unit 9) without saying when the bonus is earned, and chests can only give 120. The scope asks for a treasure ending with the score and stars, Play again and Back to Word Island.

The players are 7 year olds. The ending must be short to read, celebrate finishing whatever the score, and give a clear goal for next time. Spec 0007 already runs a finished hook once, after the last chest's talk box closes, and the talk box (spec 0004) has a message form with buttons. Word Island keeps its own stars per game; the quest's stars are separate and only shown at the ending.

## Options considered

### Option 1: A small finish module using the talk box (chosen)

`finish.js` listens to the finished hook, works out the bonus and stars, and shows them in the talk box's message form, which gains a row of three stars.

**Pros**:
- Reuses the hook, the talk box, the fanfare and the voice that already exist.
- Looks like every other talk box, which pupils already know.

**Cons**:
- The talk box is small; a bigger celebration screen is not possible without more work.

### Option 2: A full ending screen

A new full screen card, like the Play card, with large stars.

**Pros**:
- Room for a bigger celebration.

**Cons**:
- A new screen in `screens.js` with its own layout and pause rules, for little gain over the talk box.

## Rationale

Option 1 builds the ending out of parts already in the game, so it is small and behaves like every other talk box (pause, focus, reading aloud). Your choices set the rules: the bonus rewards finishing, so every child who opens all the chests earns it; stars start at 1 for finishing, with 2 at 100 and 3 at 130, so a pupil who needed a couple of hints can still get 3; Play again brings fresh questions on the same island; and the ending stays short with just the two buttons.

Some calls were mine. The star thresholds are written as fractions of the island maximum (130/140 and 100/140), so an island with a spot left out still gives fair stars (runner up: fixed numbers, which would make 3 stars impossible on a shorter island). The 1.5 second wait counts only while the game runs, so a pause never hides the ending's start (runner up: a plain timer, which could open the ending behind the pause menu). Play again drops `seed` from the address but keeps the rest, so a teacher testing with `&debug` keeps it while still getting new questions (runner up: reload as is, which would repeat the same questions on a fixed seed).
