import { getCalendars } from "../../../lib/db_calendars";
import { getEvents } from "../../../lib/db_events";
import { getDateStyleList } from "../../../lib/db_date_style";

/*
 * return http status code / error message
 */
export default async function handler(req, res) {
	try {
		const calendars = await getCalendars();
		const events = await getEvents();
		const date_style_list = await getDateStyleList();
		res.status(200).json({calendars:calendars, events:events, date_style_list:date_style_list});
	} catch (error) {
		res.status(500).json({ error:error.message });
	}
}