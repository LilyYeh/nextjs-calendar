import {createCalendar, deleteCalendars} from "../../../lib/db_calendars";

/*
 * return http status code / error message
 */
export default async function handler(req, res) {
	try {
		const calendarID = JSON.parse(req.body).calendarID;
		await deleteCalendars(calendarID);
		res.status(200).json('ok');
	} catch (error) {
		res.status(500).json({ error:error.message });
	}
}