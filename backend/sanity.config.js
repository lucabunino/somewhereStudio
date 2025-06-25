import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {myStructure} from './structure.js'
import {colorInput} from '@sanity/color-input'
import {media, mediaAssetSource} from 'sanity-plugin-media'

const singletonActions = new Set(['publish', 'discardChanges', 'restore'])
const singletonTypes = new Set(['homepage', 'about', 'info', 'seo'])

export default defineConfig({
	name: 'default',
	title: 'Somewhere Studio',

	projectId: 'nzimffuj',
	dataset: 'production',

	plugins: [
		structureTool({
			structure: myStructure,
		}),
		media(),
		visionTool(),
		colorInput(),
	],
	schema: {
		types: schemaTypes,
		templates: (templates) =>
			templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
	},
	document: {
		actions: (input, context) =>
			singletonTypes.has(context.schemaType)
				? input.filter(({ action }) => action && singletonActions.has(action))
				: input,
	},
	form: {
		file: { assetSources: sources => sources.filter(s => s === mediaAssetSource) },
		image: { assetSources: sources => sources.filter(s => s === mediaAssetSource) }
	}
})