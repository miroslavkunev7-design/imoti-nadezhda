import fs from 'fs'
import dns from 'dns/promises'
import mysql from 'mysql2/promise'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      const key = l.slice(0, i).trim()
      let val = l.slice(i + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      return [key, val]
    })
)

console.log('Host:', env.DB_HOST)
console.log('Database:', env.DB_NAME)
console.log('User:', env.DB_USER)

try {
  const resolved = await dns.lookup(env.DB_HOST)
  console.log('DNS OK ->', resolved.address)
} catch (e) {
  console.log('DNS FAIL:', e.code || e.message)
  process.exit(1)
}

try {
  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT || '3306', 10),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    connectTimeout: 10000,
  })

  const [cities] = await conn.execute('SELECT COUNT(*) as c FROM cities')
  const [props] = await conn.execute('SELECT COUNT(*) as c FROM properties')
  const [users] = await conn.execute(
    "SELECT id, email, role FROM users WHERE role IN ('admin','agent') LIMIT 5"
  )

  console.log('DB OK')
  console.log('Cities:', cities[0].c)
  console.log('Properties:', props[0].c)
  console.log(
    'Admin/Agent users:',
    users.length ? users.map((u) => `${u.email} (${u.role})`).join(', ') : 'none'
  )

  await conn.end()
} catch (e) {
  console.log('DB FAIL:', e.code || e.message)
  process.exit(1)
}
