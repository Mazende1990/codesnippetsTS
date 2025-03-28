import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { AppProvider } from '../../providers/app/app';
import { ConfigProvider } from '../../providers/config/config';
import { PlatformProvider } from '../../providers/platform/platform';
import { ActionSheetParent } from '../action-sheet/action-sheet-parent';

interface MenuOption {
  imgSrc: string;
  mainLabel: string;
  secondaryLabel: string;
  showOption: boolean;
  nextView: {
    name: string;
    params: any;
  };
  logEvent?: string;
}

@Component({
  selector: 'footer-menu',
  templateUrl: 'footer-menu.html'
})
export class FooterMenuComponent extends ActionSheetParent {
  public optionsMenu: Record<string, MenuOption>;
  public isCordova: boolean;
  public clipboardData: string;
  private appName: string;

  constructor(
    private translate: TranslateService,
    private appProvider: AppProvider,
    private platformProvider: PlatformProvider,
    private configProvider: ConfigProvider,
    private analyticsProvider: AnalyticsProvider
  ) {
    super();
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.appName = this.appProvider.info.name;
    this.isCordova = this.platformProvider.isCordova;
    this.optionsMenu = this.createMenuOptions();
  }

  private createMenuOptions(): Record<string, MenuOption> {
    const alternativeIsoCode = this.configProvider.get().wallet.settings.alternativeIsoCode;
    const isBitPayApp = this.appName === 'bitpay';
    const isCopayApp = this.appName === 'copay';

    return {
      buyCrypto: this.createBuyCryptoOption(isBitPayApp, alternativeIsoCode),
      exchange: this.createExchangeOption(isBitPayApp, alternativeIsoCode),
      receive: this.createReceiveOption(),
      send: this.createSendOption(),
      buyGiftCards: this.createBuyGiftCardsOption(isCopayApp)
    };
  }

  private createBuyCryptoOption(isBitPayApp: boolean, alternativeIsoCode: string): MenuOption {
    return {
      imgSrc: 'assets/img/footer-menu/buy-crypto.svg',
      mainLabel: this.translate.instant('Buy Crypto'),
      secondaryLabel: this.translate.instant('Buy crypto with cash'),
      showOption: isBitPayApp && this.isCordova,
      nextView: {
        name: 'AmountPage',
        params: {
          fromBuyCrypto: true,
          nextPage: 'CryptoOrderSummaryPage',
          currency: alternativeIsoCode
        }
      },
      logEvent: 'menu_buy_crypto_button_clicked'
    };
  }

  private createExchangeOption(isBitPayApp: boolean, alternativeIsoCode: string): MenuOption {
    return {
      imgSrc: 'assets/img/footer-menu/exchange.svg',
      mainLabel: this.translate.instant('Swap'),
      secondaryLabel: this.translate.instant('Swap crypto for another'),
      showOption: isBitPayApp && this.isCordova,
      nextView: {
        name: 'ExchangeCryptoPage',
        params: {
          currency: alternativeIsoCode
        }
      },
      logEvent: 'menu_exchange_crypto_button_clicked'
    };
  }

  private createReceiveOption(): MenuOption {
    return {
      imgSrc: 'assets/img/footer-menu/receive.svg',
      mainLabel: this.translate.instant('Receive'),
      secondaryLabel: this.translate.instant('Get crypto from another wallet'),
      showOption: true,
      nextView: {
        name: 'CoinAndWalletSelectorPage',
        params: {
          walletSelectorTitle: this.translate.instant('Select destination wallet'),
          action: 'receive',
          fromFooterMenu: true
        }
      },
      logEvent: 'menu_receive_crypto_clicked'
    };
  }

  private createSendOption(): MenuOption {
    return {
      imgSrc: 'assets/img/footer-menu/send.svg',
      mainLabel: this.translate.instant('Send'),
      secondaryLabel: this.translate.instant('Send crypto to another wallet'),
      showOption: true,
      nextView: {
        name: 'CoinAndWalletSelectorPage',
        params: {
          walletSelectorTitle: this.translate.instant('Select source wallet'),
          action: 'send',
          fromFooterMenu: true
        }
      },
      logEvent: 'menu_send_crypto_clicked'
    };
  }

  private createBuyGiftCardsOption(isCopayApp: boolean): MenuOption {
    return {
      imgSrc: 'assets/img/footer-menu/buy-gift-card.svg',
      mainLabel: this.translate.instant('Buy Gift Cards'),
      secondaryLabel: this.translate.instant('Buy gift cards with crypto'),
      showOption: !isCopayApp,
      nextView: {
        name: 'CardCatalogPage',
        params: {}
      },
      logEvent: 'menu_buy_giftcards_clicked'
    };
  }

  ngOnInit() {
    this.clipboardData = this.params.clipboardData;
  }

  public optionClicked(option: MenuOption): void {
    if (option.logEvent) {
      this.logEvent(option.logEvent);
    }
    this.dismiss(option.nextView);
  }

  public openScanPage(): void {
    this.logEvent('scan_button_clicked');
    this.dismiss({
      name: 'ScanPage',
      params: { fromFooterMenu: true }
    });
  }

  public processClipboardData(): void {
    this.logEvent('clipboard_clicked');
    this.dismiss({ params: { fromFooterMenu: true } });
  }

  private logEvent(eventName: string): void {
    this.analyticsProvider.logEvent(eventName, { from: 'footerMenu' });
  }
}