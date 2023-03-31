import { query } from "./db";

export async function createCalendar(data={}) {
	const insertSQL = `INSERT INTO calendars (id, year, month, annotation) VALUES ( '${data.id}', '${data.year}', ${data.month}, '${JSON.stringify(data.annotation)}' )`;
	await query({ query: insertSQL });
	return;
}

export async function getCalendars() {
	const querySQL = `SELECT *
					  FROM calendars `;
	const calendars = await query({ query: querySQL });
	return calendars;
}

export async function deleteCalendars(id) {
	let deleteSQL = `DELETE FROM calendars WHERE id=${id}`;
	await query({ query: deleteSQL });

	deleteSQL = `DELETE FROM events WHERE calendar_id=${id}`;
	await query({ query: deleteSQL });

	deleteSQL = `DELETE FROM date_style WHERE date_id LIKE '${id}%'`;
	await query({ query: deleteSQL });

	return;
}

export async function updateCalendar(data) {
	const updateSQL = `UPDATE calendars SET annotation='${JSON.stringify(data.annotation)}' WHERE id=${data.id}`;
	await query({ query: updateSQL });

	return;
}