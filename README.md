# WhatCanICook? 🍳 — Phase 1

Cook something delicious with what you already have.

This is Phase 1 of the app: the Home screen and ingredient-picking flow.
Recipe matching is not implemented yet — pressing **Find Recipes** shows a
"coming soon" message.

## Requirements

- Node.js LTS
- Expo Go app on your iPhone (App Store)
- Expo SDK **54** (do not run `expo upgrade`)

## Setup

```bash
npm install
npx expo start
```

Scan the QR code shown in the terminal with your iPhone's Camera app (it will
open Expo Go automatically), or press `i` if you have the iOS Simulator set
up on a Mac.

## What to test on your iPhone

- Home screen loads and looks polished (header, input card, quick-add card)
- Type an ingredient and tap **+ Add** → it appears as a chip
- Type an ingredient and press the keyboard's **Done** button → same result
- Try adding "plantain", "Plantain", and "PLANTAIN" → only one chip appears
- Tap the **×** on a chip → it's removed
- Tap a few **Quick add** pills → they get added and turn muted/disabled
- Tap **Clear all** → all chips disappear and the section hides itself
- With no ingredients, tap **Find Recipes** → friendly reminder to add some
- With ingredients, tap **Find Recipes** → "Recipe matching will be available soon."
- Rotate through light/dark iOS mode if you want (screen currently forces a light UI)

## Known limitations (Phase 1)

- No recipe matching/AI yet — that's Phase 2+
- No persistence — ingredients reset if you reload the app
- No custom font loaded (system font used to keep dependencies minimal)
- No dark mode variant yet
- Suggested ingredients list is a static array, not a real ingredient database
