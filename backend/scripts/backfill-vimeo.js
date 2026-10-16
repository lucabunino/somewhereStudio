// Fills `vimeoData` (title, size, duration, thumbnail as Sanity image) on Vimeo modules from Vimeo's
// public oEmbed, same as the studio's "Fetch from Vimeo" button. Patches published docs and their drafts
// in place (no new drafts). Skips modules already filled for the same id/hash.
//
// Unlisted videos with a missing or truncated hash are invisible to oEmbed: with VIMEO_TOKEN set (env only,
// never stored), the script looks up the correct hash via the Vimeo API and corrects the `hash` field too.
//
// dry run:  npx sanity exec scripts/backfill-vimeo.js --with-user-token
// write:    npx sanity exec scripts/backfill-vimeo.js --with-user-token -- --write
// + hashes: VIMEO_TOKEN=... npx sanity exec scripts/backfill-vimeo.js --with-user-token -- --write
import {getCliClient} from 'sanity/cli'

const WRITE = process.argv.includes('--write')
const client = getCliClient({apiVersion: '2025-08-15'})

function vimeoSource(id, hash) {
	return id ? `${id.trim()}${hash?.trim() ? `/${hash.trim()}` : ''}` : null
}

async function fetchVimeoData(source) {
	const res = await fetch(
		`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${source}`)}&width=1920`,
	)
	if (!res.ok) throw new Error(res.status === 404 ? 'not found (check id / hash)' : `vimeo ${res.status}`)
	const data = await res.json()
	return {
		title: data.title,
		width: data.width,
		height: data.height,
		duration: data.duration,
		thumbnailUrl: data.thumbnail_url?.replace(/-d_\d+(x\d+)?/, '-d_1920'),
	}
}

// correct hash of an unlisted video, from the account's API (needs VIMEO_TOKEN)
async function lookupHash(id) {
	if (!process.env.VIMEO_TOKEN) return null
	const res = await fetch(`https://api.vimeo.com/videos/${id.trim()}?fields=player_embed_url`, {
		headers: {Authorization: `Bearer ${process.env.VIMEO_TOKEN}`},
	})
	if (!res.ok) return null
	const {player_embed_url} = await res.json()
	return new URL(player_embed_url).searchParams.get('h')
}

const docs = await client.fetch(
	`*[_type == "module" && kind == "vimeo" && defined(id)]{_id, title, id, hash, "filled": vimeoData.source}`,
)
// group drafts with their published doc, both get the same vimeoData
const byBase = new Map()
for (const d of docs) {
	const base = d._id.replace(/^drafts\./, '')
	byBase.set(base, [...(byBase.get(base) ?? []), d])
}

const report = {filled: 0, skipped: 0, failed: []}
for (const [base, group] of byBase) {
	const doc = group.find((d) => d._id === base) ?? group[0]
	let source = vimeoSource(doc.id, doc.hash)
	let fixedHash = null
	if (group.every((d) => d.filled === vimeoSource(d.id, d.hash))) {
		report.skipped++
		continue
	}
	try {
		let result
		try {
			result = await fetchVimeoData(source)
		} catch (err) {
			const hash = await lookupHash(doc.id)
			if (!hash || hash === doc.hash?.trim()) throw err
			fixedHash = hash
			source = vimeoSource(doc.id, hash)
			result = await fetchVimeoData(source)
		}
		const {thumbnailUrl, ...data} = result
		const fix = fixedHash ? `  [hash ${doc.hash?.trim() || '(none)'} -> ${fixedHash}]` : ''
		console.log(`${WRITE ? 'fill' : 'would fill'}  ${source.padEnd(22)} ${data.width}x${data.height}  ${data.title}${fix}`)
		if (WRITE) {
			let thumbnail
			if (thumbnailUrl) {
				const buffer = Buffer.from(await (await fetch(thumbnailUrl)).arrayBuffer())
				const asset = await client.assets.upload('image', buffer, {filename: `vimeo-${doc.id.trim()}.jpg`})
				thumbnail = {_type: 'image', asset: {_type: 'reference', _ref: asset._id}}
			}
			const vimeoData = {...data, thumbnail, source, fetchedAt: new Date().toISOString()}
			const tx = client.transaction()
			for (const d of group) tx.patch(d._id, (p) => p.set(fixedHash ? {vimeoData, hash: fixedHash} : {vimeoData}))
			await tx.commit({autoGenerateArrayKeys: true})
		}
		report.filled++
	} catch (err) {
		report.failed.push({id: base, title: doc.title, source, error: err.message})
		console.log(`FAILED      ${String(source).padEnd(22)} ${err.message}  (${doc.title ?? base})`)
	}
	await new Promise((r) => setTimeout(r, 250)) // be gentle with oEmbed
}

console.log(
	`\n${WRITE ? 'filled' : 'would fill'}: ${report.filled}, already filled: ${report.skipped}, failed: ${report.failed.length}`,
)
if (!WRITE) console.log('dry run, nothing written. Add `-- --write` to apply.')
