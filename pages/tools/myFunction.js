export function textConvert(type, value) {
	if(type == 'month'){
		const monthConvert = {1:'一', 2:'二', 3:'三', 4:'四', 5:'五', 6:'六', 7:'七', 8:'八', 9:'九', 10:'十', 11:'十一', 12:'十二'}
		return monthConvert[value];
	}
}

export function dateID(yearMonth, date) {
	return yearMonth + (date < 10 ? 0 : '') + date;
}

export function calendarID(dateID) {
	return dateID.substring(0, 6);
}

export function getDate(dateID) {
	return dateID.substring(6);
}