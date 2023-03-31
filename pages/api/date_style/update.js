import {updateDateStyle, getDateStyle, createDateStyle} from "../../../lib/db_date_style";

/*
 * return http status code / error message
 */
export default async function handler(req, res) {
    try {
        const data = JSON.parse(req.body);
        const current = await getDateStyle(data.date_id);
        console.log(data)
        if(current.length > 0) {
            await updateDateStyle(data);
        }else {
            await createDateStyle(data);
        }

        res.status(200).json('ok');
    } catch (error) {
        res.status(500).json({ error:error.message });
    }
}