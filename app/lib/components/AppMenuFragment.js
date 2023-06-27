import { X, html, css } from '../../../lib/common/x/X.js';

export class AppMenuFragment extends X {
	/** @override */
	render() {
		return html`
			<h2>General</h2>
			<a href="/app">Home</a>
			<a href="/app/reminders">Reminders</a>
			<h2>Account</h2>
			<a href="/auth/sign-out">Sign-out</a>
		`;
	}
}
customElements.define('x-app-menu-fragment', AppMenuFragment);