import Head from 'next/head';
import styles from '../styles/Home.module.scss';
import {useEffect, useState, useMemo, createRef} from 'react';
import {useImmer} from 'use-immer';
import {textConvert, dateID, calendarID, getDate} from "./tools/myFunction";
import Calendar from "./components/calendar";
import Setting from "./components/Setting";
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

	const [myDatePos, setMyDatePos] = useState({el:null, posX:0, posY:0, width:0, height:0});
	const [myDateID, setMyDateID] = useState(null);
	const theCalendarID = useMemo(()=>{ return myDateID? calendarID(myDateID) : ''},[myDateID]);
	const theDate = useMemo(()=>{ return myDateID? parseInt(getDate(myDateID)) : ''},[myDateID]);
	const activityTypeText = 1,
		  activityTypeIcon = 2,
		  activityTextStyle = 'blue';
	//const iconValueDefault = {Rabbit:'', Dragon:'', Dog:'', Butterfly:'', Bear:'', Whale:'', Chick:'', Fish:''};
	const iconValueDefault = {Roy:'', York:'', Jason:'', DZ:'', Lily:'', Christine:'', Manjirou:''};
	const [activities, setActivities] = useState({});
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
	const addCalendar = async () => {
		if(calendarList[selectCalendarID]) {
			//scroll to calendar
			scrollToCalendar(calendarList[selectCalendarID].ref);
			return;
		}
		const calendar = createCalendar(selectedYear,selectedMonth);
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
		setActivities(current => {
			const activities = {...current};
			for (const [key, value] of Object.entries(activities)) {
				if((new RegExp(calendar_id)).test(key)){
					delete activities[key];
				}
			}
			return activities;
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
		//useImmer 的寫法
		/*setActivities(draft => {
			for (const [key, value] of Object.entries(draft)) {
				if((new RegExp(calendar_id)).test(key)){
					delete draft[key];
				}
			}
		})*/
		setAction('removeCalendar');
		await apiDeleteCalendar(calendar_id)
	}

	const openSetting = (el, posX, posY, width, height) => {
		//setOverlayActive(true);
		setMyDatePos({el:el, posX:posX, posY:posY, width:width, height:height});
		setMyDateID(el.getAttribute('dateid'));
		setActivities(activities);
		setDateStyleList(dateStyleList);
	}
	const setGlobalDateStyleList = (myDateStyleList) => {
		setDateStyleList(current => {
			const dateStyleList = {...current};
			if (!dateStyleList[theCalendarID]) {
				dateStyleList[theCalendarID] = {}
			}
			if (!dateStyleList[theCalendarID][theDate]) {
				dateStyleList[theCalendarID][theDate] = {}
			}
			dateStyleList[theCalendarID][theDate] = myDateStyleList;

			if(Object.keys(dateStyleList[theCalendarID][theDate]).length == 0){
				delete dateStyleList[theCalendarID][theDate];
			}
			if(Object.keys(dateStyleList[theCalendarID]).length == 0){
				delete dateStyleList[theCalendarID];
			}

			return dateStyleList;
		})
	}
	const setGlobalActivities = (myActivities) => {
		setActivities(current => {
			const activities = {...current};
			if (!activities[theCalendarID]) {
				activities[theCalendarID] = {}
			}
			if (!activities[theCalendarID][theDate]) {
				activities[theCalendarID][theDate] = {}
			}

			activities[theCalendarID][theDate] = myActivities;
			if(Object.keys(activities[theCalendarID][theDate]).length == 0){
				delete activities[theCalendarID][theDate];
			}
			if(Object.keys(activities[theCalendarID]).length == 0){
				delete activities[theCalendarID];
			}

			return activities;
		})
	}
	useEffect(() => {
		if(!theCalendarID) return;
		const annotation = createAnnotation(theCalendarID);
		setCalendarList(current => {
			const calendar = {...current};

			calendar[theCalendarID].annotation = annotation;
			apiUpdateCalendar(theCalendarID, annotation);
			return calendar;
		});
	},[activities,dateStyleList])
	const createAnnotation = (calendar_id) => {
		const newAnnotation = [];
		const act = activities[calendar_id]?? {};
		const dsl = dateStyleList[calendar_id]?? {};
		const annotation = calendarList[calendar_id] ? calendarList[calendar_id].annotation : [];
		for (const [date, value] of Object.entries(act)) {
			if (value[activityTypeIcon]) {
				value[activityTypeIcon].forEach ((icon) => {
					if(!newAnnotation.includes(icon)) {
						newAnnotation.push(icon);
					}
				});
			}
			if (newAnnotation.length >= Object.keys(iconValueDefault).length) break;
		}
		for (const [date, value] of Object.entries(dsl)){
			if(value.circle){
				newAnnotation.push('circle');
				break;
			}
		}

		//const annotation = calendarList[calendar_id].annotation;
		newAnnotation.forEach ((icon) => {
			const myIcon = annotation.find(item => item.icon == icon);
			if (!myIcon) {
				annotation.push({icon:icon, value:''})
			}
		})

		annotation.forEach ((item, index, object) => {
			if (!newAnnotation.includes(item.icon)) {
				object.splice(index, 1);
			}
		})

		return annotation;
	}

	//偵測 td 寬高，調整 madal 位置
	/*useEffect(()=>{
		if(myDate.el) {
			setMyDate({
				...myDate,
				width:myDate.el.offsetWidth,
				height:myDate.el.offsetHeight
			});
		}
	},[activities]);*/

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
	async function  apiUpdateCalendar(calendarID, annotation) {
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
									  removeCalendar={removeCalendar}
									  openSetting={openSetting}
							/>
						);
					})
				}
				<Setting myDateID={myDateID}
						 myDatePosition={myDatePos}
						 constData={{activityTypeText:activityTypeText, activityTypeIcon:activityTypeIcon, activityTextStyle:activityTextStyle, iconValueDefault:iconValueDefault}}
						 myActivities={activities[theCalendarID] ? activities[theCalendarID][theDate]?? {} : {}}
						 myDateStyleList={dateStyleList[theCalendarID] ? dateStyleList[theCalendarID][theDate] ?? {} : {}}
						 setMyDateID={setMyDateID}
						 setGlobalActivities={setGlobalActivities}
						 setGlobalDateStyleList={setGlobalDateStyleList}
				/>
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
