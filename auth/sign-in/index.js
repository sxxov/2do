import { AuthManager } from '../../app/lib/core/AuthManager.js';
import { X, css, html, spread } from '../../lib/common/x/X.js';
import { Button } from '../../lib/components/Button.js';
import '../../lib/components/Input.js';
import { Input } from '../../lib/components/Input.js';
import '../../lib/components/Ripples.js';
import { Toast } from '../../lib/components/Toast.js';
import { Toaster } from '../../lib/components/Toaster.js';
import '../../lib/layout/Main.js';

export class AuthSignInRoute extends X {
	/** @override */
	render() {
		return html`
			<x-main>
				<div class="sign-in">
					<div class="content">
						<div class="heading">
							<h5>Sign-in</h5>
						</div>
						<form
							id="sign-in"
							@keydown="${(/** @type {KeyboardEvent} */ e) => {
								if (e.key === 'Enter') {
									// blur focus from input to emit `change` event
									/** @type {HTMLElement} */ (
										e.target
									)?.blur?.();

									e.preventDefault();
									e.stopPropagation();
									/** @type {HTMLFormElement} */ (
										e.currentTarget
									).dispatchEvent(
										new SubmitEvent('submit', {
											cancelable: true,
											composed: true,
											bubbles: true,
										}),
									);
								}
							}}"
							@submit="${async (/** @type {SubmitEvent} */ e) => {
								e.preventDefault();

								const form = new FormData(
									/** @type {HTMLFormElement} */ (e.target),
								);

								const username = String(form.get('username'));
								const password = String(form.get('password'));

								const [res, err] =
									await AuthManager.instance.signIn(
										username,
										password,
									);

								if (err) {
									for (const { message } of err)
										Toaster.toast(
											message,
											Toast.variants.error,
										);
									return;
								}

								Toaster.toast(
									'Successfully signed in',
									Toast.variants.ok,
								);

								if (res.redirect != null)
									location.href = res.redirect;
							}}"
						>
							<x-input
								label="Username"
								name="username"
								type="current-username"
								autocomplete="username"
								required
								minlength="3"
								maxlength="20"
								pattern="\\w_-"
							>
								<x-i slot="left">account_circle</x-i>
							</x-input>
							<x-input
								label="Password"
								name="password"
								type="password"
								autocomplete="username"
								required
								minlength="8"
								maxlength="255"
							>
								<x-i slot="left">password</x-i>
							</x-input>
							<x-button
								${spread(Button.variants.primary)}
								type="submit"
							>
								<x-i slot="left">login</x-i>
								Sign-in
								<x-i slot="right">_</x-i>
							</x-button>
							<!-- <x-button
							@click="${() => (location.href = '/auth/sign-up')}"
							${spread(Button.variants.secondary)}
							><x-i slot="left">person_add</x-i>Sign-up</x-button
						> -->
							<div class="sign-up">
								<h4>Don't have an account?</h4>
								<a href="/auth/sign-up">Sign-up</a>
							</div>
							<!-- <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
							>Privacy Policy</a
						> -->
						</form>
					</div>
				</div>
			</x-main>
		`;
	}

	/** @override */
	static styles = [
		...super.styles,
		css`
			.sign-in {
				padding: var(----padding);
				box-sizing: border-box;

				display: flex;
				flex-direction: column;
				gap: 14px;
				align-items: center;
				justify-content: center;
			}

			.sign-in > .content {
				display: flex;
				flex-direction: column;
				gap: 42px;

				width: 100%;
				max-width: 400px;
			}

			.sign-in > .content > .heading {
				text-align: center;
			}

			.sign-in > .content > .heading > h1 {
				margin-top: 0;
				/* margin-bottom: 0.4em; */
			}

			.sign-in > .content > form {
				display: flex;
				flex-direction: column;
				gap: 14px;

				width: 100%;
				align-items: center;
			}

			.sign-in > .content > form > x-button {
				width: 100%;
			}

			.sign-in > .content > form > .sign-up {
				text-align: center;
				font-weight: 700;
				text-transform: uppercase;
			}
		`,
	];
}
customElements.define('x-index', AuthSignInRoute);
