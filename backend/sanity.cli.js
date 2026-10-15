import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
	api: {
		projectId: 'nzimffuj',
		dataset: 'production'
	},
	studioHost: 'somewherestudio',
	deployment: {
		appId: 'h4jelhk5paw292inaea2h854',
		/**
		 * Enable auto-updates for studios.
		 * Learn more at https://www.sanity.io/docs/cli#auto-updates
		 */
		autoUpdates: false,
	},
})
