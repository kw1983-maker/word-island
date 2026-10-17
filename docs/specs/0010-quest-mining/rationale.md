# 0010. Rationale: mining

## Context

You want pupils to break and place blocks, as in your BlockWords game. The scope's feature 23 asks for breaking and collecting into the hotbar, with every block's name shown and read aloud, and says puzzle spots, chests and villagers must never be broken away. Spec 0005 already decided that mining shares the left click with "use", that use wins when a chest or word thing is in front, and that phones need a hold to break.

The quest already has the pieces around it: the island world can change blocks and rebuild in a few milliseconds (spec 0004), the hotbar shows nine slots and the hand holds the selected one, and the island checker proves every chest can be reached on foot (spec 0006). BlockWords has a full mining system: crack textures, break times by hardness and tool, items dropped on the ground, and placing on right click.

The players are 7 year olds on phones and laptops. Mining must never cut off a chest, trap a child in a pit, or lose their blocks by surprise, and it must not slow budget phones.

## Options considered

### Option 1: Copy BlockWords' mining whole

Hardness based break times, tools, items dropped on the ground and picked up by walking over them.

**Pros**:
- Exactly like BlockWords.

**Cons**:
- Stone takes about 7 seconds by hand; tools would need crafting the quest does not plan.
- Dropped items need entities and pickup code the quest doesn't have.

### Option 2: A simple mining module with BlockWords' look (chosen)

A new `mining.js` copies BlockWords' crack textures, timing loop, sounds and place rules, but every block breaks in about a second and goes straight into the hotbar, with protection and depth rules worked out from the map.

**Pros**:
- Feels like BlockWords (cracks, sounds, swing) while staying simple for children.
- Small: no tools, no dropped items, no entities.
- The safety rules come from data the map already has.

**Cons**:
- Less depth than BlockWords (no tools, one block deep digging).

### Option 3: Break only, no placing

**Pros**:
- The least work, and the island stays tidier.

**Cons**:
- You asked for placing; collecting blocks with nothing to do with them feels pointless.

## Rationale

Option 2 keeps what makes BlockWords fun, the crack, the sounds and building, and drops what would frustrate a 7 year old: slow stone and tools to make first. Your choices set the rules: about a second per block, placing on, chests, word things and the bottom of the world protected, digging at most one block below the ground, a full hotbar refusing a break rather than losing blocks, names read the first time each kind is collected, a hold on Use to break and a Place button on phones, and a fresh island every play.

Some calls were mine. The starting ground is the highest ground kind block in each column of the map as built, so houses, the lighthouse and sandcastles stay breakable above it while the land under them is safe (runner up: a fixed height for the whole island, which would forbid digging the hill). Blocks with water above can't break, so no dry air pockets open under the sea (runner up: let water fill in, which needs water flow the world does not have). A block collects as itself rather than BlockWords' drops (grass gives Grass Block, not Dirt), so the name the pupil hears matches the block they broke. The reach stays 4 blocks, the same as using things, so what a pupil can use and what they can break never disagree.
