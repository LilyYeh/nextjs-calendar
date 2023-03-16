import { getCalendars } from "../../../lib/db_calendars";
import { getEvents } from "../../../lib/db_events";

/*
 * return http status code / error message
 */
export default async function handler(req, res) {
	try {
		const calendars = await getCalendars();
		const events = await getEvents();
		res.status(200).json({calendars:calendars, events:events});
	} catch (error) {
		res.status(500).json({ error:error.message });
	}
}