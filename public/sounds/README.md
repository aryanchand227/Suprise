# Sound Files Required

Place the following `.mp3` audio files in this directory (`/public/sounds/`):

| File | Description | Usage |
|------|-------------|-------|
| `ambient-piano.mp3` | Soft looping ambient piano music | Plays on the book page (loops) |
| `unlock.mp3` | Metallic click / unlock sound | Plays when correct PIN is entered |
| `book-open.mp3` | Book opening sound (pages rustling) | Plays when user opens the book |
| `page-flip.mp3` | Single page flip sound | Plays on each page turn |

## Where to Get Audio

Free sources for these sounds:

- **Freesound** — https://freesound.org
  - Search: "piano ambient", "book pages", "lock click"
- **Pixabay** — https://pixabay.com/music/
  - Search: "ambient piano", "page flip"
- **Zapsplat** — https://www.zapsplat.com
  - Search: "lock click", "book page turn"

## Notes

- All audio is handled with graceful fallback — missing files won't crash the app
- Keep files small (< 500KB each) for fast loading
- Ambient piano should loop cleanly (no audible gap at the end)
- Page flip and unlock sounds should be short (< 2 seconds)
