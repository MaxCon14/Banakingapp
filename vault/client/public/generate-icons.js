/**
 * Icon generator — run once to create PWA icons from icon.svg
 *
 * Prerequisites:
 *   npm install -g sharp-cli
 *
 * Usage (from vault/client/public/):
 *   node generate-icons.js
 */

const { execSync } = require('child_process')
const path = require('path')

const src = path.join(__dirname, 'icons', 'icon.svg')

const sizes = [192, 512]

for (const size of sizes) {
  const out = path.join(__dirname, 'icons', `icon-${size}.png`)
  execSync(`npx sharp-cli -i "${src}" -o "${out}" resize ${size} ${size}`)
  console.log(`Created icon-${size}.png`)
}

console.log('Done! Icons generated in public/icons/')
