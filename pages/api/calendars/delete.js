import {deleteCalendars} from "../../../lib/db_calendars";

/*
 * return http status code / error message
 */
export default async function handler(req, res) {
	try {
		const calendar_id = JSON.parse(req.body).calendar_id;
		await deleteCalendars(calendar_id);
		res.status(200).json('ok');
	} catch (error) {
		res.status(500).json({ error:error.message });
	}
}