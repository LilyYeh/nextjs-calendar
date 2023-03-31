import { query } from "./db";

export async function createEvent(data={}) {
	let column = `INSERT INTO events (date_id, calendar_id, date, event_type`;
	let values = ` VALUES (${data.date_id}, ${data.calendar_id}, ${data.date}, ${data.event_type}`;
	if(data.event_text || data.event_text_style) {
		column += `,event_text, event_text_style`;
		values += `,'${data.event_text}', '${data.event_text_style}'`;
	} else if(data.event_icon) {
		column += `,event_text`;
		values += `,'${data.event_icon}'`;
	}
	column += `)`;
	values += `)`;
	const insertSQL = column + values;
	await query({ query: insertSQL });
	return;
}

export async function getEvents() {
	const querySQL = `SELECT * FROM events`;
	const events = await query({ query: querySQL });
	return events;
}

export async function getEvent(date_id, event_type) {
	const querySQL = `SELECT * FROM events where date_id=${date_id} AND event_type=${event_type}`;
	const event = await query({ query: querySQL });
	return event;
}

export async function updateEvent(data) {
	if(data.event_text || data.event_text_style) {
		const updateSQL = `UPDATE events SET event_text='${data.event_text}', event_text_style='${data.event_text_style}' WHERE date_id=${data.date_id} AND event_type=${data.event_type}`;
		await query({ query: updateSQL });
	}

	if(data.event_icon) {
		const updateSQL = `UPDATE events SET event_text='${data.event_icon}' WHERE date_id=${data.date_id} AND event_type=${data.event_type}`;
		await query({ query: updateSQL });
	}
	return;
}

export async function deleteEvent(date_id, event_type) {
	const deleteSQL = `DELETE FROM events WHERE date_id=${date_id} AND event_type=${event_type}`;
	await query({ query: deleteSQL });
	return;
}