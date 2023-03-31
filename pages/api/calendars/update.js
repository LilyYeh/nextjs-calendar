import {updateCalendar} from "../../../lib/db_calendars";

/*
 * return http status code / error message
 */
export default async function handler(req, res) {
	try {
		const calendarID = JSON.parse(req.body).calendarID;
		const annotation = JSON.parse(req.body).annotation;
		await updateCalendar({id:calendarID,annotation:annotation});
		res.status(200).json('ok');
	} catch (error) {
		res.status(500).json({ error:error.message });
	}
}