import { query } from "./db";

export async function updateDateStyle(data) {
    const updateSQL = `UPDATE date_style SET style='${JSON.stringify(data.date_style)}' WHERE date_id=${data.date_id}`;
    await query({ query: updateSQL });
    return;
}

export async function getDateStyle(date_id) {
    const querySQL = `SELECT * FROM date_style WHERE date_id=${date_id}`;
    const date_style = await query({ query: querySQL });
    return date_style;
}

export async function getDateStyleList(calendar_ids) {
    const querySQL = `SELECT * FROM date_style WHERE date_id LIKE "${calendar_ids.join('%" OR date_id LIKE "')}%"`;
    const date_styles = await query({ query: querySQL });
    return date_styles;
}

export async function createDateStyle(data) {
    const insertSQL = `INSERT INTO date_style (date_id, style) VALUES ( '${data.date_id}', '${JSON.stringify(data.date_style)}')`;
    await query({ query: insertSQL });
    return;
}

export async function deleteDateStyle(date_id) {
    let deleteSQL = `DELETE FROM date_style WHERE date_id=${date_id}`;
    await query({ query: deleteSQL });

    return;
}