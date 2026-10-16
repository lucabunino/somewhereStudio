import {useCallback, useEffect, useRef, useState} from 'react'
import {set, useClient, useFormValue} from 'sanity'
import {Box, Button, Card, Flex, Spinner, Text} from '@sanity/ui'
import {SyncIcon} from '@sanity/icons'
import {createImageUrlBuilder} from '@sanity/image-url'

// Fills `vimeoData` from Vimeo's public oEmbed (no token) when the module's id/hash change, and stores
// the thumbnail as a Sanity image, so the website never has to call Vimeo until someone presses play.
// Editors still only type the id (+ hash); old modules can be filled with the button or the backfill script.

export function vimeoSource(id, hash) {
	return id ? `${id}${hash ? `/${hash}` : ''}` : null
}

export async function fetchVimeoData(source) {
	const res = await fetch(
		`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${source}`)}&width=1920`,
	)
	if (!res.ok) throw new Error(res.status === 404 ? 'Video not found (check id / hash)' : `Vimeo error ${res.status}`)
	const data = await res.json()
	return {
		title: data.title,
		width: data.width,
		height: data.height,
		duration: data.duration,
		// oEmbed gives a 1280px thumbnail, the same file exists at 1920px
		thumbnailUrl: data.thumbnail_url?.replace(/-d_\d+(x\d+)?/, '-d_1920'),
	}
}

export function VimeoDataInput(props) {
	const {value, onChange} = props
	const id = useFormValue(['id'])
	const hash = useFormValue(['hash'])
	const client = useClient({apiVersion: '2025-08-15'})
	const source = vimeoSource(id?.trim(), hash?.trim())
	const initialSource = useRef(source)
	const [status, setStatus] = useState('idle')
	const [error, setError] = useState(null)

	const refresh = useCallback(async () => {
		if (!source) return
		setStatus('loading')
		setError(null)
		try {
			const {thumbnailUrl, ...data} = await fetchVimeoData(source)
			let thumbnail
			if (thumbnailUrl) {
				const blob = await (await fetch(thumbnailUrl)).blob()
				const asset = await client.assets.upload('image', blob, {filename: `vimeo-${id}.jpg`})
				thumbnail = {_type: 'image', asset: {_type: 'reference', _ref: asset._id}}
			}
			onChange(set({...data, thumbnail, source, fetchedAt: new Date().toISOString()}))
			setStatus('idle')
		} catch (err) {
			setError(err.message)
			setStatus('error')
		}
	}, [source, id, client, onChange])

	// auto-fetch only when the editor changes id/hash, never just by opening a document
	useEffect(() => {
		if (!source || source === initialSource.current || source === value?.source) return
		const timer = setTimeout(refresh, 800)
		return () => clearTimeout(timer)
	}, [source]) // eslint-disable-line react-hooks/exhaustive-deps

	const stale = source && value?.source && value.source !== source
	const thumbUrl = value?.thumbnail?.asset
		? createImageUrlBuilder(client).image(value.thumbnail).width(480).url()
		: null

	if (!source) {
		return (
			<Card padding={3} radius={2} tone="transparent" border>
				<Text size={1} muted>
					Enter the Vimeo id (and hash for unlisted videos): title, size and thumbnail are fetched automatically.
				</Text>
			</Card>
		)
	}

	return (
		<Card padding={3} radius={2} border tone={error ? 'critical' : stale ? 'caution' : 'default'}>
			<Flex gap={3} align="center">
				{thumbUrl && (
					<Box style={{flex: '0 0 160px'}}>
						<img src={thumbUrl} alt="" style={{width: '100%', display: 'block', borderRadius: 3}} />
					</Box>
				)}
				{/* plain elements with explicit spacing: @sanity/ui Text trims its line box, which made rows overlap */}
				<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, lineHeight: 1.45}}>
					{value?.title ? (
						<div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
							<div style={{fontWeight: 600, color: 'var(--card-fg-color)'}}>{value.title}</div>
							<div style={{color: 'var(--card-muted-fg-color)'}}>
								{value.width}×{value.height}
								{value.duration ? ` · ${Math.floor(value.duration / 60)}:${String(value.duration % 60).padStart(2, '0')}` : ''}
							</div>
						</div>
					) : (
						<div style={{color: 'var(--card-muted-fg-color)'}}>Not fetched from Vimeo yet.</div>
					)}
					{(stale || error) && (
						<div style={{display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--card-fg-color)'}}>
							{stale && <div>Id / hash changed since the last fetch.</div>}
							{error && <div>{error}</div>}
						</div>
					)}
					<div>
						<Button
							mode="ghost"
							fontSize={1}
							padding={2}
							icon={status === 'loading' ? Spinner : SyncIcon}
							text={value?.title ? 'Refresh from Vimeo' : 'Fetch from Vimeo'}
							disabled={status === 'loading'}
							onClick={refresh}
						/>
					</div>
				</div>
			</Flex>
		</Card>
	)
}
