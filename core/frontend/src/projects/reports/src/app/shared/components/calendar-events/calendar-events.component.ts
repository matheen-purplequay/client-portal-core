import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../services/app/common/common.service';
import * as moment from 'moment';
import { RemindersService } from '../../../services/entities/reminders.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';

@Component({
  selector: 'app-calendar-events',
  templateUrl: './calendar-events.component.html',
  styleUrls: ['./calendar-events.component.scss']
})
export class CalendarEventsComponent implements OnInit {

  events: any;
  weeklyDates: { date: string, day: string }[] = [];
  currentDate = new Date().getDate();
  currentDateStr: string = '';
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();

  fyEndMonths = {
    list: {
      6: { index: 6, label: 'June' },
      12: { index: 12, label: 'December' }
    },
    selectedMonth: { index: 6, label: 'June' }
  };

  gettingEvents: boolean = false;
  showAll: boolean = false;

  reminders: any[] = [];
  gettingReminders: boolean = false;
  addNewReminder: boolean = false;
  
  tomorrowDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  minDate = `${this.tomorrowDate.getFullYear()}-${String(this.tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(this.tomorrowDate.getDate()).padStart(2, '0')}`;
  maxDate = `${this.tomorrowDate.getFullYear() + 1}-${String(this.tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(this.tomorrowDate.getDate()).padStart(2, '0')}`;

  newReminder: { reminder: string, when: string, user_id: number } = {
    reminder: '',
    when: this.minDate,
    user_id: 0
  };
  isSavingReminder: boolean = false;
  deletingReminderID: number = -1;

  constructor(
    private commonService: CommonService,
    private reminderService: RemindersService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    if(this.currentMonth > 5) this.fyEndMonths.selectedMonth = this.fyEndMonths.list[12];
    else this.fyEndMonths.selectedMonth = this.fyEndMonths.list[6];

    this.setupAmbiance();
  }

  setupAmbiance() {
    this.getCurrentWeek();
    this.getUpcomingEvents();
    this.getReminders();
  }

  getCurrentWeek() {
    var currentDate = moment();
    if(this.currentDate < 10) this.currentDateStr = '0' + this.currentDate;
    else this.currentDateStr = this.currentDate + '';

    var weekStart = currentDate.clone().startOf('isoWeek');
    var weekEnd = currentDate.clone().endOf('isoWeek');

    var days = [];

    for (var i = 0; i <= 6; i++) {
      // days.push(moment(weekStart).add(i, 'days').format("MMMM Do,dddd"));
      this.weeklyDates.push({
        date: moment(weekStart).add(i, 'days').format("DD"),
        day:  moment(weekStart).add(i, 'days').format("dddd")
      })
    }

    console.log('dates ', this.weeklyDates, this.currentDate);
  }

  getUpcomingEvents() {
    this.gettingEvents = true;
    this.commonService.getUpcomingEvents().subscribe({
      next: (res: any) => {
        this.gettingEvents = false;
        if (res.status) {
          this.events = res.data;
          this.events.forEach((event: any) => {
            this.calculateDiff(this.convertToDate(event.date)).then(val => event.datediff = val);
          });
        }
      },
      error: (err: any) => { 
        this.gettingEvents = false;
      }
    });
  }

  convertToDate(dateString: string): Date {
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in JavaScript's Date object
  }

  async calculateDiff(date: Date){
    let currentDate = new Date();
    date = new Date(date);

    return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) ) /(1000 * 60 * 60 * 24));
  }

  getReminders(refresh: boolean = true) {
    if(refresh) this.gettingReminders = true;
    const body = {
      user_id: this.localStorageService.getItem('userdata').user_id
    };
    
    this.reminderService.getReminders(body).subscribe({
      next: (res: any) => {
        this.gettingReminders = false;
        if(res.status) this.reminders = res.data;
      },
      error: (err: any) => {
        this.gettingReminders = false;

      }
    });
  }

  saveReminder() {
    this.isSavingReminder = true;
    this.newReminder.user_id = this.localStorageService.getItem('userdata').user_id;
    this.reminderService.newReminder(this.newReminder).subscribe({
      next: (res: any) => {
        this.isSavingReminder = false;
        this.getReminders();
        this.addNewReminder = false;
        this.resetNewReminder();
      },
      error: (err: any) => {
        this.isSavingReminder = false;
      }
    });
  }

  deleteReminder(id: number) {
    this.gettingReminders = true;
    this.deletingReminderID = id;
    const body = {
      reminder_id: id
    };
    this.reminderService.deleteReminder(body).subscribe({
      next: (res: any) => {
        this.gettingReminders = false;
        this.reminders = this.reminders.filter(reminder => reminder.id != id);
        this.getReminders(false);
        this.deletingReminderID = -1;
      },
      error: (err: any) => {
        this.gettingReminders = false;
        this.deletingReminderID = -1;
      }
    });
  }

  resetNewReminder() {
    this.newReminder = {
      reminder: '',
      when: this.minDate,
      user_id: 0
    };
  }
}
