import { query } from "./db";

export async function createCalendar(data={}) {
	const insertSQL = `INSERT INTO calendars (year, month, annotation) VALUES ('${data.year}', ${data.month}, ${data.annotation})`;
	await query({ query: insertSQL });
	return;
}

export async function getCalendars() {
	const querySQL = `SELECT *
					  FROM calendars `;
	const calendars = await query({ query: querySQL });
	return calendars;
}