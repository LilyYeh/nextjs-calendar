import { getCalendars } from "../../../lib/db_calendars";

/*
 * return http status code / error message
 * a=黑桃, b=愛心, c=菱形, d=梅花
 */
export default async function handler(req, res) {
	try {
		const calendars = await getCalendars();
		res.status(200).json(calendars);
	} catch (error) {
		res.status(500).json({ error:error.message });
	}
}