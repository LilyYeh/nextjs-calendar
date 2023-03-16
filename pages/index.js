import Head from 'next/head';
import styles from '../styles/Home.module.scss';
import {useEffect, useState, useMemo, createRef} from 'react';
import {useImmer} from 'use-immer';
import {textConvert, dateID, calendarID, getDate} from "./tools/myFunction";
import Calendar from "./components/calendar";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCalendarDays, faCalendar, faPlusSquare} from '@fortawesome/free-solid-svg-icons';
import {faMinusSquare} from '@fortawesome/free-regular-svg-icons';

export default function Home() {
	const date = new Date;
	const yearToday = date.getFullYear();
	const monthToday = date.getMonth() + 1; // date.getMonth()==0 是 1月
	const dateToday = date.getDate();
	const lastDateOfThisMonth = (new Date(yearToday, monthToday, 0)).getDate();
	const [selectedYear, setSelectedYear] = useState(yearToday);
	const [selectedMonth, setSelectedMonth] = useState(monthToday);
	const newCalendarID = useMemo(() => { return selectedYear.toString() + (selectedMonth >=10 ? '' : 0 ) + selectedMonth.toString() },[selectedYear, selectedMonth]);

	//addCalendar, removeCalendar
	const [action, setAction] = useState(null);
	const [calendarList, setCalendarList] = useState({});

	const [isOverlayActive, setOverlayActive] = useState(false);
	const [myDate, setMyDate] = useState({el:null, posX:0, posY:0, width:0, height:0});
	const [myDateID, setMyDateID] = useState(null);
	const activityTypeText = 1;
	const activityTypeIcon = 2;
	const activityTextStyle = 'blue';
	const iconValueDefault = {Dragon:'沛辰休假', Dog:'', Bear:'', Rabbit:'莉莉休假'};
	const [activities, setActivities] = useImmer({});
	const [vacationStyle, setVacationStyle] = useState(2);

	const [catalogExpandList, setCatalogExpand] = useState({});

	const setDatePicker = () => {
		const yearOptions = [];
		const monthOptions = [];
		const dateOptions = [];
		for(let y=0; y<3; y++) {
			yearOptions.push(yearToday + y);
		}
		for(let m=1; m<=12; m++) {
			monthOptions.push(m);
		}
		for(let d=dateToday; d<=lastDateOfThisMonth; d++) {
			dateOptions.push(d);
		}
		return {yearOptions:yearOptions, monthOptions:monthOptions, dateOptions:dateOptions};
	}
	const datePicker = useMemo(setDatePicker,[]);

	const addCalendar = async () => {
		if(calendarList[newCalendarID]) {
			//scroll to calendar
			scrollToCalendar(calendarList[newCalendarID].ref);
			return;
		}
		const calendarData = createCalendar(selectedYear,selectedMonth);
		const calendar = calendarData.calendar, events= calendarData.events
		setCalendarList({
			...calendarList,
			[calendar.id]: calendar
		});
		setAction('addCalendar');
		await setDefaultActivities(events);
		await apiCreateCalendar({id:calendar.id, year:calendar.year, month:calendar.month, annotation:JSON.stringify(calendar.annotation)});
	}
	const createCalendar = (year, month) => {
		const calendarID = year.toString() + (month >=10 ? '' : 0 ) + month.toString();
		const theFirstDayOfThisMonth = new Date(year, month-1, 1).getDay();
		const lastDateOfSelectedMonth = new Date(year, month, 0).getDate();
		const calendar = [], events = [];
		let week = [], date = 1;
		// 一個月曆最多7*6=42個td
		for(let i=0; i<=42; i++) {
			let day = (i % 7) + 1;
			if(day == 1) week = [];
			if((calendar.length == 0 && day < theFirstDayOfThisMonth) || (date > lastDateOfSelectedMonth)) {
				week.push(0);
			} else {
				week.push(date);
				if(day >=6) {
					events.push({dateID:dateID(calendarID, date), type:activityTypeIcon, value:'Rabbit'});
				}
				date++;
			}
			if(day == 7){
				calendar.push(week);
				if(date > lastDateOfSelectedMonth){
					break;
				}
			}
		}

		return {
			calendar: {id:calendarID, year:year, month:month, calendar:calendar, ref:createRef(), annotation:[{Rabbit:iconValueDefault['Rabbit']}]},
			events: events
		};
	}

	//其實不需要這個 funciton 也會自動按 object key 升冪排列
	const sortedCalendarList = useMemo(() => {
		const sorted = Object.values(calendarList).sort((a,b)=>{
				if(a.id < b.id){
					return -1;
				}
				return 1;
			}
		)
		return sorted;
	},[calendarList]);
	const catalogCalendarList = useMemo(() => {
		const catalog = {};
		Object.values(calendarList).forEach((calendar) => {
			if(!catalog[calendar.year]){
				catalog[calendar.year] = [];
			}
			catalog[calendar.year].push(calendar);
		});
		return catalog;
	},[calendarList]);
	useEffect(() => {
		if(action=='addCalendar' && calendarList[newCalendarID]){
			scrollToCalendar(calendarList[newCalendarID].ref);
		}
	},[calendarList]);
	//scroll to new calendar

	const scrollToCalendar = (calendarRef) => {
		if(calendarRef){
			window.scrollTo({
				top: calendarRef.current.offsetTop - 100,
				behavior: 'smooth',
				block: 'start',
			});
		}
	}
	const removeCalendar = async (calendarID) => {
		setCalendarList(current => {
			const calendar = {...current};
			delete calendar[calendarID];

			return calendar;
		});
		setActivities(draft => {
			for (const [key, value] of Object.entries(draft)) {
				if((new RegExp(calendarID)).test(key)){
					delete draft[key];
				}
			}
		})
		setAction('removeCalendar');
		await apiDeleteCalendar(calendarID)
	}
	const openSetting = (el, posX, posY, width, height) => {
		setOverlayActive(true);
		setMyDate({el:el, posX:posX, posY:posY, width:width, height:height});
		setMyDateID(el.getAttribute('dateid'));
	}

	useEffect(() => {
		let bottom = window.innerHeight - 400;
		let myPosX = myDate.posX, myPosY = myDate.posY + myDate.height + 5 - window.scrollY;
		if(myPosY > bottom) {
			myPosY = myDate.posY - 168 - window.scrollY;
		}
		document.querySelector('.'+styles.modal).setAttribute('style','left:'+myPosX+'px;top:'+myPosY+'px');
	},[myDate]);

	useEffect(() => {
		if(!isOverlayActive){
			setMyDate({el:null, posX:0, posY:0, width:0, height:0});
			setMyDateID(null);
		}else{
			const handleScroll = (e) => {
				if(myDate.el) {
					setMyDate({
						...myDate,
						posX: myDate.el.offsetLeft,
						posY: myDate.el.offsetTop,
						width: myDate.el.offsetWidth,
						height: myDate.el.offsetHeight
					});
				}
			};

			window.addEventListener('scroll', handleScroll);

			return () => {
				window.removeEventListener('scroll', handleScroll);
			};
		}
	}, [isOverlayActive]);

	const setDateStyle = (style) => {
		let dateElement = myDate.el.querySelector('.'+styles.date);
		if(style == 'circle') {
			if(dateElement.classList.contains(styles.circle)){
				dateElement.classList.remove(styles.circle);
			}else{
				dateElement.classList.add(styles.circle);
			}
		}else{
			dateElement.setAttribute('color',style);
		}
	}
	const setActivityStyle = (style) => {
		let dateElement = myDate.el.querySelector('.'+styles.text);
		if(!activities[myDateID] || !dateElement){
			return;
		}
		dateElement.setAttribute('color',style);
	}
	const setActivity = async (dateID, type, value) => {
		setAction('setActivity');
		//useImmer 的寫法
		setActivities(draft => {
			if(!draft[dateID]){
				draft[dateID] = {};
			}
			if(!draft[dateID][type]){
				if(type == activityTypeText) {
					draft[dateID][type] = '';
				}else if(type == activityTypeIcon) {
					draft[dateID][type] = [];
				}
			}

			if(type == activityTypeText) {
				draft[dateID][type] = value;
			}else if(type == activityTypeIcon) {
				let i = draft[dateID][type].indexOf(value);
				if(i>=0){
					draft[dateID][type].splice(i, 1);
				}else{
					draft[dateID][type].push(value);
				}
			}

			//移除空的 Activity
			if(draft[dateID][type].length == 0){
				delete draft[dateID][type];
			}
			if(Object.keys(draft[dateID]) == 0){
				delete draft[dateID];
			}

			return draft;
		});
		console.log('event',value)
		await apiCreateEvents([createActivity(dateID, type, value)]);

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
	const setDefaultActivities = async (events) => {
		const data = [];
		events.forEach((event) => {
			setActivity(event.dateID,event.type,event.value);
			data.push(createActivity(event.dateID, event.type, event.value));
		})
		await apiCreateEvents(data);
	}
	const createActivity = (dateID, type, value) => {
		let re = {
			date_id:dateID, calendar_id:calendarID(dateID), date:getDate(dateID), event_type:type
		}
		if(type==activityTypeText) {
			re['event_text'] = value;
			re['event_text_style'] = activityTextStyle;
		}
		if(type==activityTypeIcon) {
			re['event_icon'] = value;
		}
		return re;
	}
	const setVaStyle = (value) => {
		console.log('功能尚未啟動')
	}

	//偵測 td 寬高，調整 madal 位置
	useEffect(()=>{
		if(myDate.el) {
			setMyDate({
				...myDate,
				width:myDate.el.offsetWidth,
				height:myDate.el.offsetHeight
			});
		}
	},[activities]);
	//icon 註釋
	useEffect(()=>{
		const isPush = {};
		for (const [key, value] of Object.entries(activities)){
			if(value[activityTypeIcon]){
				const myCalendarID = calendarID(key);
				const newCalendar = {...calendarList};

				if(!newCalendar[myCalendarID]) return;

				if(!isPush[myCalendarID]) {
					newCalendar[myCalendarID]['annotation'] = [];
				}

				/*if(newCalendar[myCalendarID]['annotation'].length >= iconType.length) {
					return;
				}*/

				value[activityTypeIcon].forEach((icon) => {
					const myIcon = newCalendar[myCalendarID]['annotation'].find(item => item.icon == icon);
					if(!myIcon){
						newCalendar[myCalendarID]['annotation'].push({icon:icon, value:iconValueDefault[icon]});
					}
				});
				setCalendarList(newCalendar);
				isPush[myCalendarID] = 1;
			}
		}
	},[activities]);

	const expand = (year) => {
		setCatalogExpand(current => {
			const newList = {...current};
			if(newList[year]){
				delete newList[year];
			}else{
				newList[year] = 1;
			}
			return newList;
		});
	}
	const collapseAll = () => {
		setCatalogExpand(current => {
			let newList = {...current};
			if(Object.keys(newList).length == 0){
				Object.keys(catalogCalendarList).forEach((year)=>{
					newList[year] = 1
				})
			}else {
				newList = {};
			}
			return newList;
		})
	}
	const isAllCollapse = useMemo(() => {
		if(Object.keys(catalogExpandList).length == 0){
			return true;
		}
		return false;
	},[catalogExpandList]);

	async function apiGetCalendars() {
		const apiUrlEndpoint = `/api/calendars/get`;
		const getData = {
			method: "GET",
			header: { "Content-Type": "application/json" }
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
		const calList = {}, actList = {}
		res.calendars.forEach((data) => {
			const calendar = createCalendar(data.year,data.month).calendar;
			calList[calendar.id] = calendar;
		})
		res.events.forEach((data)=>{
			if(!actList[data.date_id]){
				actList[data.date_id] = {};
			}
			if(!actList[data.date_id][data.event_type]){
				if(data.event_type == activityTypeText){
					actList[data.date_id][data.event_type] = '';
				}else if(data.event_type == activityTypeIcon){
					actList[data.date_id][data.event_type] = [];
				}
			}

			if(data.event_type == activityTypeText){
				actList[data.date_id][data.event_type] = data.event_text;
			}else if(data.event_type == activityTypeIcon){
				actList[data.date_id][data.event_type].push(data.event_icon);
			}
		})
		setCalendarList(calList);
		setActivities(actList);
	}
	async function apiCreateCalendar(data) {
		const apiUrlEndpoint = `/api/calendars/create`;
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
	async function apiDeleteCalendar(calendarID) {
		const apiUrlEndpoint = `/api/calendars/delete`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				calendarID: calendarID
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
	}
	async function apiCreateEvents(data) {
		const apiUrlEndpoint = `/api/events/create`;
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

	useEffect(()=>{
		apiGetCalendars();
	},[]);

	//測試用
	useEffect(  ()=>{
		//console.log('calendarList',calendarList)
		//console.log('activities',activities)
		//console.log('catalog',catalogCalendarList)
	},[calendarList]);

	return (
		<div className={styles.container}>
			<Head>
				<title>Calendar Lily</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div className={styles.addCalendar}>
				<div className={styles.formData}>
					<select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
						{datePicker.yearOptions.map((year) => {
							return (
								<option value={year} key={year}>{year}</option>
							)
						})}
					</select>
					<label> 年 </label>
				</div>
				<div className={styles.formData}>
					<select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
						{datePicker.monthOptions.map((month) => {
							return (
								<option value={month} key={month}>{textConvert('month', month)}</option>
							)
						})}
					</select>
					<label> 月 </label>
				</div>
				<div className={styles.formData}>
					<button className={styles.addBtn} onClick={addCalendar}>+<FontAwesomeIcon icon={faCalendarDays} /></button>
				</div>
			</div>
			<div className={styles.calendarContainer}>
				{
					sortedCalendarList.map((calendar,i) => {
						return(
							<Calendar key={i}
							          calendar={calendar}
							          activities={activities}
							          activityType={{text:activityTypeText, icon:activityTypeIcon}}
							          removeCalendar={removeCalendar}
							          openSetting={openSetting}
							          vaStyle={vacationStyle}
							/>
						);
					})
				}
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
							<input type="text" onChange={(e) => setActivity(myDateID,activityTypeText,e.target.value)} value={activities[myDateID]? activities[myDateID][activityTypeText]?? '' : ''} />
						</div>
						<div className={`${styles.formData}`}>
							<label>事件 icon</label>
							<div className={`${styles.activityIcon}`} onClick={(e) => setActivity(myDateID,activityTypeIcon,'Dragon')}>🦖</div>
							<div className={`${styles.activityIcon}`} onClick={(e) => setActivity(myDateID,activityTypeIcon,'Dog')}>🐶</div>
							<div className={`${styles.activityIcon}`} onClick={(e) => setActivity(myDateID,activityTypeIcon,'Bear')}>🐻</div>
							<div className={`${styles.activityIcon}`} onClick={(e) => setActivity(myDateID,activityTypeIcon,'Rabbit')}>🐰</div>
						</div>
						<div className={`${styles.formData} ${styles.borderBottom}`}>
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
						<div className={`${styles.formData} mgBottom-5`}>
							<label>休假樣式</label>
							<div className={styles.radioGroup}>
								<input type="radio" onChange={() => setVaStyle(1)} checked={vacationStyle==1} /> <span className={'textRed' + ' fontSize14'}>休假</span>
							</div>
							<div className={styles.radioGroup}>
								<input type="radio" onChange={() => setVaStyle(2)} checked={vacationStyle==2} /> <span className={'fontSize22'}>🐰</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className={`${styles.leftColumn} ${Object.keys(catalogCalendarList).length? styles.active : ''}`}>
				<div className={styles.collapseAll} onClick={()=>{collapseAll()}}>
					<FontAwesomeIcon icon={faMinusSquare} className={`${styles.iconCollapse} ${isAllCollapse? '' : styles.active}`} />
					<FontAwesomeIcon icon={faPlusSquare} className={`${styles.iconExpand} ${isAllCollapse? styles.active : ''}`} />
				</div>
				<ul className={`${styles.year}`}>
					{
						Object.keys(catalogCalendarList).map((year) => {
							return (
								<li key={year} id={`catalog-${year}`}>
									<h3 onClick={(e)=>{expand(year)}}>
										<FontAwesomeIcon icon={faMinusSquare} className={`${styles.iconCollapse} ${catalogExpandList[year]? styles.active : ''}`} />
										<FontAwesomeIcon icon={faPlusSquare} className={`${styles.iconExpand} ${catalogExpandList[year]? '' : styles.active}`} />
										{year}年
									</h3>
									<ul className={`${styles.month} ${catalogExpandList[year]? styles.active : ''}`}>
										{
											catalogCalendarList[year].map((calendar) => {
												return (
													<li key={calendar.id} onClick={(e) => {e.stopPropagation();scrollToCalendar(calendar.ref)}}>
														<FontAwesomeIcon icon={faCalendar} className={styles.faCalendar} /> {textConvert('month', calendar.month)}月
													</li>
												)
											})
										}
									</ul>
								</li>
							);
						})
					}
				</ul>
			</div>
		</div>
	)
}
