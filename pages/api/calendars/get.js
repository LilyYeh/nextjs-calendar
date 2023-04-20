import { getCalendars } from "../../../lib/db_calendars";
import { getEvents } from "../../../lib/db_events";
import { getDateStyleList } from "../../../lib/db_date_style";

/*
 * return http status code / error message
 */
export default async function handler(req, res) {
	try {
		const calendar_id = req.query.calendar_id;
		const calendars = await getCalendars(calendar_id);
		let calendar_ids = [], events = [], date_style_list = [];
		if(calendars.length > 0){
			calendar_ids = calendars.map((item, index, array) => { return item.id })
			events = await getEvents(calendar_ids);
			date_style_list = await getDateStyleList(calendar_ids);
		}
		res.status(200).json({calendars:calendars, events:events, date_style_list:date_style_list??[]});
	} catch (error) {
		res.status(500).json({ error:error.message });
	}
}