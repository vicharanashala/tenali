# 🐾 Dog Mascot Widget

A friendly floating dog character that sticks to the bottom-right corner of
your kids' learning platform and greets learners, cheers them on, and reacts
to what's happening in the app.

Built as a plain **Web Component** (`<dog-mascot>`), so it drops into *any*
stack — static HTML, React, Vue, Angular, Svelte, Next.js, etc. — with no
build step and no dependencies.

## Files

```
dog-mascot/
├── dog-mascot.js     the component (self-contained, ~7KB unminified)
├── mascot-dog.png    the mascot artwork (transparent background)
├── demo.html          standalone demo you can open directly in a browser
└── README.md          this file
```

## 1. Copy into your repo

Copy `dog-mascot.js` and `mascot-dog.png` into your project, e.g.
`src/components/dog-mascot/`. Keep them together, or pass a different
`image` path/URL as shown below.

## 2. Plain HTML / any framework

```html
<script src="/path/to/dog-mascot.js"></script>
<dog-mascot image="/path/to/mascot-dog.png" name="Buddy"></dog-mascot>
```

Place it once, near the end of `<body>`, on whichever pages should show it
(e.g. a shared layout/header component). It's `position: fixed`, so it will
stay pinned to the corner as the page scrolls.

## 3. React

```jsx
import { useEffect, useRef } from "react";
import "./dog-mascot.js"; // registers <dog-mascot>

export function Mascot() {
  const ref = useRef(null);

  // Example: greet again on a specific event
  useEffect(() => {
    ref.current?.say("Welcome to your dashboard!");
  }, []);

  return <dog-mascot ref={ref} image="/mascot-dog.png" name="Buddy" />;
}
```

## 4. Vue

```vue
<template>
  <dog-mascot image="/mascot-dog.png" name="Buddy" ref="mascot" />
</template>
<script setup>
import "./dog-mascot.js";
</script>
```

(Vue treats unknown tags with a hyphen as custom elements automatically.)

## Attributes

| Attribute        | Default          | Description                                        |
|-------------------|------------------|----------------------------------------------------|
| `image`           | `mascot-dog.png` | Path/URL to the mascot image                        |
| `name`            | `Buddy`          | Used in default greeting lines                      |
| `greeting`        | *(random)*       | Override the first message shown on load            |
| `idle-messages`   | `true`           | Set to `"false"` to disable the occasional idle tip |
| `position`        | `bottom-right`   | Or `bottom-left`                                    |

## Talking to the mascot from your app

Grab the element and call its methods whenever something happens in your app
— a correct quiz answer, a finished lesson, a page load, etc.

```js
const buddy = document.querySelector("dog-mascot");

buddy.say("Let's learn about the water cycle!");
buddy.celebrate();               // happy bounce + a cheer, e.g. after a correct answer
buddy.encourage();               // gentle "try again" line, e.g. after a wrong answer
buddy.think("Checking your answer...");
```

Each call also fires a `mascot:message` event you can listen for (useful for
analytics or a subtitle/caption panel):

```js
document.addEventListener("mascot:message", (e) => {
  console.log(e.detail.text, e.detail.mood);
});
```

## Customizing the messages

All the default lines live at the top of `dog-mascot.js` in a few small
arrays (`WELCOME_LINES`, `IDLE_LINES`, `CELEBRATE_LINES`, `ENCOURAGE_LINES`,
`THINK_LINES`, `CLICK_LINES`) — edit or translate them directly, no build
tools required.

## Accessibility & good citizenship

- The bubble uses `aria-live="polite"` so screen readers announce new lines.
- The button is keyboard-focusable and has a visible focus ring.
- Respects `prefers-reduced-motion` (disables the bounce/idle animations).
- No tracking, no external requests — everything runs locally.

## Try it now

Open `demo.html` in a browser (no server needed) to see it in action, or run
a tiny local server, e.g. `python3 -m http.server`, from this folder.
