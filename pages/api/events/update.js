import {createEvent, getEvent, updateEvent, deleteEvent} from "../../../lib/db_events";

/*
 * return http status code / error message
 * {
 * 		date_id:20240303
 * 		'1':{}
 * 		'2':{}
 * }
 */
export default async function handler(req, res) {
    try {
        const data = JSON.parse(req.body).data;
        const date_id = data.date_id;
        const myEventType = [1,2];
        myEventType.map(async (type)=>{
            if(Object.keys(data[type]).length > 0){
                const event = await getEvent(date_id, type);
                if(event.length > 0){
                    await updateEvent(data[type])
                }else{
                    await createEvent(data[type]);
                }
            }else{
                await deleteEvent(date_id, type);
            }
        });
        res.status(200).json('ok');
    } catch (error) {
        res.status(500).json({ error:error.message });
    }
}