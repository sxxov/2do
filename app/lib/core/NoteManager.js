/**
 * @typedef {{
 * 	id: string;
 * 	title: string;
 * 	description: string;
 * 	done: boolean;
 * 	priority: NotePriority;
 * 	owner: {
 * 		id: string;
 * 		username: string;
 * 		email: string;
 * 		peepeepoopoo: 'peepeepoopoo';
 * 	};
 * 	dateCreated: Date;
 * 	dateModified: Date;
 * 	peepeepoopoo: string;
 * }} Note
 */

import { AuthManager } from './AuthManager.js';

/** @typedef {OneOf<NoteSortKinds>} NoteSortKind */
export const NoteSortKinds = /** @type {const} */ ({
	DATE_CREATED: 'date-created',
	DATE_MODIFIED: 'date-modified',
	ALPHANUMERIC: 'alphanumeric',
});

/** @typedef {OneOf<NotePriorities>} NotePriority */
export const NotePriorities = /** @type {const} */ ({
	NORMAL: 0,
	IMPORTANT: 1,
	URGENT: 2,
});

/** @typedef {OneOf<NoteSorters>} NoteSorter */
export const NoteSorters = {
	[NoteSortKinds.DATE_CREATED]: (
		/** @type {Note} */ a,
		/** @type {Note} */ b,
	) => (a.dateCreated < b.dateCreated ? -1 : 1),
	[NoteSortKinds.DATE_MODIFIED]: (
		/** @type {Note} */ a,
		/** @type {Note} */ b,
	) => (a.dateModified < b.dateModified ? -1 : 1),
	[NoteSortKinds.ALPHANUMERIC]: (
		/** @type {Note} */ a,
		/** @type {Note} */ b,
	) => a.title.localeCompare(b.title),
};

export class NoteManager {
	static instance = new NoteManager();

	async create(
		/**
		 * @type {{
		 * 	title: string;
		 * 	description: string;
		 * }}
		 */ note,
	) {
		let data;
		try {
			const res = await fetch(`/api/v1/note/create`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(note),
			});

			data = await res.json();
		} catch (err) {
			return [undefined, [new Error('Network error', { cause: err })]];
		}

		if (!data.ok) {
			switch (data.error.code) {
				case 'INVALID':
					return [
						undefined,
						[
							new Error(
								"Attempted to create a note that didn't have all the required props",
								{ cause: data.error },
							),
						],
					];
				default:
					return [
						undefined,
						[
							new Error(
								data.error.message ??
									`Failed to create note (${data.error.code})`,
								{ cause: data.error },
							),
						],
					];
			}
		}

		return [data.note, undefined];
	}

	edit(
		/** @type {Note} */ src,
		/**
		 * @type {Partial<{
		 * 	title: string;
		 * 	description: string;
		 * 	done: boolean;
		 * 	priority: NotePriority;
		 * }>}
		 */ { title, description, done, priority },
	) {
		src = { ...src };

		if (title) src.title = title;
		if (description) src.description = description;
		if (done) src.done = done;
		if (priority) src.priority = priority;
		if (title || description) src.dateModified = new Date();

		return src;
	}

	/** @returns {Promise<ResultStrict<{}>>} */
	async propagate(/** @type {Note} */ note) {
		let data;
		try {
			const res = await fetch(`/api/v1/note/edit`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id: note.id,
					title: note.title,
					description: note.description,
					done: note.done,
					priority: note.priority,
				}),
			});

			data = await res.json();
		} catch (err) {
			return [undefined, [new Error('Network error', { cause: err })]];
		}

		if (!data.ok) {
			switch (data.error.code) {
				case 'NOT_FOUND':
					return [
						undefined,
						[
							new Error(
								'Note not found. It may have been deleted by another session.',
								{
									cause: data.error,
								},
							),
						],
					];
				default:
					return [
						undefined,
						[
							new Error(
								data.error.message ??
									`Failed to update note (${data.error.code})`,
								{
									cause: data.error,
								},
							),
						],
					];
			}
		}

		return [data.data, undefined];
	}

	/** @returns {Promise<ResultVoid>} */
	async delete(/** @type {Note} */ note) {
		let data;
		try {
			const res = await fetch(`/api/v1/note/delete`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id: note.id,
				}),
			});

			data = await res.json();
		} catch (err) {
			return [undefined, [new Error('Network error', { cause: err })]];
		}

		if (!data.ok) {
			switch (data.error.code) {
				case 'NOT_FOUND':
					return [
						undefined,
						[
							new Error(
								'Note not found. It may have already been deleted',
								{
									cause: data.error,
								},
							),
						],
					];
				default:
					return [
						undefined,
						[
							new Error(
								data.error.message ??
									`Failed to delete note (${data.error.code})`,
								{
									cause: data.error,
								},
							),
						],
					];
			}
		}

		return [undefined, undefined];
	}

	/** @returns {Promise<ResultReasoned<Note[]>>} */
	async getAll() {
		let data;
		try {
			const res = await fetch('/api/v1/note/all');

			data = /**
			 * @type {ApiAny<
			 * 	{
			 * 		id: string;
			 * 		title: string;
			 * 		description: string;
			 * 		done: boolean;
			 * 		priority: NotePriority;
			 * 		owner: string;
			 * 		dateCreated: string;
			 * 		dateModified: string;
			 * 		peepeepoopoo: 'peepeepoopoo';
			 * 	}[]
			 * >}
			 */ (await res.json());
		} catch (err) {
			return [
				undefined,
				[
					new Error('Network error', {
						cause: err,
					}),
				],
			];
		}

		if (!data.ok)
			return [
				undefined,
				[
					new Error(data.error.message ?? 'Failed to fetch notes', {
						cause: data.error,
					}),
				],
			];

		/** @type {[Error, ...Error[]] | undefined} */
		let err;
		return [
			await Promise.all(
				data.data.map(async (note) => {
					const dateCreated = new Date(note.dateCreated);
					const dateModified = new Date(note.dateModified);

					const [userRes, userErr] =
						await AuthManager.instance.getUser(note.owner);

					if (userErr)
						if (err) err.push(...userErr);
						else err = [...userErr];

					return {
						id: note.id,
						title: note.title,
						description: note.description,
						done: note.done,
						priority: note.priority,
						owner: {
							id: note.owner,
							username: '<unknown>',
							email: '<unknown>',
							peepeepoopoo: 'peepeepoopoo',

							...userRes?.data,
						},
						dateCreated,
						dateModified,
						peepeepoopoo: note.peepeepoopoo,
					};
				}),
			),
			err,
		];
	}
}
