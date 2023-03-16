import styles from "../../styles/Home.module.scss";
import {textConvert, dateID} from "../tools/myFunction";
import {useMemo} from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCalendarXmark} from '@fortawesome/free-solid-svg-icons';

export default function calendar({calendar, activities, activityType, removeCalendar, openSetting, vaStyle}) {
	const setting = (e) => {
		let tdElement = e.target.closest('.'+styles.item);
		tdElement.classList.add(styles.active);
		openSetting(tdElement, tdElement.offsetLeft, tdElement.offsetTop, tdElement.offsetWidth, tdElement.offsetHeight);
	}

	const setAnnotation = async (icon, value) => {
		await apiUpdateCalendar({id:calendar.id, annotation:{icon:icon, value:value}})
	}

	const apiUpdateCalendar = async (data) => {
		const apiUrlEndpoint = `/api/calendars/update`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				data: data
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
	}

	const myVaStyle = useMemo(() => {
		if(vaStyle == 1){
			return {
				className: 'Vacation',
			}
		}else if(vaStyle == 2){
			return {
				className: 'Rabbit',
			}
		}
	},[vaStyle]);
	return (
		<div className={styles.calendar} ref={calendar.ref}>
			<div className={styles.head}>
				<h3 className={styles.title}><span className={styles.year}>{calendar.year}年</span> / {textConvert('month', calendar.month)}月</h3>
				<button className={styles.deleteBtn} onClick={() => removeCalendar(calendar.id)}><FontAwesomeIcon icon={faCalendarXmark} /></button>
			</div>
			<table>
				<thead>
				<tr>
					<th>一</th>
					<th>二</th>
					<th>三</th>
					<th>四</th>
					<th>五</th>
					<th>六</th>
					<th>日</th>
				</tr>
				</thead>
				<tbody>
				{
					calendar.calendar.map((week, w) => {
						return(
							<tr key={w}>
								{
									week.map((date, d) => {
										let myDateID = dateID(calendar.id, date);
										//let activity = d >= 5 && date > 0 ? (activities[myDateID] ? activities[myDateID] : myVaStyle.className ) : (activities[myDateID] ? activities[myDateID] : '');
										return (
											<td className={styles.item} key={d} dateid={myDateID}
											    onClick={ date > 0 ? (e) => setting(e) : () => { return; } } >
												{date > 0 ? <label className={`${styles.date}`} color={d>=5?'red':''}>{date}</label> : ''}
												{activities[myDateID]? (activities[myDateID][activityType.icon]? <div className={`${styles.icon}`}>
													{
														activities[myDateID][activityType.icon].map((icon,i)=>{
															return (
																<span key={i} icon={icon}></span>
															)
														})
													}
												</div> : '') : ''}
												{activities[myDateID]? (activities[myDateID][activityType.text]? <div className={`${styles.text}`} color='blue'>{activities[myDateID][activityType.text]}</div> : '') : ''}
											</td>
										)
									})
								}
							</tr>
						);
					})
				}
				</tbody>
			</table>
			<ul className={styles.annotation}>
				{
					calendar.annotation.map((icon,i) => {
						return(
							<li key={i} icon={icon.icon}>{
								icon.value==''?
									<span className={styles.clickInsert}>
										<input type="text" placeholder="點擊輸入" onChange={(e) => {
											let resize = (e.target.value.length + 1.5) * 10;
											e.target.style.width = (resize < 100 ? (resize > 50 ? resize : 50) : 100 ) + 'px';
											setAnnotation(icon.icon, e.target.value);
										}}/>
									</span> : <span className={styles.word}>{icon.value}</span>
							}</li>
						);
					})
				}
			</ul>
		</div>
	)
}