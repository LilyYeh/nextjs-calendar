import Head from 'next/head';
import styles from '../styles/Home.module.scss';
import {useEffect, useState, useMemo, createRef} from 'react';
import {useImmer} from 'use-immer';
import {textConvert, dateID, calendarID, getDate} from "./tools/myFunction";
import Calendar from "./components/calendar";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCalendarDays, faCalendar, faPlusSquare, faSearch} from '@fortawesome/free-solid-svg-icons';
import {faMinusSquare} from '@fortawesome/free-regular-svg-icons';

export default function Home() {
	const date = new Date;
	const yearToday = date.getFullYear();
	const monthToday = date.getMonth() + 1; // date.getMonth()==0 是 1月
	const dateToday = date.getDate();
	const lastDateOfThisMonth = (new Date(yearToday, monthToday, 0)).getDate();
	const [selectedYear, setSelectedYear] = useState(yearToday);
	const [selectedMonth, setSelectedMonth] = useState(monthToday);
	const selectCalendarID = useMemo(() => { return selectedYear.toString() + (selectedMonth >=10 ? '' : 0 ) + selectedMonth.toString() },[selectedYear, selectedMonth]);

	//addCalendar, removeCalendar
	const [action, setAction] = useState(null);
	const [calendarList, setCalendarList] = useState({});

	const [isOverlayActive, setOverlayActive] = useState(false);
	const [myDate, setMyDate] = useState({el:null, posX:0, posY:0, width:0, height:0});
	const [myDateID, setMyDateID] = useState(null);
	const theCalendarID = useMemo(()=>{ return myDateID? calendarID(myDateID) : ''},[myDateID]);
	const theDate = useMemo(()=>{ return myDateID? parseInt(getDate(myDateID)) : ''},[myDateID]);
	const activityTypeText = 1;
	const activityTypeIcon = 2;
	const activityTextStyle = 'blue';
	const iconValueDefault = {Rabbit:'', Dragon:'', Dog:'', Butterfly:'', Bear:'', Whale:'', Chick:'', Fish:''};
	const [activities, setActivities] = useImmer({});

	const [dateStyleList, setDateStyleList] = useState({});

	const [catalogCollapseList, setCatalogCollapse] = useState({});

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
		if(calendarList[selectCalendarID]) {
			//scroll to calendar
			scrollToCalendar(calendarList[selectCalendarID].ref);
			return;
		}
		const calendarData = createCalendar(selectedYear,selectedMonth);
		const calendar = calendarData
		setCalendarList({
			...calendarList,
			[calendar.id]: calendar
		});
		setAction('addCalendar');
		await apiCreateCalendar({id:calendar.id, year:calendar.year, month:calendar.month, annotation:calendar.annotation});
	}
	const createCalendar = (year, month) => {
		const calendar_id = year.toString() + (month >=10 ? '' : 0 ) + month.toString();
		const theFirstDayOfThisMonth = new Date(year, month-1, 1).getDay();
		const lastDateOfSelectedMonth = new Date(year, month, 0).getDate();
		const calendar = []
		let week = [], date = 1;
		// 一個月曆最多7*6=42個td
		for(let i=0; i<=42; i++) {
			let day = (i % 7) + 1;
			if(day == 1) week = [];
			if((calendar.length == 0 && day < theFirstDayOfThisMonth) || (date > lastDateOfSelectedMonth)) {
				week.push(0);
			} else {
				week.push(date);
				date++;
			}
			if(day == 7){
				calendar.push(week);
				if(date > lastDateOfSelectedMonth){
					break;
				}
			}
		}

		return { id:calendar_id, year:year, month:month, calendar:calendar, ref:createRef(), annotation:[] };
	}

	//其實不需要這個 function 也會自動按 object key 升冪排列
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
		if(action=='addCalendar' && calendarList[selectCalendarID]){
			scrollToCalendar(calendarList[selectCalendarID].ref);
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
	const removeCalendar = async (calendar_id) => {
		setCalendarList(current => {
			const calendar = {...current};
			delete calendar[calendar_id];

			return calendar;
		});
		setActivities(draft => {
			for (const [key, value] of Object.entries(draft)) {
				if((new RegExp(calendar_id)).test(key)){
					delete draft[key];
				}
			}
		})
		setDateStyleList(current => {
			const dateStyleList = {...current};
			for (const [key, value] of Object.entries(dateStyleList)) {
				if((new RegExp(calendar_id)).test(key)){
					delete dateStyleList[key];
				}
			}
			return dateStyleList;
		})
		setAction('removeCalendar');
		await apiDeleteCalendar(calendar_id)
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
			myPosY = myDate.posY - 142 - window.scrollY;
		}
		document.querySelector('.'+styles.modal).setAttribute('style','left:'+myPosX+'px;top:'+myPosY+'px');
	},[myDate]);

	useEffect(() => {
		if(!isOverlayActive){
			if(!myDateID) return;

			let eventData = {date_id:myDateID, [activityTypeText]:{}, [activityTypeIcon]:{}};
			if(activities[theCalendarID]){
				if(activities[theCalendarID][theDate]){
					if(activities[theCalendarID][theDate][activityTypeText]){
						eventData[activityTypeText] = createActivity(myDateID, activityTypeText, activities[theCalendarID][theDate][activityTypeText]);
					}
					if(activities[theCalendarID][theDate][activityTypeIcon]){
						eventData[activityTypeIcon] = createActivity(myDateID, activityTypeIcon, activities[theCalendarID][theDate][activityTypeIcon]);
					}
				}
			}
			apiUpdateEvents(eventData);

			if(dateStyleList[theCalendarID]){
				if(dateStyleList[theCalendarID][theDate]){
					apiUpdateDateStyle(myDateID,dateStyleList[theCalendarID][theDate]);
				}else{
					apiDeleteDateStyle(myDateID);
				}
			}else{
				apiDeleteDateStyle(myDateID);
			}

			//setMyDate({el:null, posX:0, posY:0, width:0, height:0});
			//setMyDateID(null);
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
		let current = {...dateStyleList};

		if(!current[theCalendarID]){
			current[theCalendarID] = {};
		}
		if(!current[theCalendarID][theDate]){
			current[theCalendarID][theDate] = {};
		}
		if(style=='circle'){
			if (current[theCalendarID][theDate].circle) {
				delete current[theCalendarID][theDate].circle
			} else {
				current[theCalendarID][theDate].circle = true;
			}
		}else{
			current[theCalendarID][theDate].color = style;
		}

		if(Object.keys(current[theCalendarID][theDate]).length == 0){
			delete current[theCalendarID][theDate];
		}
		if(Object.keys(current[theCalendarID]).length == 0){
			delete current[theCalendarID];
		}
		setDateStyleList(current);
	}
	const setActivityStyle = (style) => {
		setActivities(draft => {
			if(!draft[theCalendarID]){
				draft[theCalendarID] = {};
			}
			if(!draft[theCalendarID][theDate]){
				draft[theCalendarID][theDate] = {};
			}
			if(!draft[theCalendarID][theDate][activityTypeText]){
				draft[theCalendarID][theDate][activityTypeText] = {style:style, text:''};
			}else{
				draft[theCalendarID][theDate][activityTypeText].style = style;
			}
			return draft;
		})
	}
	const setActivity = (date_id, type, value) => {
		setAction('setActivity');
		//useImmer 的寫法
		setActivities(draft => {
			if(!draft[theCalendarID]){
				draft[theCalendarID] = {};
			}
			if(!draft[theCalendarID][theDate]){
				draft[theCalendarID][theDate] = {};
			}
			if(!draft[theCalendarID][theDate][type]){
				if(type == activityTypeText) {
					draft[theCalendarID][theDate][type] = {style:activityTextStyle, text:''};
				}else if(type == activityTypeIcon) {
					draft[theCalendarID][theDate][type] = [];
				}
			}

			if(type == activityTypeText) {
				draft[theCalendarID][theDate][type].text = value;
			}else if(type == activityTypeIcon) {
				let i = draft[theCalendarID][theDate][type].indexOf(value);
				if(i>=0){
					draft[theCalendarID][theDate][type].splice(i, 1);
				}else{
					draft[theCalendarID][theDate][type].push(value);
				}
			}

			//移除空的 Activity
			if(type == activityTypeText) {
				if(draft[theCalendarID][theDate][activityTypeText].text.length == 0){
					delete draft[theCalendarID][theDate][activityTypeText];
				}
			} else if(type == activityTypeIcon) {
				if(draft[theCalendarID][theDate][activityTypeIcon].length == 0){
					delete draft[theCalendarID][theDate][activityTypeIcon];
				}
			}
			if(Object.keys(draft[theCalendarID][theDate]) == 0){
				delete draft[theCalendarID][theDate];
			}
			if(Object.keys(draft[theCalendarID]) == 0){
				delete draft[theCalendarID];
			}

			return draft;
		});

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

	const expandOrCollapse = (year) => {
		setCatalogCollapse(current => {
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
		setCatalogCollapse(current => {
			let newList = {...current};
			if(Object.keys(catalogCalendarList).length == Object.keys(catalogCollapseList).length){  // 已經全部關起來
				newList = {};
			}else {
				Object.keys(catalogCalendarList).forEach((year)=>{
					newList[year] = 1
				})
			}
			return newList;
		})
	}
	const isAllCollapse = useMemo(() => {
		if(Object.keys(catalogCalendarList).length == Object.keys(catalogCollapseList).length){
			return true;
		}
		return false;
	},[catalogCalendarList,catalogCollapseList]);

	useEffect(() => {
		const newList = {...catalogCollapseList};
		Object.keys(newList).forEach((year)=>{
			if(!catalogCalendarList[year]) delete newList[year];
		})
		setCatalogCollapse(newList);
	},[catalogCalendarList])
	
	const searchCalendar = async () => {
		await apiGetCalendars(selectCalendarID)
	}

	async function apiGetCalendars(calendar_id) {
		// get calendars after selectedMonth (this month)
		const apiUrlEndpoint = `/api/calendars/get?calendar_id=${calendar_id}`;
		const getData = {
			method: "GET",
			header: { "Content-Type": "application/json" }
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
		const calList = {}, actList = {}, dateStyleList = {}
		res.calendars.forEach((data) => {
			const calendar = createCalendar(data.year,data.month);
			calendar['annotation'] = data.annotation
			calList[data.id] = calendar;
		})
		res.events.forEach((data) => {
			if(!actList[data.calendar_id]){
				actList[data.calendar_id] = {};
			}
			if(!actList[data.calendar_id][data.date]){
				actList[data.calendar_id][data.date] = {};
			}
			if(!actList[data.calendar_id][data.date][data.event_type]){
				if(data.event_type == activityTypeText){
					actList[data.calendar_id][data.date][data.event_type] = {style:activityTextStyle, text:''};
				}else if(data.event_type == activityTypeIcon){
					actList[data.calendar_id][data.date][data.event_type] = [];
				}
			}

			if(data.event_type == activityTypeText){
				if(data.event_text){
					actList[data.calendar_id][data.date][data.event_type].text = data.event_text;
				}
				if(data.event_text_style){
					actList[data.calendar_id][data.date][data.event_type].style = data.event_text_style;
				}
			}else if(data.event_type == activityTypeIcon){
				actList[data.calendar_id][data.date][data.event_type] = data.event_text.split(',');
			}
		})
		res.date_style_list.forEach((data) => {
			const calendar_id = calendarID(data.date_id.toString());
			const date = parseInt(getDate(data.date_id.toString()));
			if(!dateStyleList[calendar_id]){
				dateStyleList[calendar_id] = {};
			}
			dateStyleList[calendar_id][date] = data.style;
		})
		setCalendarList(calList);
		setActivities(actList);
		setDateStyleList(dateStyleList);
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
	async function apiDeleteCalendar(calendar_id) {
		const apiUrlEndpoint = `/api/calendars/delete`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				calendar_id: calendar_id
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

	useEffect(()=>{
		apiGetCalendars(selectCalendarID);
	},[]);

	//測試用
	/*useEffect(()=>{
		//console.log('calendarList',calendarList)
		//console.log('activities',activities)
		//console.log('catalog',catalogCalendarList)
		//console.log('dateStyleList',dateStyleList)
	},[activities]);*/

	return (
		<div className={styles.container}>
			<Head>
				<title>Calendar Lily</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div className={styles.topColumn}>
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
				<div className={styles.formData}>
					<button className={styles.searchBtn} onClick={searchCalendar}><FontAwesomeIcon icon={faSearch} /></button>
				</div>
			</div>
			<div className={styles.calendarContainer}>
				{
					sortedCalendarList.map((calendar,i) => {
						return(
							<Calendar key={i}
							          calendar={calendar}
									  dateStyleList={dateStyleList[calendar.id]?? {}}
							          activities={activities[calendar.id]?? {}}
							          activityType={{text:activityTypeText, icon:activityTypeIcon}}
									  iconValueDefault={iconValueDefault}
									  removeCalendar={removeCalendar}
							          openSetting={openSetting}
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
							<input type="text" onChange={(e) => setActivity(myDateID,activityTypeText,e.target.value)}
								   value={activities[theCalendarID]? (activities[theCalendarID][theDate]? (activities[theCalendarID][theDate][activityTypeText]? activities[theCalendarID][theDate][activityTypeText].text: '') : '') : ''} />
						</div>
						<div className={`${styles.formData}`}>
							<label>事件 icon</label>
							<div className={`${styles.activityIcon}`} onClick={(e) => setActivity(myDateID,activityTypeIcon,'Dragon')}>🦖</div>
							<div className={`${styles.activityIcon}`} onClick={(e) => setActivity(myDateID,activityTypeIcon,'Dog')}>🐶</div>
							<div className={`${styles.activityIcon}`} onClick={(e) => setActivity(myDateID,activityTypeIcon,'Bear')}>🐻</div>
							<div className={`${styles.activityIcon}`} onClick={(e) => setActivity(myDateID,activityTypeIcon,'Rabbit')}>🐰</div>
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
									<h3 onClick={(e)=>{expandOrCollapse(year)}}>
										<FontAwesomeIcon icon={faMinusSquare} className={`${styles.iconCollapse} ${catalogCollapseList[year]? '' : styles.active}`} />
										<FontAwesomeIcon icon={faPlusSquare} className={`${styles.iconExpand} ${catalogCollapseList[year]? styles.active : ''}`} />
										{year}年
									</h3>
									<ul className={`${styles.month} ${catalogCollapseList[year]? '' : styles.active}`}>
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
