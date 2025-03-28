import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { 
  AlertController, 
  IonList, 
  IonRouterOutlet, 
  LoadingController, 
  ModalController, 
  ToastController, 
  Config 
} from '@ionic/angular';

import { ScheduleFilterPage } from '../schedule-filter/schedule-filter';
import { ConferenceData } from '../../providers/conference-data';
import { UserData } from '../../providers/user-data';

interface SessionData {
  name: string;
  // Add other relevant session properties
}

interface ScheduleData {
  shownSessions: SessionData[];
  groups: any[];
}

@Component({
  selector: 'page-schedule',
  templateUrl: 'schedule.html',
  styleUrls: ['./schedule.scss'],
})
export class SchedulePage implements OnInit {
  @ViewChild('scheduleList', { static: true }) scheduleList!: IonList;

  // Component state properties
  ios: boolean = false;
  dayIndex = 0;
  queryText = '';
  segment = 'all';
  excludeTracks: string[] = [];
  shownSessions: SessionData[] = [];
  groups: any[] = [];
  showSearchbar = false;

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

  ngOnInit(): void {
    this.initializeSchedule();
  }

  private initializeSchedule(): void {
    this.updateSchedule();
    this.detectPlatform();
  }

  private detectPlatform(): void {
    this.ios = this.config.get('mode') === 'ios';
  }

  updateSchedule(): void {
    this.closeOpenSlidingItems();
    this.fetchScheduleData();
  }

  private closeOpenSlidingItems(): void {
    if (this.scheduleList) {
      this.scheduleList.closeSlidingItems();
    }
  }

  private fetchScheduleData(): void {
    this.confData.getTimeline(
      this.dayIndex, 
      this.queryText, 
      this.excludeTracks, 
      this.segment
    ).subscribe((data: ScheduleData) => {
      this.shownSessions = data.shownSessions;
      this.groups = data.groups;
    });
  }

  async presentFilter(): Promise<void> {
    const modal = await this.createFilterModal();
    await modal.present();
    
    const { data } = await modal.onWillDismiss();
    this.handleFilterDismiss(data);
  }

  private async createFilterModal() {
    return this.modalCtrl.create({
      component: ScheduleFilterPage,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: { excludedTracks: this.excludeTracks }
    });
  }

  private handleFilterDismiss(data: any): void {
    if (data) {
      this.excludeTracks = data;
      this.updateSchedule();
    }
  }

  async addFavorite(
    slidingItem: HTMLIonItemSlidingElement, 
    sessionData: SessionData
  ): Promise<void> {
    this.user.hasFavorite(sessionData.name) 
      ? await this.promptRemoveFavorite(slidingItem, sessionData)
      : await this.createFavoriteToast(slidingItem, sessionData);
  }

  private async promptRemoveFavorite(
    slidingItem: HTMLIonItemSlidingElement, 
    sessionData: SessionData
  ): Promise<void> {
    this.removeFavorite(slidingItem, sessionData, 'Favorite already added');
  }

  private async createFavoriteToast(
    slidingItem: HTMLIonItemSlidingElement, 
    sessionData: SessionData
  ): Promise<void> {
    this.user.addFavorite(sessionData.name);
    slidingItem.close();

    const toast = await this.toastCtrl.create({
      header: `${sessionData.name} was successfully added as a favorite.`,
      duration: 3000,
      buttons: [{ text: 'Close', role: 'cancel' }]
    });

    await toast.present();
  }

  async removeFavorite(
    slidingItem: HTMLIonItemSlidingElement, 
    sessionData: SessionData, 
    title: string
  ): Promise<void> {
    const alert = await this.createRemoveFavoriteAlert(
      slidingItem, 
      sessionData, 
      title
    );
    await alert.present();
  }

  private async createRemoveFavoriteAlert(
    slidingItem: HTMLIonItemSlidingElement, 
    sessionData: SessionData, 
    title: string
  ) {
    return this.alertCtrl.create({
      header: title,
      message: 'Would you like to remove this session from your favorites?',
      buttons: [
        this.createCancelButton(slidingItem),
        this.createRemoveButton(slidingItem, sessionData)
      ]
    });
  }

  private createCancelButton(slidingItem: HTMLIonItemSlidingElement) {
    return {
      text: 'Cancel',
      handler: () => slidingItem.close()
    };
  }

  private createRemoveButton(
    slidingItem: HTMLIonItemSlidingElement, 
    sessionData: SessionData
  ) {
    return {
      text: 'Remove',
      handler: () => {
        this.user.removeFavorite(sessionData.name);
        this.updateSchedule();
        slidingItem.close();
      }
    };
  }

  async openSocial(network: string, fab: HTMLIonFabElement): Promise<void> {
    const loading = await this.createSocialPostLoading(network);
    await loading.present();
    await loading.onWillDismiss();
    fab.close();
  }

  private async createSocialPostLoading(network: string) {
    return this.loadingCtrl.create({
      message: `Posting to ${network}`,
      duration: (Math.random() * 1000) + 500
    });
  }
}