 ## Light PRD (Updated) — **Ludo Duel (2P Mobile)** with Fun Twists

**Platform:** Mobile (Android + iOS)
**Mode:** 2-player (Online PvP; optional Local Pass-and-Play later)
**Positioning:** Classic Ludo feel + **more chaos, rivalry, comebacks** with **low strategy / low friction**.

---

# 1) Problem & Opportunity

Classic Ludo issues (especially in 2P):

* Snowball: early lead often stays ahead
* Mid-game can feel repetitive
* Luck-only can feel unfair (no “comeback lever”)

**Opportunity:** Add *controlled* chaos + comeback mechanics that are **automatic or one-tap**, keeping turns fast.

---

# 2) Goals & Success Metrics

### Product Goals

* High “moment density”: cuts, surprises, revenge, hot-risk punishments
* Low decision complexity: play in one hand, minimal menus
* Short matches: 6–12 minutes typical

### MVP Success Metrics

* Match completion rate ≥ 75%
* Median match duration: 8–10 minutes
* Rematch rate: 30%+
* D1 retention (early target): 25%+

---

# 3) Target Users

* Casual 2-player users (friends/couples)
* People who already know Ludo
* Want **fun + competitive**, not deep strategy

---

# 4) Core Gameplay Rules (Baseline)

* 2 players, 4 tokens each
* 1 die
* Roll **6** to bring a token out (standard)
* Cutting: landing on opponent sends opponent token back to base (unless protected by safe/shield rules)
* Exact roll required to reach final home cell

---

# 5) Board & Tile Map (Fixed)

## Track indexing (for implementation)

* Single ring track: **52 tiles** indexed **0 → 51**, clockwise
* Red Start: **0**
* Blue Start: **26**

## Home entry

* Red home-entry: **51** (tile just before Red Start)
* Blue home-entry: **25** (tile just before Blue Start)

## Home lanes

* Red lane: `R1..R6`
* Blue lane: `B1..B6`

## Safe tiles (cannot be cut)

`{0, 8, 13, 21, 26, 34, 39, 47}`

## Trick tiles (trigger random effect on landing exactly)

`{3, 11, 19, 29, 37, 45}`
(Mirrored fairness: each tile +26 mod 52)

---

# 6) Twist Mechanics (Final Set)

## A) Reverse Meter (Revenge Meter)

**Purpose:** A simple comeback lever without adding strategy depth.

**Trigger**

* When your token is cut → `revenge_meter += 1` (max 3)

**Use**

* On your turn, before rolling, if meter > 0:

  * Tap **“Revenge Roll”** → consumes 1 meter
  * That roll only uses **biased dice** toward 5–6

**Dice bias example**

* Normal: uniform 1–6
* Revenge: weights like `[1:10%, 2:10%, 3:15%, 4:15%, 5:25%, 6:25%]`

**UX**

* Meter shown near avatar (0–3 pips)
* Button appears only when available

---

## B) Trick Tiles (Surprise Moments)

**Purpose:** Make the board feel alive; create “highlight” moments.

**Trigger**

* Landing exactly on a Trick tile triggers **one random effect**.

**Effect Pool (MVP)**

1. **Banana Slip**: move back 3
2. **Rocket**: move forward 4
3. **Shield**: ignore next cut (one-time)
4. **Teleport**: jump to nearest safe tile ahead
5. **Freeze (Rare)**: opponent skips next turn
6. **Magnet**: swap with your own farthest-ahead token

**Constraints / Safety**

* Only **one Trick resolution per turn** (no retrigger chaining even if Teleport lands on another Trick tile)
* Freeze fairness:

  * “Rare” probability (e.g., 5–8%)
  * Cap: max **2 freezes per player per match**

**Resolution order (important for consistency)**

1. Move token per dice
2. If land on opponent on non-safe → cut happens
3. If landed tile is Trick → apply effect
4. If effect moves token → apply cut rules again (but do not trigger another Trick)

---

## C) Hot Six Rule (Funny Risk / Anti-snowball)

**Purpose:** Rolling many 6s gets spicy; leader gets punishable moments.

**Tracking**

* Count number of 6s rolled per player: `six_count[player]`

**Trigger**

* When a player rolls their **3rd six** in the match → **HOT State** activates immediately after the move resolves.

**Effect (HOT State)**

* For the HOT player, for **one opponent turn window**:

  * Their tokens become **cuttable even on safe tiles**
* Visual: flames/glow + warning banner “HOT!”

**Expiry**

* HOT expires after opponent completes their next turn (i.e., opponent gets exactly one chance to punish)

**Clarity rule**

* HOT affects **all tokens** of that player during HOT window (simpler + more dramatic)

---

## D) Underdog Sprint (Gap ≥ 2) — Updated Finish Mechanic

**Purpose:** Rubber-band only when the lead becomes significant, to prevent hopeless endgames.

### Definitions

* `tokens_home[player]` in [0..4]
* `gap = abs(tokens_home[P1] - tokens_home[P2])`
* `lagging_player` = player with fewer tokens home

### Trigger (only on “token goes home” event)

Whenever **any player gets a token home**:

* If `gap >= 2` → activate **Underdog Sprint** for the lagging player

Examples that trigger: 2–0, 3–1, 4–2
Non-trigger: 1–0, 2–1, 3–2

### Effect

For the lagging player’s **next 2 turns**:

* Dice results **1–3 automatically become 4**
* 4–6 remain unchanged
* UI banner + dice boost icon: “UNDERDOG SPRINT!”

### Expiry

Sprint ends when either:

1. Lagging player completes **2 turns**, OR
2. Lagging player gets **one token home**

### Non-stacking

* If Sprint triggers again while active → **reset** to 2 turns (no stacking beyond 2)

### Interaction rule

* Apply Sprint upgrade **after** the roll is generated (normal or revenge):

  * Roll generated → if sprint active and roll in 1–3 → upgrade to 4

---

# 7) UX & Game Flow (Low friction)

## Primary Screens

1. **Home**

   * Quick Match
   * Play with Friend (invite/link/room code)
   * How to Play
2. **Matchmaking / Lobby**

   * Invite accepted, ready state
3. **Game Board**

   * Board + tokens + dice
   * Revenge button (conditional)
   * Status indicators: Shield, Hot, Sprint, Freeze
4. **Results**

   * Winner + summary + rematch

## Turn Flow

1. Show state badges (HOT / Sprint / Shield etc.)
2. If Revenge meter > 0 → show “Revenge Roll”
3. Tap Dice → roll animation
4. If only one legal move → auto-move

   * Else highlight movable tokens → player taps one
5. Resolve:

   * Cut → Trick (if any) → finish/home
6. Pass turn

---

# 8) Feedback & Delight

* Fast, punchy animations:

  * Cut (pop + whoosh)
  * Trick (slot-machine reveal)
  * Hot (flame glow)
  * Sprint (boost burst)
* Minimal text banners (1–2 seconds):

  * “REVENGE!”, “SHIELD!”, “HOT!”, “SPRINT!”

---

# 9) Fairness & Anti-Frustration

* Server authoritative RNG (online):

  * Dice results
  * Trick outcomes
* Guardrails:

  * No Trick chaining
  * Freeze capped
  * Hot window duration fixed (one opponent turn)
  * Sprint only when gap ≥ 2 and only 2 turns

---

# 10) System/State Model (High-level)

### Per player

* `tokens_home`
* `revenge_meter (0..3)`
* `six_count`
* `sprint_turns_left (0..2)`
* `freeze_next_turn (bool)`
* `hot_active (bool)` / `hot_expires_after_opponent_turn (bool)`

### Per token

* Location: `BASE | TRACK(index 0..51) | HOME(color, laneIndex 1..6)`
* `shield_active (bool)`

### Board config

* `safeTiles: Set<int>`
* `trickTiles: Set<int>`
* `tileType(index)`

---

# 11) MVP Scope

### Must-have (MVP)

* Online 2P match
* Core Ludo rules + safe tiles + cutting
* Reverse Meter + Revenge Roll
* Trick Tiles + 6 effects + no chaining + freeze cap
* Hot Six rule
* Underdog Sprint (Gap ≥ 2) with reset rules
* Results + rematch

