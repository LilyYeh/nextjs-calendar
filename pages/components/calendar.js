import styles from "../../styles/Home.module.scss";
import {textConvert, dateID} from "../tools/myFunction";
import {useEffect, useMemo, useState} from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCalendarXmark} from '@fortawesome/free-solid-svg-icons';

export default function calendar({calendar, dateStyleLists, activities, activityType, iconValueDefault, removeCalendar, openSetting}) {
	//不知道為什麼帶入 dateStyleLists[calendar.id] 在 useEffect 沒反應...？
	const dateStyleList = dateStyleLists[calendar.id]?? {};
	const setting = (e) => {
		let tdElement = e.target.closest('.'+styles.item);
		tdElement.classList.add(styles.active);
		openSetting(tdElement, tdElement.offsetLeft, tdElement.offsetTop, tdElement.offsetWidth, tdElement.offsetHeight);
	}

	//icon 註釋
	const [annotation, setAnnotation] = useState([]);
	useEffect(() => {
		const newAnnotation = [];
		if(Object.keys(activities).length > 0) {
			for (const [date, value] of Object.entries(activities)){
				if(value[activityType.icon]){
					value[activityType.icon].forEach((icon) => {
						const myIcon = calendar.annotation.find(item => item.icon == icon);
						const myNewIcon = newAnnotation.find(item => item.icon == icon);
						if(myIcon){
							if(!myNewIcon) newAnnotation.push(myIcon);
						}else if(!myIcon && !myNewIcon){
							newAnnotation.push({icon:icon, value:iconValueDefault[icon]});
						}
					});
				}
				if(newAnnotation.length >= Object.keys(iconValueDefault).length) break;
			}
		}

		if(Object.keys(dateStyleList).length > 0){
			for (const [date, value] of Object.entries(dateStyleList)){
				if(value.circle){
					const circleAnno = calendar.annotation.find(item => item.icon == 'circle' && item.value !== '');
					const myNewIcon = newAnnotation.find(item => item.icon == 'circle' && item.value !== '');
					if(circleAnno){
						if(!myNewIcon) newAnnotation.push({icon:'circle', value:circleAnno.value});
					}else if(!circleAnno && !myNewIcon){
						newAnnotation.push({icon:'circle', value:''});
					}
					break;
				}
			}
		}
		setAnnotation(newAnnotation);
	},[activities, dateStyleLists]);

	const updatingAnnotation = async (updating, el) => {
		const targetParent = el.closest('li');
		if(updating) {
			const focusEl = targetParent.querySelector('.' + styles.clickInsert + ' input');
			focusEl.style.display = 'initial';
			focusEl.focus();
			el.closest('.' + styles.word).style.display = 'none';
		}else{
			const wordEl = targetParent.querySelector('.' + styles.word)
			wordEl.style.display = 'initial'
			el.closest('.' + styles.clickInsert + ' input').style.display = 'none';
			await apiUpdateCalendar(calendar.id, annotation);
		}
	}

	const onChangeAnnotation = async (icon, el) => {
		let resize = (el.value.length + 1.5) * 10;
	    el.style.width = (resize < 100 ? (resize > 50 ? resize : 50) : 100 ) + 'px';

		const myAnnotation = [...annotation];
		const myIcon = myAnnotation.find(item => item.icon == icon);
		myIcon.value = el.value;
		setAnnotation(myAnnotation);
	}

	const apiUpdateCalendar = async (calendarID, annotation) => {
		const apiUrlEndpoint = `/api/calendars/update`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				calendarID: calendarID,
				annotation: annotation
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
	}

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
										return (
											<td className={styles.item} key={d} dateid={myDateID}
											    onClick={ date > 0 ? (e) => setting(e) : () => { return; } } >
												{date > 0 ? <label className={`${styles.date} ${dateStyleList[date]? (dateStyleList[date].circle? styles.circle : '') : ''}`}
																   color={dateStyleList[date]? (dateStyleList[date].color?? (d>=5?'red':'')) : (d>=5?'red':'')}
												>{date}</label> : ''}
												{activities[date]? (activities[date][activityType.icon]? <div className={`${styles.icon}`}>
													{
														activities[date][activityType.icon].map((icon,i)=>{
															return (
																<span key={i} icon={icon}></span>
															)
														})
													}
												</div> : '') : ''}
												{activities[date]? (activities[date][activityType.text]? <div className={`${styles.text}`} color={activities[date][activityType.text].style}>{activities[date][activityType.text].text}</div> : '') : ''}
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
					annotation.map((icon,i) => {
						const inputWidth = (icon.value.length + 1.5) * 10;
						return(
							<li key={i} icon={icon.icon}>
								<span className={styles.clickInsert}>
									<input type="text" style={{display:'none', width:(inputWidth > 50 ? (inputWidth > 100 ? 100 : inputWidth) : 50)}}
										   onChange={(e) => onChangeAnnotation(icon.icon, e.target)}
										   onBlur={(e) => updatingAnnotation(false,e.target)}
										   value={icon.value} />
								</span>
								<span className={styles.word}
									  onClick={(e) => updatingAnnotation(true,e.target)}>
									  {icon.value.length > 0 ? icon.value : <span style={{color:'grey'}}>點擊輸入</span>}
								</span>
							</li>
						);
					})
				}
			</ul>
		</div>
	)
}