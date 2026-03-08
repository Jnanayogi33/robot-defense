# 🤖 Future Defense: Robot Uprising

A tower defense game built by Joshua (age 8) using Claude Code.

**[▶️ Play latest version](https://jnanayogi33.github.io/robot-defense/)**

---

## Version History (Learning Journey)

### [▶️ v1.0 — Desktop Original](https://jnanayogi33.github.io/robot-defense/v1/)
Joshua's first build, made entirely in Claude Code. Works great on a computer with a mouse. But open it on a phone and 300px of the game is hidden off the bottom — the canvas is taller than the screen!

**What we learned:** Building for desktop and building for mobile are different problems.

---

### [▶️ v2.0 — First Mobile Layout](https://jnanayogi33.github.io/robot-defense/v2/)
**Problem:** The game was unplayable on iPhone.
**Fix:** Redesigned the layout so the game canvas sits on the LEFT and all the buttons sit on the RIGHT (a "side-by-side" or `flex-row` layout). Nothing falls off the screen anymore.

**What we learned:** CSS `display: flex` + `flex-direction: row` lets you put things side by side instead of stacked top-to-bottom.

---

### [▶️ v3.0 — Bigger Game Board](https://jnanayogi33.github.io/robot-defense/v3/)
**Problem:** The canvas was only 550px wide because we were shrinking it to fit the phone's short height. Lots of screen space wasted on the sidebar.
**Fix:** Switched to width-driven sizing — the canvas now fills 75% of the screen width (644px). A wrapper div clips the tiny bit of empty space at the bottom.

**What we learned:** `overflow: hidden` on a wrapper div is like a window frame. Make the window wider to see more of the canvas.

---

### [▶️ v4.0 — Play Anywhere (PWA)](https://jnanayogi33.github.io/robot-defense/v4/)
**Added two features that turn the website into a real app:**
1. **Home Screen App:** Save to iPhone home screen → opens fullscreen, no browser bar.
2. **Service Worker (`sw.js`):** A background script that auto-checks for updates every time you open the app. Works offline too.

**What we learned:** A PWA (Progressive Web App) is a website that behaves like an app. No App Store needed!

---

## Tech Stack
- Pure HTML + CSS + JavaScript (no libraries!)
- Canvas API for game rendering
- Service Worker for offline/auto-update
