# 0005. Rationale: walking the island

## Context

Feature 4 (spec 0004) gave Treasure Quest BlockWords' look: a first person view of a small test beach, but you can only look around, not walk. Pupils need to walk, look and jump around an island on budget Android phones, iPhones and school laptops, at age 7, mostly without help. The plan says nothing can hurt them, they can never fall off or get stuck, and falling into the sea puts them back on land. Later features (chests, riddle villagers, listen and find, word blocks, mining) all need a pupil to "use" the thing in front of them.

BlockWords already has a tested first person player: collisions against blocks, gravity, jumping, an automatic step up onto one block ledges, and an unstick rescue. Its input is laptop only: mouse capture (pointer lock), WASD and a click and drag fallback, with no touch controls at all. It also carries survival code (health, hunger, breath, fall damage) the quest must not have.

Phones are the hard part: there is no keyboard or mouse, two thumbs must walk and look at once, and touches meant for the hotbar or buttons must not move the view. Schools sometimes block pointer lock. Not deciding now would leave features 7, 8 and 23 each inventing how a pupil moves and uses things.

## Options considered

### Option 1: Tap to walk (point and click movement)

The pupil taps a spot on the ground and the hero walks there by itself; dragging looks around.

**Pros**:
- The easiest control for small children on phones.

**Cons**:
- Needs path finding around blocks, which BlockWords does not have.
- Does not feel like BlockWords, which you chose as the model.

### Option 2: BlockWords' player plus new quest controls (chosen)

Copy BlockWords' `Player` (trimmed of survival code) and write the quest's own input layer: BlockWords' mouse capture and keys on laptops, a floating joystick, drag look and buttons on phones, a sea rescue, and a shared use target system.

**Pros**:
- Movement behaves exactly like BlockWords, from tested code.
- One use action serves every later feature.

**Cons**:
- Phone controls are new and untested in BlockWords.
- One more copied file to keep in step by hand.

### Option 3: Write a new player from scratch

A simpler character controller made for the quest, with no BlockWords code.

**Pros**:
- No copied code; sized exactly to an island.

**Cons**:
- Collisions, step up and unstick are fiddly to get right; BlockWords already solved them.
- Would feel different from BlockWords.

## Rationale

You chose BlockWords as the model for the look, and the way a block game moves is a large part of how it feels. BlockWords' `Player` already solves the fiddly parts (axis by axis collision, stepping up ledges, never getting stuck), so copying it is both faster and safer than Option 3, and it keeps the quest feeling like BlockWords, unlike Option 1.

Your answers set the controls: mouse capture like BlockWords with a drag fallback for school machines; arrows that walk and turn so a child can play with the keyboard alone; on phones a floating joystick, drag to look and a jump button (BlockWords' step up covers most climbing); shallow water to paddle in with deep water putting you back on the beach; a shared use action by looking at a thing and clicking, pressing E or tapping it; walk and jump only, with no running; BlockWords' crosshair on laptops; and one fixed turning speed. The joystick and buttons are the one place with no BlockWords code behind them, which is why the build plan and follow up call for a real phone check.
