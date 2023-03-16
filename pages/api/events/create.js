import {createEvent, getEvent, updateEvent, deleteEvent} from "../../../lib/db_events";

/*
 * return http status code / error message
 */
export default async function handler(req, res) {
	try {
		const data = JSON.parse(req.body).data;
		console.log(data)
		data.map(async (d)=>{
			const event = await getEvent(d.date_id, d.event_type);
			if(event.length > 0){
				if(d.event_type==1 && d.event_text.length == 0){
					await deleteEvent(d.date_id, d.event_type);
				}else{
					await updateEvent(d)
				}
			}else{
				await createEvent(d);
			}
		})
		res.status(200).json('ok');
	} catch (error) {
		res.status(500).json({ error:error.message });
	}
}