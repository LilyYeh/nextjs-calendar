import {createEvent} from "../../../lib/db_events";

/*
 * return http status code / error message
 */
export default async function handler(req, res) {
	try {
		const data = JSON.parse(req.body).data;
		data.map((d)=>{
			createEvent(d);
		})
		res.status(200).json('ok');
	} catch (error) {
		res.status(500).json({ error:error.message });
	}
}