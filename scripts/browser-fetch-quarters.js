const items = [
  ['shumen', 'mtnitsa', 'mtnitsa-shumen-bg'],
  ['shumen', 'promishlena-zona-zapad', 'promishlena-zona-zapad-shumen-bg'],
  ['shumen', 'tophane', 'tophane-shumen-bg'],
  ['shumen', 'kurshun-cheshma', 'kurshun-cheshma-shumen-bg'],
  ['shumen', 'makak', 'makak-shumen-bg'],
  ['shumen', 'chashka', 'chashka-shumen-bg'],
  ['shumen', 'sakarka', 'sakarka-shumen-bg'],
  ['shumen', 'smese', 'smese-shumen-bg'],
  ['shumen', 'promishlena-zona-yug', 'promishlena-zona-yug-shumen-bg'],
  ['novi-pazar', 'centar', 'centar-novi-pazar-bg'],
  ['novi-pazar', 'zapad', 'zapad-novi-pazar-bg'],
  ['novi-pazar', 'iztok', 'iztok-novi-pazar-bg'],
  ['novi-pazar', 'vilna-zona', 'vilna-zona-novi-pazar-bg'],
]

;(async () => {
  const out = []
  for (const [city, slug, path] of items) {
    const t = await (await fetch(`https://realistimo.com/bg/buy/${path}/`)).text()
    const image = t.match(/og:image[^>]+content="([^"]+)"/)?.[1] ?? null
    out.push({ city, slug, image })
    await new Promise(r => setTimeout(r, 150))
  }
  return JSON.stringify(out)
})()
