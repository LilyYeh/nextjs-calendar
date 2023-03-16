import { query } from "./db";

export async function createEvent(data={}) {
	let column = `INSERT INTO events (date_id, calendar_id, date, event_type`;
	let values = ` VALUES (${data.date_id}, ${data.calendar_id}, ${data.date}, ${data.event_type}`;
	if(data.event_text) {
		column += `,event_text, event_text_style`;
		values += `,'${data.event_text}', '${data.event_text_style}'`;
	}
	column += `)`;
	values += `)`;
	const insertSQL = column + values;
	await query({ query: insertSQL });

	if(data.event_icon) {
		const insertSQL = `INSERT INTO event_icon (date_id, event_icon) VALUES (${data.date_id},'${data.event_icon}')`;
		console.log(insertSQL)
		await query({ query: insertSQL });
	}
	return;
}

export async function getEvents() {
	const querySQL = `SELECT e.date_id, event_type, event_text, event_text_style, event_icon FROM events e
    					LEFT JOIN event_icon i ON e.date_id = i.date_id AND e.event_type=2`;
	const events = await query({ query: querySQL });
	return events;
}

export async function getEvent(date_id, event_type) {
	const querySQL = `SELECT * FROM events where date_id=${date_id} AND event_type=${event_type}`;
	const event = await query({ query: querySQL });
	return event;
}

export async function updateEvent(data) {
	if(data.event_text) {
		const updateSQL = `UPDATE events SET event_text='${data.event_text}' WHERE date_id=${data.date_id} AND event_type=${data.event_type}`;
		await query({ query: updateSQL });
	}

	if(data.event_icon) {
		const querySQL = `SELECT * FROM event_icon WHERE date_id=${data.date_id} AND event_icon='${data.event_icon}'`;
		const existIcon = await query({ query: querySQL });
		if(existIcon.length > 0){
			const deleteSQL = `DELETE FROM event_icon WHERE date_id=${data.date_id} AND event_icon='${data.event_icon}'`;
			await query({ query: deleteSQL });
			const querySQL = `SELECT * FROM event_icon WHERE date_id=${data.date_id}`;
			const isExistIcon = await query({ query: querySQL });
			console.log('isExistIcon',isExistIcon)
			if(!isExistIcon.length){
				const deleteSQL = `DELETE FROM events WHERE date_id=${data.date_id} AND event_type=${data.event_type}`;
				await query({ query: deleteSQL });
			}
		}else{
			const insertSQL = `INSERT INTO event_icon (date_id, event_icon) VALUES (${data.date_id}, '${data.event_icon}')`;
			await query({ query: insertSQL });
		}

	}
	return;
}

export async function deleteEvent(date_id, event_type) {
	const deleteSQL = `DELETE FROM events WHERE date_id=${date_id} AND event_type=${event_type}`;
	await query({ query: deleteSQL });
	return;
}