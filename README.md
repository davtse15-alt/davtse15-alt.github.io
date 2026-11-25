# Playroom

A single-page game hub featuring **Drum Smash**, **Flex Paint**, and **Sound Steps**.

**Live site:** https://davtse15-alt.github.io/

## Adding another game

1. Add a 4:3 card image to `assets/`.
2. Add a new entry to the `GAMES` array in `app.js`:

```js
{
  id: 'my-new-game',
  title: 'My New Game',
  description: 'Short description shown on the card.',
  url: 'https://davtse15-alt.github.io/my-new-game/',
  image: 'assets/my-new-game.jpg',
  imageAlt: 'Illustration description',
  accent: '#e86b51',
  accentDeep: '#c75138',
}
```

3. Push to `main` — GitHub Pages updates automatically.
