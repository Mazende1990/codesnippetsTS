import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { AppProvider } from '../../providers/app/app';
import { ConfigProvider } from '../../providers/config/config';
import { PlatformProvider } from '../../providers/platform/platform';
import { ActionSheetParent } from '../action-sheet/action-sheet-parent';

interface FooterMenuOption {
  imgSrc: string;
  mainLabel: string;
  secondaryLabel: string;
  showOption: boolean;
  nextView: {
    name: string;
    params: Record<string, any>;
  };
  logEvent: string;
}

interface FooterMenuOptions {
  [key: string]: FooterMenuOption;
}

@Component({
  selector: 'footer-menu',
  templateUrl: 'footer-menu.html'
})
export class FooterMenuComponent extends ActionSheetParent implements OnInit {
  public optionsMenu: FooterMenuOptions;
  public clipboardData: string;

  private readonly appName: string;
  private readonly isCordova: boolean;
  private readonly alternativeIsoCode: string;

  constructor(
    private translate: TranslateService,
    private appProvider: AppProvider,
    private platformProvider: PlatformProvider,
    private configProvider: ConfigProvider,
    private analyticsProvider: AnalyticsProvider
  ) {
    super();
    this.appName = this.appProvider.info.name;
    this.isCordova = this.platformProvider.isCordova;
    this.alternativeIsoCode = this.configProvider.get().wallet.settings.alternativeIsoCode;
    
    this.optionsMenu = this.initializeOptionsMenu();
  }

  ngOnInit() {
    this.clipboardData = this.params.clipboardData;
  }

  private initializeOptionsMenu(): FooterMenuOptions {
    return {
      buyCrypto: this.createMenuOption(
        'buy-crypto.svg', 
        'Buy Crypto', 
        'Buy crypto with cash', 
        this.appName === 'bitpay' && this.isCordova,
        {
          name: 'AmountPage',
          params: {
            fromBuyCrypto: true,
            nextPage: 'CryptoOrderSummaryPage',
            currency: this.alternativeIsoCode
          }
        },
        'menu_buy_crypto_button_clicked'
      ),
      exchange: this.createMenuOption(
        'exchange.svg', 
        'Swap', 
        'Swap crypto for another', 
        this.appName === 'bitpay' && this.isCordova,
        {
          name: 'ExchangeCryptoPage',
          params: {
            currency: this.alternativeIsoCode
          }
        },
        'menu_exchange_crypto_button_clicked'
      ),
      receive: this.createMenuOption(
        'receive.svg', 
        'Receive', 
        'Get crypto from another wallet', 
        true,
        {
          name: 'CoinAndWalletSelectorPage',
          params: {
            walletSelectorTitle: this.translate.instant('Select destination wallet'),
            action: 'receive',
            fromFooterMenu: true
          }
        },
        'menu_receive_crypto_clicked'
      ),
      send: this.createMenuOption(
        'send.svg', 
        'Send', 
        'Send crypto to another wallet', 
        true,
        {
          name: 'CoinAndWalletSelectorPage',
          params: {
            walletSelectorTitle: this.translate.instant('Select source wallet'),
            action: 'send',
            fromFooterMenu: true
          }
        },
        'menu_send_crypto_clicked'
      ),
      buyGiftCards: this.createMenuOption(
        'buy-gift-card.svg', 
        'Buy Gift Cards', 
        'Buy gift cards with crypto', 
        this.appName !== 'copay',
        {
          name: 'CardCatalogPage',
          params: {}
        },
        'menu_buy_giftcards_clicked'
      )
    };
  }

  private createMenuOption(
    imgName: string, 
    mainLabel: string, 
    secondaryLabel: string, 
    showOption: boolean, 
    nextView: { name: string; params: Record<string, any> },
    logEvent: string
  ): FooterMenuOption {
    return {
      imgSrc: `assets/img/footer-menu/${imgName}`,
      mainLabel: this.translate.instant(mainLabel),
      secondaryLabel: this.translate.instant(secondaryLabel),
      showOption,
      nextView,
      logEvent
    };
  }

  public optionClicked(opt: FooterMenuOption) {
    if (opt.logEvent) {
      this.analyticsProvider.logEvent(opt.logEvent, {
        from: 'footerMenu'
      });
    }
    this.dismiss(opt.nextView);
  }

  public openScanPage() {
    this.analyticsProvider.logEvent('scan_button_clicked', {
      from: 'footerMenu'
    });
    const nextView = {
      name: 'ScanPage',
      params: {
        fromFooterMenu: true
      }
    };
    this.dismiss(nextView);
  }

  public processClipboardData() {
    this.analyticsProvider.logEvent('clipboard_clicked', {
      from: 'footerMenu'
    });
    const nextView = {
      params: {
        fromFooterMenu: true
      }
    };
    this.dismiss(nextView);
  }
}