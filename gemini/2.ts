import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonList,
  IonRouterOutlet,
  LoadingController,
  ModalController,
  ToastController,
  Config,
  HTMLIonItemSlidingElement,
  HTMLIonFabElement,
} from '@ionic/angular';
import { ScheduleFilterPage } from '../schedule-filter/schedule-filter';
import { ConferenceData } from '../../providers/conference-data';
import { UserData } from '../../providers/user-data';

interface ScheduleGroup {
  time: string;
  sessions: any[];
}

@Component({
  selector: 'page-schedule',
  templateUrl: 'schedule.html',
  styleUrls: ['./schedule.scss'],
})
export class SchedulePage implements OnInit {
  @ViewChild('scheduleList', { static: true }) scheduleList: IonList;

  ios: boolean;
  dayIndex = 0;
  queryText = '';
  segment = 'all';
  excludeTracks: any = [];
  shownSessions: any[] = [];
  groups: ScheduleGroup[] = [];
  confDate: string;
  showSearchbar: boolean;

  constructor(
    private alertCtrl: AlertController,
    private confData: ConferenceData,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private router: Router,
    private routerOutlet: IonRouterOutlet,
    private toastCtrl: ToastController,
    private user: UserData,
    private config: Config
  ) {}

  ngOnInit() {
    this.updateSchedule();
    this.ios = this.config.get('mode') === 'ios';
  }

  updateSchedule() {
    if (this.scheduleList) {
      this.scheduleList.closeSlidingItems();
    }

    this.confData
      .getTimeline(this.dayIndex, this.queryText, this.excludeTracks, this.segment)
      .subscribe((data: { shownSessions: any[]; groups: ScheduleGroup[] }) => {
        this.shownSessions = data.shownSessions;
        this.groups = data.groups;
      });
  }

  async presentFilter() {
    const modal = await this.modalCtrl.create({
      component: ScheduleFilterPage,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: { excludedTracks: this.excludeTracks },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.excludeTracks = data;
      this.updateSchedule();
    }
  }

  async addFavorite(slidingItem: HTMLIonItemSlidingElement, sessionData: any) {
    const isFavorite = this.user.hasFavorite(sessionData.name);

    if (isFavorite) {
      this.removeFavorite(slidingItem, sessionData, 'Favorite already added');
    } else {
      this.user.addFavorite(sessionData.name);
      slidingItem.close();

      const toast = await this.toastCtrl.create({
        header: `${sessionData.name} was successfully added as a favorite.`,
        duration: 3000,
        buttons: [
          {
            text: 'Close',
            role: 'cancel',
          },
        ],
      });

      await toast.present();
    }
  }

  async removeFavorite(
    slidingItem: HTMLIonItemSlidingElement,
    sessionData: any,
    title: string
  ) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: 'Would you like to remove this session from your favorites?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            slidingItem.close();
          },
        },
        {
          text: 'Remove',
          handler: () => {
            this.user.removeFavorite(sessionData.name);
            this.updateSchedule();
            slidingItem.close();
          },
        },
      ],
    });

    await alert.present();
  }

  async openSocial(network: string, fab: HTMLIonFabElement) {
    const loading = await this.loadingCtrl.create({
      message: `Posting to ${network}`,
      duration: Math.random() * 1000 + 500,
    });

    await loading.present();
    await loading.onWillDismiss();
    fab.close();
  }
}