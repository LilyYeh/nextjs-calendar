import { createCalendar } from "../../../lib/db_calendars";

/*
 * return http status code / error message
 * a=黑桃, b=愛心, c=菱形, d=梅花
 */
export default async function handler(req, res) {
	try {
		await createCalendar(req);

		res.status(200);
	} catch (error) {
		res.status(500).json({ error:error.message });
	}
}