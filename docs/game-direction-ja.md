# Salary-mon: a little life beside your workday

Design proposal · 14 October 2026 · Product direction, not implemented gameplay.

**Recommended promise:** きょうのがんばりが、相棒の毎日に。 — Today's effort becomes your companion's everyday life.

Keep Salary-mon as the working brand, with サラリーモン as a candidate Japanese rendering. Test the name: “salary” may suggest salaried office workers and make freelancers or students feel excluded. Start with Japanese desk workers and freelancers who enjoy character collecting; this is an audience hypothesis, not a claim about all Japanese users.

## What the repository already gives us

The active entry point is `src/pages/index.astro` → `src/features/dashboard/Dashboard.tsx`. Build on the `features` implementation; similarly named older components and hooks elsewhere are not the active entry point.

- Firebase authentication, pet persistence, session history, client labels, invoices, planning, and optional calendar integration are present. This review inspected source, not a configured live Firebase account.
- `features/game/gameplay.ts` awards 10 XP per minute with no reward ceiling. A level is 1,000 XP: one level per 100 minutes. Eight tracked hours yields 4,800 XP, reaching level 5 from a fresh save.
- Five attributes consume XP, but their descriptions mostly promise future abilities. There is no implemented encounter or evolution system in this gameplay module. The user's main choice currently changes numbers, not what the creature can do.
- The dashboard combines beige hardware, green LCD, neon-purple pet panels, amber utility panels, English uppercase labels, and a global monospace font. Each reference is understandable; together they obscure one coherent world.
- Starting a session foregrounds client, label, and billing. Those are valuable work tools, but a new companion owner should be able to start in one tap.

**Design gap:** the app records effort, but it rarely creates a memorable event. Players need to remember “Mugi found a tiny umbrella,” not “I banked 600 XP.”

## The game fantasy

Your companion lives in a tiny room in a quiet town. While you work, it draws, reads, sorts its collection, or packs for an outing. When you finish, you take a short walk together and find something that changes its life: a new expression, a useful object, a visitor, a room decoration, or an evolution choice.

Borrow the emotional roles of the references: creature attachment and discovery, branching growth and little abilities, and tactile care rituals. Use original creatures, names, sounds, interfaces, and silhouettes. Make a contemporary pocket toy rather than reproducing any one franchise's interface.

## The repeatable loop

| Moment | Player action | Game response | Reason to return |
| --- | --- | --- | --- |
| Arrive, 10 seconds | Greet the companion; optionally choose a destination | A small reaction and a visible souvenir preview | “I want that for our room.” |
| Work, a normal session | Tap はじめる; task details are optional | Companion quietly does its own activity | Company without a competing game |
| Finish, 5–10 seconds | Review/save elapsed time | A receipt shows growth and outing steps; partial progress is retained | Work has a tangible consequence |
| Explore, 20–40 seconds | Spend one earned step; make one meaningful choice | A short authored encounter produces a souvenir or memory | Agency and discovery |
| Care, 5–10 seconds | Offer a free snack, pet it, or place the souvenir | An expressive response; a new room detail persists | Attachment and personalization |
| Close the day | Tap 今日はここまで | Companion settles down; a small diary entry is saved | A satisfying stopping point |

The app must work equally well when exploration is deferred. Rewards are saved automatically; no loot expires because someone had a meeting. No game interaction interrupts an active work session. The timer supports pause, resume, early finish, and count-up tracking; 25 minutes is a convenient preset, not a required work style.

### A concrete first session

1. Choose one of three eggs by personality, name it, and begin immediately in a local guest save. Offer cloud backup after the first rewarding moment.
2. The first completed positive-duration session hatches it. Do not force a long onboarding timer. The tutorial outing is free once, so a short first session still teaches the game.
3. After a typical 25-minute session: +25 growth, +1 outing step, and 10/15 minutes carried toward the next step. The hatch reveal replaces the ordinary reward animation.
4. Visit こもれび公園. A small creature is hiding from the rain. Choose 「葉っぱをかさにする」 for a leaf umbrella decoration or 「雨やどりにさそう」 for a shared-shelter diary illustration. Preview both reward categories. Either choice succeeds; each gives a different story.
5. Place the umbrella in the room, or open the illustrated diary. The companion reacts to the actual choice.
6. Leave with “次は、喫茶店をのぞいてみよう。” Nothing requires another session today.

## Where the game has depth

**Routes create collection goals.** Three destinations initially: a sunlit park, a little café, and a stationery lane. Each has four encounters and a visible collection page. Show a silhouette and a useful hint, not an opaque rare-drop percentage. Repeat visits offer unchosen outcomes before duplicates. A completed collection unlocks a room theme, making decoration a reason to explore.

**Choices create identity.** Replace the five corporate attributes in the primary UI with three understandable tendencies: ひらめき (ideas), やさしさ (kindness), and たんきゅう (curiosity). Encounter and care choices influence these. Work categories never dictate a creature's worth or force users to mislabel their work. At evolution, preview all forms and let the player confirm a preference; tendencies provide a recommendation, not an irreversible trap.

**Abilities change solutions.** Each evolved form has one situational ability: create a tool, make a friend, or discover a hidden path. Every encounter has a normal successful option and an ability-specific alternative with a different collectible or animation. No form earns XP faster or makes office work more valuable. This provides a light RPG build choice without a combat system swallowing the product.

**The room remembers.** A placed lamp changes the evening scene; the umbrella appears on rainy outings; a befriended visitor occasionally appears in the diary. These authored callbacks are the emotional payoff. One recognizable companion with several expressive behaviors is worth more than dozens of palette swaps.

**Growth has anticipation.** Hatch on the first completed session; first visible change after three qualifying days; choose an adult form after seven. A qualifying day totals at least 15 credited work minutes, even across short sessions. Days need not be consecutive. These are starting balance values to playtest, not validated retention targets. After the first regional collection, offer another egg; the original companion stays in the room and can be selected again.

Defer ranked battles. If users later want competition, test a short optional exhibition game with normalized stats and cosmetic rewards. Test asynchronous room visits and “おつかれさま” stamps before a social feed or guild obligations.

## A small, understandable economy

Two progression concepts are enough: non-spendable growth and spendable outing steps. Decorations are inventory, not a third currency. Snacks and affectionate care are free and optional; they do not stack numerical bonuses.

Proposed initial rule: each eligible work minute gives one growth point, up to 60 minutes per local reward day. Every 15 of those minutes grants one outing step, at most four new steps per day. Keep fractional-minute precision internally and aggregate sessions before awarding whole points/steps. Carry the partial 15-minute step between days. Accumulate unused steps without expiry. Time tracking continues beyond the ceiling; game yield stops increasing. Do not present 60 minutes as a work target or suggest that longer work is unhealthy by definition.

Examples: 10 + 5 minutes = 15 growth and one step; 25 + 25 minutes = 50 growth, three steps, five minutes carried; another 40 minutes that day records all 40 but rewards only the remaining 10 eligible minutes, bringing the day to 60 growth and four steps. These examples assume no carry from a previous day.

The cap is a hypothesis: in playtests, compare 30/60/90-minute ceilings for satisfaction and perceived fairness. Do not optimize for more hours worked. Rest days freeze progress; the pet never becomes sick, dies, loses affection, or drops a streak because the player was absent. Logging in is not required for rest. Returning after a week gets おかえり, not a debt.

## Japanese visual and language direction

**Lead direction: “milk-and-matcha pocket toy.”** Warm ivory shell (`#F5EBD8`), deep tea ink (`#344538`), pale matcha scenery (`#D7E4B6`), peach accents (`#EAA48B`), with lilac reserved for discoveries. Strong contrast for all functional text. Large rounded shell, shallow tactile buttons, small printed details, and one gently inset scene. Avoid nesting every panel in another device frame.

32×32 or 48×48 original sprites, integer scaling, a consistent one-pixel outline, and six to eight colors per creature. Soft silhouettes: bean-shaped bodies, stubby feet, generous cheek space, imperfect accessories. Starter concepts: a sprout creature with a leaf hood, a cloud creature with a paper-scrap satchel, and a round ink creature with a pencil tail. Each gets an individual quirk and preferred activity. These motifs are proposals, not researched Japanese preferences.

Prioritize six readable states: idle, quietly working, delighted, exploring, eating, sleeping. Use brief two-to-four-frame reactions and occasional slow idle movement, never constant flashing. Respect reduced motion; sound and haptics are opt-in. A classic monochrome LCD shell can be an optional skin; the content hierarchy should remain the same.

Use a readable Japanese sans-serif stack such as Hiragino Kaku Gothic ProN / Yu Gothic / sans-serif for controls and body copy. A rounded Japanese font can add warmth after licensing and rendering checks. Keep pixel lettering to short Latin branding and numerals; never force dense Japanese copy into a pixel font. Target 16px body text, 12px minimum secondary labels, 44px touch targets, and Japanese line-breaking review. Test 320–430px phones and a larger desktop companion view.

| Situation | Proposed Japanese copy | Tone |
| --- | --- | --- |
| Home | きょうも、いっしょに。 | Companion, not manager |
| Start | 25分 はじめる / 時間をえらぶ | Specific and low effort |
| Finish | おつかれさま。25分を記録したよ。 | Acknowledge the actual session |
| Explore | ちょっと、おでかけ | An invitation |
| Reward ceiling | 今日の育ち分は受け取ったよ。時間の記録はつづけられるよ。 | Clear and non-punitive |
| End the day | 今日はここまで | Closure |
| Return | おかえり。のんびり待ってたよ。 | No guilt |

Test phrasing with native Japanese users. Avoid piling on baby talk, treating adulthood as corporate promotion, or using “社畜” as the central joke. Salary-mon should feel affectionate even to users having a difficult week at work.

## Screen hierarchy and practical UX

- **おへや:** companion scene occupies the upper half; one friendly line; one work CTA; outing steps appear when earned. Tap the companion for a small reaction, not a mandatory chore. During focus, show elapsed/remaining time, pause, and finish with minimal motion.
- **おでかけ:** choose destination, preview the next collection opportunity, resolve an encounter. Unavailable paths explain a discoverable unlock condition.
- **きろく:** work history plus illustrated companion memories. Work totals remain exact and editable, separate from capped game rewards. Time corrections show their reward effect before saving.
- **メニュー:** collection, appearance, sound, account, and settings. Client/invoice/calendar tools live under 仕事の設定 and appear when enabled. Task labels are optional beneath the timer.

Use four bottom navigation destinations with visible Japanese labels; keep the primary CTA above them. On desktop, expand the companion scene and put work history beside it rather than stretching a phone shell across a dashboard. Offer a compact quiet mode for the desk.

Onboarding asks only for an egg and nickname before play. Notifications are separately opt-in and follow the user's work schedule and timezone, including shift workers. Avoid employer assumptions such as calling the personal timer 出勤 or promising formal attendance compliance. Share cards preview exactly what will be shared: creature, room, and optional message; no client names, salary, work times, or calendar titles by default. A seasonal diary motif is a small content treatment, not a countdown demanding attendance.

## Build plan against the current code

### First vertical slice

Ship a complete session → receipt → encounter → permanent souvenir → room reaction loop. Scope: one starter, one room, one route with three encounters, one evolution choice preview, guest play, pause/resume, and Japanese UI. Keep the existing tracker data and business tools intact. A richer economy is not a prerequisite for testing attachment.

1. Define a versioned pure reward function in `features/game/gameplay.ts`: total tracked duration, credited duration, cap remaining, growth delta, steps delta, fractional carry. Add tests for splitting sessions, ceiling crossings, day boundaries, correction, and duplicate settlement.
2. Make session finalization and reward settlement one authenticated, idempotent server transaction. Current `features/time/useWorkSession.ts` performs two separate client writes using a pet snapshot: an entry may finish without its reward, and concurrent changes can overwrite progress. Fix this before adding more valuable rewards. Likewise protect upgrade/evolution/inventory writes. Review Firestore rules; none were found in this repository inventory.
3. Add `schemaVersion`, `growth`, `rewardCarry`, `stage`, `tendencies`, `evolutionChoice`, `inventory`, and `roomPlacement` concepts. Keep lifetime XP and existing purchased attributes as legacy history, with a visible migration preview and a cosmetic recognition gift. Do not silently erase earned value or directly convert unlimited old XP into a competitive economy.
4. Persist an authoritative reward-day ledger in the user's selected IANA timezone, defaulting to Asia/Tokyo for this launch. Partition sessions across local midnight, subtract pauses, and prevent overlapping active sessions. A timezone change takes effect next reward day. Distinguish session states from pet animation states. Reloading or reconnecting must recover the same session and receipt.
5. Record encounter ID, choice, cost, outcome, and settlement ID atomically so refresh/double-tap cannot duplicate loot or consume two steps. Imported calendar meetings do not automatically mint rewards. Offline receipts are marked pending until reconciliation, with an explicit guest-to-account merge policy.
6. Replace the active `PetCard` with a scene renderer driven by stage and activity; centralize visual tokens and Japanese strings. Add receipt/encounter components and reduce `TrackerCard` setup friction. Relocate business tools through `Dashboard` navigation.

### Small playable release after the slice works

Three starter personalities, three evolved forms, three destinations, twelve authored encounters, twelve souvenirs, six reactions, and a diary. Reuse backgrounds and animations deliberately. Guest-save backup, corrections, accessibility, and return-after-absence behavior are part of this release, not polish to postpone. Design the content as local structured data; do not require generative AI or external API calls to resolve encounters.

### Validate before expanding

Recruit 8–12 Japanese participants across employees, freelancers, remote/on-site work, and different schedules. This is a qualitative pilot, not representative market research. Run a moderated first-session test, then a two-week home trial.

Observe: can they start without help; do they understand the work/game distinction and ceiling; do they deliberately choose a reward; do they remember the companion's name or a specific event; do they place a souvenir; do they return voluntarily after a missed day? Compare the pocket-toy UI with a quieter room-and-diary layout. Ask whether Salary-mon sounds welcoming or office-specific.

Instrument first session completion, receipt-to-exploration, first decoration placement, repeat visits on chosen workdays, and return after absence. Do not use increased work hours as the success metric. Prioritize fixing confusing choices and weak emotional payoff over adding streaks or randomized scarcity.

If the core resonates, sell optional shell/room cosmetic packs or a separate professional-tools tier. Keep a satisfying free companion and full tracking. Pricing and willingness to pay remain unvalidated; paid randomized rewards and progression boosts are outside this proposal.

## Reference grounding and limits

- [Pokémon Sleep's official Japanese gameplay overview](https://www.pokemonsleep.net/pokemon/) turns a real-life routine into a later discovery-and-collection ritual. The design inference here is to put Salary-mon's playful payoff after a work session.
- [The Pokémon Company's development interview](https://corporate.pokemon.co.jp/en/topics/detail/t-9/) discusses avoiding incentives to distort sleep for collection. The analogous design judgment for Salary-mon is to avoid progression that rewards unlimited extra hours.
- [Tamagotchi Paradise's official play guide](https://tamagotchi-official.com/jp/series/paradise/howto/) connects care and environment to visible growth and describes social play. Salary-mon's proposed care, room, and evolution choices use that broad interaction pattern with a gentler absence model.

These sources explain reference-game mechanics. They do not establish demand, conversion rates, aesthetic preferences, or a single “Japanese user” profile. All proposed timings, names, art direction, and reward values need testing.
