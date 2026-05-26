// Paste in browser console on https://realistimo.com/bg/buy/shumen-bg/
const hrefs = [
  'https://realistimo.com/bg/buy/pozharnata-shumen-bg/',
  'https://realistimo.com/bg/buy/herson-shumen-bg/',
  'https://realistimo.com/bg/buy/pod-manastira-shumen-bg/',
  'https://realistimo.com/bg/buy/vtori-korpus-shumen-bg/',
  'https://realistimo.com/bg/buy/grivitsa-shumen-bg/',
  'https://realistimo.com/bg/buy/divizionna-bolnitsa-shumen-bg/',
  'https://realistimo.com/bg/buy/matematicheskata-gimnazia-shumen-bg/',
  'https://realistimo.com/bg/buy/tombul-djamia-shumen-bg/',
  'https://realistimo.com/bg/buy/mtnitsa-shumen-bg/',
  'https://realistimo.com/bg/buy/promishlena-zona-zapad-shumen-bg/',
  'https://realistimo.com/bg/buy/tophane-shumen-bg/',
  'https://realistimo.com/bg/buy/kurshun-cheshma-shumen-bg/',
  'https://realistimo.com/bg/buy/makak-shumen-bg/',
  'https://realistimo.com/bg/buy/chashka-shumen-bg/',
  'https://realistimo.com/bg/buy/sakarka-shumen-bg/',
  'https://realistimo.com/bg/buy/smese-shumen-bg/',
  'https://realistimo.com/bg/buy/promishlena-zona-yug-shumen-bg/',
]
;(async () => {
  const out = []
  for (const href of hrefs) {
    const t = await (await fetch(href)).text()
    const image = t.match(/property="og:image" content="([^"]+)"/)?.[1]
    out.push({ href, image })
    await new Promise(r => setTimeout(r, 120))
  }
  console.log(JSON.stringify(out, null, 2))
})()
