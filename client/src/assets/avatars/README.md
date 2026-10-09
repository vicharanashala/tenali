# Avatar illustrations

Drop generated portraits here and they are picked up automatically — the glob in
`client/src/avatarAssets.js` runs at build time, so there is nothing to register
and no code to edit. A face with no image keeps rendering its SVG, so a
part-finished set is safe to ship.

```
avatars/
  tenali/<face>.png          # serves every skin
  tenali/royal/<face>.png    # optional, overrides the above for that skin
  tenali/scholar/<face>.png
  student/<face>.png
```

Names must match exactly (lowercase, `.png` or `.webp`).

**Tenali — 14 faces.** Every expression the app passes resolves to one of these:

| file | also used for |
| --- | --- |
| `neutral.png` | `happy`, and anything unrecognised |
| `thinking.png` | |
| `confident.png` | |
| `gamble.png` | |
| `victory.png` | `celebrating`, `cheering` |
| `loss.png` | |
| `cheated.png` | |
| `closed-eyes.png` | |
| `writing.png` | |
| `hinting.png` | |
| `smirk.png` | `recalculating`, `talking` |
| `confused.png` | `encouraging` |
| `shocked.png` | |
| `proud.png` | `impressed` |

**Student — 14 faces:** `attentive`, `pondering`, `confident`, `curious`,
`triumphant`, `puzzled`, `noting`, `nervous`, `dejected`, `amazed`, `blinking`,
`suspicious`, `delighted`, `determined`. The alias table lives at the top of
`StudentAvatar.jsx`.

Export square (1:1), 512px is plenty for the 106px board frame, transparent
outside the badge.
