import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { AppProvider } from '../../providers/app/app';
import { ConfigProvider } from '../../providers/config/config';
import { PlatformProvider } from '../../providers/platform/platform';
import { ActionSheetParent } from '../action-sheet/action-sheet-parent';

@Component({
  selector: 'footer-menu',
  templateUrl: 'footer-menu.html'
})
export class FooterMenuComponent extends ActionSheetParent {
  public optionsMenu: object;
  public isCordova: boolean;
  public clipboardData: string;
  private appName: string;

  constructor(
    private translate: TranslateService,
    private appProvider: AppProvider,
    private platformProvider: PlatformProvider,
    private configProvider: ConfigProvider,
    analyticsProvider: AnalyticsProvider
  ) {
    super();
    this.initializeProperties();
    this.initializeOptionsMenu();
  }

  ngOnInit() {
    this.clipboardData = this.params.clipboardData;
  }

  private initializeProperties() {
    this.appName = this.appProvider.info.name;
    this.isCordova = this.platformProvider.isCordova;
  }

  private initializeOptionsMenu() {
    const walletSettings = this.configProvider.get().wallet.settings;
    const isBitpayCordova = this.appName === 'bitpay' && this.isCordova;

    this.optionsMenu = {
      buyCrypto: this.createOption(
        'assets/img/footer-menu/buy-crypto.svg',
        'Buy Crypto',
        'Buy crypto with cash',
        isBitpayCordova,
        'AmountPage',
        { fromBuyCrypto: true, nextPage: 'CryptoOrderSummaryPage', currency: walletSettings.alternativeIsoCode },
        'menu_buy_crypto_button_clicked'
      ),
      exchange: this.createOption(
        'assets/img/footer-menu/exchange.svg',
        'Swap',
        'Swap crypto for another',
        isBitpayCordova,
        'ExchangeCryptoPage',
        { currency: walletSettings.alternativeIsoCode },
        'menu_exchange_crypto_button_clicked'
      ),
      receive: this.createOption(
        'assets/img/footer-menu/receive.svg',
        'Receive',
        'Get crypto from another wallet',
        true,
        'CoinAndWalletSelectorPage',
        { walletSelectorTitle: this.translate.instant('Select destination wallet'), action: 'receive', fromFooterMenu: true },
        'menu_receive_crypto_clicked'
      ),
      send: this.createOption(
        'assets/img/footer-menu/send.svg',
        'Send',
        'Send crypto to another wallet',
        true,
        'CoinAndWalletSelectorPage',
        { walletSelectorTitle: this.translate.instant('Select source wallet'), action: 'send', fromFooterMenu: true },
        'menu_send_crypto_clicked'
      ),
      buyGiftCards: this.createOption(
        'assets/img/footer-menu/buy-gift-card.svg',
        'Buy Gift Cards',
        'Buy gift cards with crypto',
        this.appName !== 'copay',
        'CardCatalogPage',
        {},
        'menu_buy_giftcards_clicked'
      )
    };
  }

  private createOption(imgSrc: string, mainLabel: string, secondaryLabel: string, showOption: boolean, nextViewName: string, nextViewParams: object, logEvent: string) {
    return {
      imgSrc,
      mainLabel: this.translate.instant(mainLabel),
      secondaryLabel: this.translate.instant(secondaryLabel),
      showOption,
      nextView: { name: nextViewName, params: nextViewParams },
      logEvent
    };
  }

  public optionClicked(opt) {
    if (opt.logEvent) {
      this.analyticsProvider.logEvent(opt.logEvent, { from: 'footerMenu' });
    }
    this.dismiss(opt.nextView);
  }

  public openScanPage() {
    this.analyticsProvider.logEvent('scan_button_clicked', { from: 'footerMenu' });
    this.dismiss({ name: 'ScanPage', params: { fromFooterMenu: true } });
  }

  public processClipboardData() {
    this.analyticsProvider.logEvent('clipboard_clicked', { from: 'footerMenu' });
    this.dismiss({ params: { fromFooterMenu: true } });
  }
}