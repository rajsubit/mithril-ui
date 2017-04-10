import {UI} from "./../base.js";
import o from "mithril";
import {required, isBoolean, isString} from "validatex";
import {Calendar as Cal} from "calendar";
import {Field} from "./field.js";
import {popup, popupBinder, popupPool} from "./../popup.js";
import {table, thead, tbody, th, tr, td} from "./../table";
import {grid, column} from "./../grid";
import {icon} from "./../icon";
import {button} from "./../button";
import fecha from "fecha";


const WEEKDAYS = "Sun Mon Tue Wed Thu Fri Sat".split(" ");
const MONTHS = "JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC".split(" ");

export class WeekBar extends UI {
	view ({attrs}) {
		return o(thead, attrs.rootAttrs,
			o(tr,
				WEEKDAYS.map(day => o(th, day))));
	}
}

export const weekBar = new WeekBar();

export class MonthDateGrid extends UI {
	datesAreEqual(date1, date2) {
		date1.setHours(0,0,0,0);
		date2.setHours(0,0,0,0);
		let date1Time = date1.getTime();
		let date2Time = date2.getTime();
		return date1Time === date2Time;
	}

	isPast (date) {
		let today = new Date();
		date.setHours(0,0,0,0);
		today.setHours(0,0,0,0);

		return date.getTime() < today.getTime();
	}

	isNotViewMonth (date, month) {
		return date.getMonth() !== month;
	}

	view ({attrs}) {
		return o(tbody, attrs.rootAttrs,
			attrs.dateGrid.map(row => {
				return o(tr, {textAlignment: "center"},
					row.map(dateStr => {
						let date = new Date(dateStr);
						let tdAttrs = {};
						let child = date.getDate();

						if (attrs.hideOffset && this.isNotViewMonth(date, attrs.viewMonth)) {
							return o(td, "");
						}

						if (attrs.disablePast && this.isPast(date)) {
							tdAttrs.state = "disabled";
						}


						let tdClass = [];
						this.datesAreEqual(date, new Date())? tdClass.push("today"): "";
						this.datesAreEqual(date, new Date(attrs.model()))? tdClass.push("selected"): "";
						date.getMonth() !== attrs.viewMonth? tdClass.push("offSet"): "";

						tdAttrs.class = tdClass.join(" ");
						tdAttrs.onclick = attrs.setDate.bind(undefined, date);

						return o(td, tdAttrs, child);
					}));
			}));
	}
}

export const monthDateGrid = new MonthDateGrid();

export class DatePickerWidget extends UI {
	getStyle (vnode) {
		return {
			[ "div table.ui.table > tbody > tr > td"
			+ ", div table.ui.table > thead > tr > th" ] : {
				"padding": ".78571429em !important"
			},
			"div table.ui.table > tbody td": {
				cursor: "pointer",
				fontWeight: "bold"
			},
			"div table.ui.table > tbody td.offSet": {
				fontWeight: "normal",
				color: "grey"
			},
			"div table.ui.table > tbody td.today": {
				backgroundColor: "orange !important",
				color: "white"
			},
			"div table.ui.table > tbody td.selected": {
				backgroundColor: "blue !important",
				color: "white"
			},
			"div .prev-month, div .next-month": {
				cursor: "pointer"
			}
		}
	}

	getMonthDates (year, month) {
		return new Cal().monthDates(year, month);
	}

	view ({attrs}) {
		return o("div", attrs.rootAttrs,
			o(grid,
				o(column, {width: 3, onclick: attrs.prevMonth},
					o(icon, {name: "chevron left", class: "prev-month", color: "blue"})),
				o(column, {width: 10, textAlignment: "center"},
					o("div.mth-year", MONTHS[attrs.viewMonth] + " " + attrs.viewYear)),
				o(column, {width: 3, onclick: attrs.nextMonth, textAlignment: "right"},
					o(icon, {name: "chevron right", class: "next-month", color: "blue"}))),
			o(table,
				{ veryBasic: true
				, size: "small"
			 	, },
				o(weekBar),
				o(monthDateGrid,
					{ dateGrid: this.getMonthDates(attrs.viewYear, attrs.viewMonth)
					, viewMonth: attrs.viewMonth
					, setDate: attrs.setDate
					, model: attrs.model
					, disablePast: attrs.disablePast
					, hideOffset: attrs.hideOffset
					, })));
	}
}

export const datePickerWidget = new DatePickerWidget();

export class DatePicker extends Field {
	viewYear = undefined
	viewMonth = undefined

	attrSchema =
		// see fecha - https://github.com/taylorhakes/fecha  for date formating
		{ format: [required(true), isString(true)]
		, disablePast: [required(false), isBoolean(true)]
		, model: [required(true), isBoolean(true)]
		, hideOffset: [required(false), isBoolean(true)]
		, }

	oldValue = ""

	oninit (vnode) {
		super.oninit(vnode);
		let {attrs} = vnode;

		this.setViewMonthYear(this.getViewMonthYear(attrs.model, attrs.format));
	}

	onbeforeupdate (vnode, oldVnode) {
		super.onbeforeupdate(vnode, oldVnode);
		let {attrs} = vnode;

		if (this.modelHasChanged(vnode.attrs.model())) {
			this.setViewMonthYear(this.getViewMonthYear(attrs.model, attrs.format));
		}
	}

	modelHasChanged (newValue) {
		if (this.oldValue !== newValue) {
			this.oldValue = newValue;
			return true;
		}

		return false;
	}

	getViewMonthYear (model, format) {
		return model() && fecha.parse(model(), format) || new Date();
	}

	setViewMonthYear (date) {
		this.viewYear = date.getFullYear();
		this.viewMonth =  date.getMonth();
	}

	getDefaultAttrs (vnode) {
		let defaultAttrs =
			{ format: "YYYY-MM-DD"
			, type: "text"
		 	, readOnly: true
			, disablePast: false
			, hideOffset: false
			, };
		let attrs = Object.assign(super.getDefaultAttrs(vnode), defaultAttrs);
		return attrs;
	}

	setDate (format, model, newDate) {
		let date = new Date(newDate);
		this.setViewMonthYear(date);
		model(fecha.format(newDate, format));
	}

	prevMonth (e) {
		e.stopPropagation();

		let prevMonth = this.viewMonth - 1;
		if (prevMonth === -1) {
			this.viewYear += -1;
			this.viewMonth = 11;
			return;
		}

		this.viewMonth = prevMonth;
	}

	nextMonth (e) {
		e.stopPropagation();

		let nextMonth = this.viewMonth + 1;
		if (nextMonth === 12) {
			this.viewYear += 1;
			this.viewMonth = 0;
			return;
		}

		this.viewMonth = nextMonth;
	}

	view (vnode) {
		let {attrs} = vnode;

		let view =
			o(popupBinder,
				{ displayPopup: "onclick"
				, hidePopup: "onclick" },
				super.view(vnode),
				o(popup, {position: "bottom left"},
					o(datePickerWidget,
						{ setDate: this.setDate.bind(this, attrs.format, attrs.model)
						, prevMonth: this.prevMonth.bind(this)
					 	, nextMonth: this.nextMonth.bind(this)
						, viewYear: this.viewYear
						, viewMonth: this.viewMonth
						, model: attrs.model
						, disablePast: attrs.disablePast
						, hideOffset: attrs.hideOffset
						, })));

		return view;
	}
}

export const datePicker = new DatePicker();
