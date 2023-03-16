import {updateCalendar} from "../../../lib/db_calendars";

/*
 * return http status code / error message
 */
export default async function handler(req, res) {
	try {
		const data = JSON.parse(req.body).data;
		console.log(data)
		updateCalendar(data)
		res.status(200).json('ok');
	} catch (error) {
		res.status(500).json({ error:error.message });
	}
}