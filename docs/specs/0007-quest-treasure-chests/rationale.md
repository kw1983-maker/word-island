# 0007. Rationale: treasure chests

## Context

The beach island (spec 0006) now has 12 named anchors where puzzles sit, and spec 0002 already draws a fresh question for each spot every play and fixes the coins: 10 for the first try, 5 after the hint, 0 when the answer is shown after two wrong tries. In Release 1 every spot plays as a chest. The talk box (specs 0003 and 0004) shows a puzzle and reports picks, and use targets (spec 0005) let a pupil open a thing they look at. What is missing is the chest itself and the rules around it.

Three things were open. Spec 0002 says challenge questions get a gold chest, but no gold chest exists. Nothing says what a chest looks like once it is done, so pupils could not tell finished chests from new ones. And the talk box has no way to leave a puzzle before answering, so a chest opened by mistake has to be finished.

The players are 7 year olds on phones and laptops. They need to see their progress, never feel trapped in a box, and never find a way to farm coins. The score must stay within `islandMax` (140 on Unit 9), because feature 10 will check it in the Firestore rules.

## Options considered

### Option 1: Chests as 3D models over the island

Each chest is a small Three.js model (box and lid) placed at its anchor, with an animated lid.

**Pros**:
- A real lid can swing open.

**Cons**:
- Use targets, raycasts and collisions would treat chests unlike every other block; pupils could walk through them.
- Mining (feature 23) would need a separate rule for models.
- More code and more to draw each frame on budget phones.

### Option 2: Chests as blocks in the world, driven by `chests.js` (chosen)

Each chest is a block (`chest` or `gold_chest`) at its anchor. `chests.js` keeps one state per spot, opens the talk box, applies `coinsFor`, and swaps the block for an open chest block when the puzzle is done.

**Pros**:
- Uses what already works: the world's blocks, spec 0005 targets and spec 0004's talk box.
- Solid like BlockWords' chest; pupils cannot walk through it.
- Opening is one block change.

**Cons**:
- An open lid is only suggested by the open chest's tiles, not animated.
- Three new blocks and six new tiles to draw.

### Option 3: Chests vanish when done

Chests are blocks, but a done chest is removed instead of shown open.

**Pros**:
- No open chest art needed.

**Cons**:
- The spot looks empty, and pupils lose the island's own record of where they have been.

## Rationale

Option 2 keeps chests in the same world as everything else. A block chest is solid, already looks like BlockWords' chest, and works with the use targets and the debug view without new cases. The open chest blocks give pupils a visible trail of finished spots, which matters for a 7 year old more than a lid animation would. Option 1 would cost the most on budget phones and split chests from the block rules mining will need. Option 3 is cheaper but hides progress.

Your choices set the rules. A gold block makes harder questions stand out from afar while the coins stay as spec 0002 sets them. A chest whose answer was shown opens empty and counts as done, which keeps spec 0002's coin rules and stops coin farming. Not now keeps the tries, so leaving and coming back never earns more coins than staying, and the same question returns, so there is no fishing for an easier one. Coins arrive while the talk box still says "Well done", and the chest opens when it closes, so the reward and the visible change are both clear.

Some calls were mine. The chest ignores the anchor's facing, because BlockWords' chest shows its lock on every side (runner up: four facing variants, which multiply the blocks for little gain). The kit's sample puzzles stop changing the counter, so the counter only ever means island coins (runner up: let both share it, which would let `&kit` push the counter past the island's real maximum). The finished hook runs after the last talk box closes rather than on the last answer, so feature 9's ending never covers the last "Well done".
