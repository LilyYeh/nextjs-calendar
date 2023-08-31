import {deleteDateStyle} from "../../../lib/db_date_style";

/*
 * return http status code / error message
 */
export default async function handler(req, res) {
	try {
		const date_id = JSON.parse(req.body).date_id;
		await deleteDateStyle(date_id);
		res.status(200).json('ok');
	} catch (error) {
		res.status(500).json({ error:error.message });
	}
}