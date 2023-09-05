import styles from "../../styles/Home.module.scss";
import {useEffect, useMemo, useState} from "react";
import {calendarID, getDate} from "../tools/myFunction";

export default function setting({myDateID, myDatePosition, constData , myActivities, myDateStyleList, setMyDateID, setGlobalActivities, setGlobalDateStyleList}) {
	//const [myDateID, setMyDateID] = useState(myDate);
	const activityTypeText  = constData.activityTypeText,
		  activityTypeIcon  = constData.activityTypeIcon,
		  activityTextStyle = constData.activityTextStyle,
		  iconValueDefault  = constData.iconValueDefault;
	const [isOverlayActive, setOverlayActive] = useState(false);
	const [myDatePos, setMyDatePos] = useState(myDatePosition);
	const [activities, setActivities] = useState(myActivities);
	const [dateStyleList, setDateStyleList] = useState(myDateStyleList);

	useEffect(() => {
		if(myDateID) {
			setOverlayActive(true);
			setMyDatePos(myDatePosition)
			setActivities(myActivities)
			setDateStyleList(myDateStyleList)
		}
	},[myDateID]);

	useEffect(() => {
		let bottom = window.innerHeight - 400;
		let myPosX = myDatePos.posX, myPosY = myDatePos.posY + myDatePos.height + 5 - window.scrollY;
		if(myPosY > bottom) {
			myPosY = myDatePos.posY - 150 - window.scrollY;
		}
		document.querySelector('.'+styles.modal).setAttribute('style','left:'+myPosX+'px;top:'+myPosY+'px');
	},[myDatePos]);

	// <開啟 overlay> setting board 位置跟著 scrollbar 變動
	useEffect(() => {
		if(!isOverlayActive) return;
		const handleScroll = (e) => {
			if(myDatePos.el) {
				setMyDatePos({
					...myDatePos,
					posX: myDatePos.el.offsetLeft,
					posY: myDatePos.el.offsetTop,
					width: myDatePos.el.offsetWidth,
					height: myDatePos.el.offsetHeight
				});
			}
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	},[isOverlayActive]);

	// <關閉 overlay> 儲存資料
	useEffect(() => {
		if(!myDateID) return;
		if(isOverlayActive) return;

		let eventData = {date_id:myDateID, [activityTypeText]:{}, [activityTypeIcon]:{}};
		if(activities[activityTypeText]){
			eventData[activityTypeText] = createActivity(myDateID, activityTypeText, activities[activityTypeText]);
		}
		if(activities[activityTypeIcon]){
			eventData[activityTypeIcon] = createActivity(myDateID, activityTypeIcon, activities[activityTypeIcon]);
		}
		apiUpdateEvents(eventData);

		if(Object.keys(dateStyleList).length > 0){
			apiUpdateDateStyle(myDateID,dateStyleList);
		}else{
			apiDeleteDateStyle(myDateID);
		}

		//setMyDate({el:null, posX:0, posY:0, width:0, height:0});
		setMyDateID(null);
	}, [isOverlayActive]);
	const setDateStyle = (style) => {
		let current = {...dateStyleList};
		if(style=='circle'){
			if (current.circle) {
				delete current.circle
			} else {
				current.circle = true;
			}
		}else{
			current.color = style;
		}
		setDateStyleList(current);
		setGlobalDateStyleList(current)
	}
	const setActivityStyle = (style) => {
		let draft = {...activities};
		if(!draft[activityTypeText]){
			draft[activityTypeText] = {style:style, text:''};
		}else{
			draft[activityTypeText].style = style;
		}
		setActivities(draft);
		setGlobalActivities(draft);
	}
	const setActivity = (date_id, type, value) => {
		//setAction('setActivity');

		let draft = {...activities};
		if(!draft[type]){
			if(type == activityTypeText) {
				draft[type] = {style:activityTextStyle, text:''};
			}else if(type == activityTypeIcon) {
				draft[type] = [];
			}
		}

		if(type == activityTypeText) {
			draft[type].text = value;
		}else if(type == activityTypeIcon) {
			let i = draft[type].indexOf(value);
			if(i>=0){
				draft[type].splice(i, 1);
			}else{
				draft[type].push(value);
			}
		}

		//移除空的 Activity
		if(type == activityTypeText) {
			if(draft[activityTypeText].text.length == 0){
				delete draft[activityTypeText];
			}
		} else if(type == activityTypeIcon) {
			if(draft[activityTypeIcon].length == 0){
				delete draft[activityTypeIcon];
			}
		}

		//useImmer 的寫法
		setActivities(draft);
		setGlobalActivities(draft);

		//useState 的寫法
		/*let obj = {...activities};
		if(!obj[dateID]){
			obj[dateID] = {};
		}
		if(!obj[dateID][type]){
			obj[dateID][type] = [];
		}
		obj[dateID][type].push(value);
		setActivities(obj);*/
	}
	const createActivity = (date_id, type, value) => {
		let re = {
			date_id:date_id, calendar_id:calendarID(date_id), date:getDate(date_id), event_type:type
		}
		if(type==activityTypeText) {
			re['event_text'] = value.text;
			re['event_text_style'] = value.style;
		}
		if(type==activityTypeIcon) {
			re['event_icon'] = value;
		}
		return re;
	}
	async function apiUpdateEvents(data) {
		const apiUrlEndpoint = `/api/events/update`;
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
	async function apiUpdateDateStyle(date_id,date_style) {
		const apiUrlEndpoint = `/api/date_style/update`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				date_id: date_id,
				date_style: date_style
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
	}
	async function apiDeleteDateStyle(date_id) {
		const apiUrlEndpoint = `/api/date_style/delete`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				date_id: date_id
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
	}

	return (
		<div className={`${styles.overlay} ${isOverlayActive? styles.active : ''}`}
			 onClick={() => {
				 setOverlayActive(false);
				 document.querySelectorAll('.' + styles.calendar + ' td' + '.' + styles.active).forEach((el) => {
					 el.classList.remove(styles.active)
				 });
			 }} >
			<div className={`${styles.modal}`} onClick={(e) => {e.stopPropagation()}}>
				<div className={`${styles.formData} ${styles.borderBottom}`}>
					<label>日期樣式</label>
					<div className={styles.color}>
						<div className={`${styles.colorBlock} ${styles.red}`} onClick={()=>setDateStyle('red')}></div>
						<div className={`${styles.colorBlock} ${styles.black}`} onClick={()=>setDateStyle('black')}></div>
						<div className={`${styles.colorBlock} ${styles.circle}`} onClick={()=>setDateStyle('circle')}></div>
					</div>
				</div>
				<div className={`${styles.formData}`}>
					<label>事件</label>
					<input type="text" onChange={(e) => setActivity(myDateID,activityTypeText,e.target.value)}
						   value={activities[activityTypeText]? activities[activityTypeText].text : ''} />
				</div>
				<div className={`${styles.formData}`}>
					<label>事件 icon</label>
					{Object.keys(iconValueDefault).map((icon)=>{
						return (
							<div className={`${styles.activityIcon}`} icon={icon} onClick={(e) => setActivity(myDateID,activityTypeIcon,icon)}>
								<img src={"/headshots/"+icon+".png"}/></div>
						);
					})}
				</div>
				<div className={`${styles.formData}`}>
					<label>事件顏色</label>
					<div className={styles.color}>
						<div className={`${styles.colorBlock} ${styles.yellow}`} onClick={()=>setActivityStyle('yellow')}></div>
						<div className={`${styles.colorBlock} ${styles.green}`} onClick={()=>setActivityStyle('green')}></div>
						<div className={`${styles.colorBlock} ${styles.blue}`} onClick={()=>setActivityStyle('blue')}></div>
						<div className={`${styles.colorBlock} ${styles.purple}`} onClick={()=>setActivityStyle('purple')}></div>
						<div className={`${styles.colorBlock} ${styles.red2}`} onClick={()=>setActivityStyle('red2')}></div>
						<div className={`${styles.colorBlock} ${styles.black}`} onClick={()=>setActivityStyle('black')}></div>
					</div>
				</div>
			</div>
		</div>
	)
}