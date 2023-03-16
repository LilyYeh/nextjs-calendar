import { query } from "./db";

export async function createCalendar(data={}) {
	const insertSQL = `INSERT INTO calendars (id, year, month, annotation) VALUES ('${data.id}', '${data.year}', ${data.month}, ${JSON.stringify(data.annotation)})`;
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
	const deleteSQL = `DELETE FROM calendars WHERE id=${id}`;
	await query({ query: deleteSQL });
	return;
}

export async function updateCalendar(data) {
	const icon = data.annotation.icon;
	const value = data.annotation.value;

	const selectSQL = `select REPLACE(REPLACE(JSON_SEARCH(annotation, 'one', '${icon}'),'"',''),'icon','value') as k from calendars where id=${data.id}`;
	const jsonKey = await query({ query: selectSQL });

	if(jsonKey[0].k){
		const updateSQL = `UPDATE calendars
							SET annotation = JSON_SET(annotation, '${jsonKey[0].k}', '${value}')
							WHERE id=${data.id}`;
		await query({ query: updateSQL });
	}else{
		//add json data in annotation
	}

	return;
}