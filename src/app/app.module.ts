import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, Injectable, Injector } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpModule } from '@angular/http';
import { MyApp } from './app.component';
import { SQLite } from '@ionic-native/sqlite';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { DatabaseProvider } from '../providers/database/database';
import { IonicStorageModule } from '@ionic/storage';
import { AlertaProvider } from '../providers/alerta/alerta';
import { HomePage } from '../pages/home/home';
import { ParametrosPage } from '../pages/parametros/parametros';
import { MenuPage } from '../pages/menu/menu';
import { SincronizarPage } from '../pages/sincronizar/sincronizar';
import { MenuPedidosPage } from '../pages/menu-pedidos/menu-pedidos';
import { MenuRecibosPage } from '../pages/menu-recibos/menu-recibos';
import { MenuSincronizarPage } from '../pages/menu-sincronizar/menu-sincronizar';
import { PedidoPage } from '../pages/pedido/pedido';
import { ReciboPage } from '../pages/recibo/recibo';
import { TabClientePage } from '../pages/tab-cliente/tab-cliente';
import { TabDetallesPage } from '../pages/tab-detalles/tab-detalles';
import { TabDetallesCatalogoPage } from '../pages/tab-detalles-catalogo/tab-detalles-catalogo';
import { TabResumenPage } from '../pages/tab-resumen/tab-resumen';
import { TabRecClientePage } from '../pages/tab-rec-cliente/tab-rec-cliente';
import { TabRecTipopagoPage } from '../pages/tab-rec-tipopago/tab-rec-tipopago';
import { TabRecResumenPage } from '../pages/tab-rec-resumen/tab-rec-resumen';
import { DialogInfoPage } from '../pages/dialog-info/dialog-info';
import { DlgCrearclientePage } from '../pages/dlg-crearcliente/dlg-crearcliente';
import { DlgFiltroPage } from '../pages/dlg-filtro/dlg-filtro';
import { SubirPedidosPage } from '../pages/subir-pedidos/subir-pedidos';
import { SubirRecibosPage } from '../pages/subir-recibos/subir-recibos';
import { DlgInfoDocumentoPage } from '../pages/dlg-info-documento/dlg-info-documento';
import { TabResumenComercialPage } from '../pages/tab-resumen-comercial/tab-resumen-comercial';
import { PedidosSubidosPage } from '../pages/pedidos-subidos/pedidos-subidos';
import { SaldosPage } from '../pages/saldos/saldos';
import { RecibosSubidosPage } from '../pages/recibos-subidos/recibos-subidos';
import { ListaClientesPage } from '../pages/lista-clientes/lista-clientes';
import { TabPedidosSubidosPage } from '../pages/tab-pedidos-subidos/tab-pedidos-subidos';
import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Keyboard } from '@ionic-native/keyboard';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { File } from '@ionic-native/file';
import { IonicImageLoader } from 'ionic-image-loader';
import { Insomnia } from '@ionic-native/insomnia';
import { Device } from '@ionic-native/device';
import { AppVersion } from '@ionic-native/app-version';
import {DlgDetallesPage} from '../pages/dlg-detalles/dlg-detalles'
import {DlgDetProductoPage} from '../pages/dlg-det-producto/dlg-det-producto'
import {DlgIngObsPage} from '../pages/dlg-ing-obs/dlg-ing-obs'
import { ExpandableHeader } from '../components/expandable-header/expandable-header';
import { ElasticHeaderModule } from "ionic2-elastic-header/dist";
import {HideHeaderDirective} from '../directives/hide-header/hide-header'
import { IonicImageViewerModule } from 'ionic-img-viewer';



@Injectable()
export class MyErrorHandler implements ErrorHandler {
  ionicErrorHandler: IonicErrorHandler;

  constructor(injector: Injector) {
    try {
      this.ionicErrorHandler = injector.get(IonicErrorHandler);
    } catch(e) {
      // Unable to get the IonicErrorHandler provider, ensure
      // IonicErrorHandler has been added to the providers list below
    }
  }

  handleError(err: any): void {
    console.log('Error ',err);
    
  }
}



@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ParametrosPage,
    MenuPage,
    SincronizarPage,
    MenuPedidosPage,
    PedidoPage,
    TabClientePage,
    ListaClientesPage,
    TabDetallesPage,
    DialogInfoPage,
    TabResumenPage,
    DlgCrearclientePage,
    SubirPedidosPage,
    TabPedidosSubidosPage,
    TabResumenComercialPage,
    PedidosSubidosPage,
    MenuRecibosPage,
    ReciboPage,
    TabRecClientePage,
    TabRecResumenPage,
    TabRecTipopagoPage,
    DlgInfoDocumentoPage,
    SubirRecibosPage,
    RecibosSubidosPage,
    MenuSincronizarPage,
    TabDetallesCatalogoPage,
    ExpandableHeader,
    HideHeaderDirective,
    DlgFiltroPage,
    DlgDetallesPage,
    SaldosPage,
    DlgIngObsPage,
    DlgDetProductoPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp, {
      platforms : {
        android : {
          scrollAssist: false, 
          autoFocusAssist: false  
        }
      }
    }),
    IonicStorageModule .forRoot(),
    ElasticHeaderModule ,
    IonicImageLoader.forRoot(),
	IonicImageViewerModule
    
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ParametrosPage,
    MenuPage,
    SincronizarPage,
    MenuPedidosPage,
    PedidoPage,
    TabClientePage,
    ListaClientesPage,
    TabDetallesPage,
    DialogInfoPage,
    TabResumenPage,
    DlgCrearclientePage,
    SubirPedidosPage,
    TabPedidosSubidosPage,
    TabResumenComercialPage,
    PedidosSubidosPage,
    ReciboPage,
    MenuRecibosPage,
    TabRecClientePage,
    TabRecResumenPage,
    TabRecTipopagoPage,
    DlgInfoDocumentoPage, 
    SubirRecibosPage,
    RecibosSubidosPage,
    MenuSincronizarPage,
    TabDetallesCatalogoPage,
    DlgFiltroPage,
    DlgDetallesPage,
    SaldosPage,
    DlgIngObsPage,
    DlgDetProductoPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    /*{provide: ErrorHandler, useClass: IonicErrorHandler},*/
    IonicErrorHandler,
        [{ provide: ErrorHandler, useClass: MyErrorHandler }],
    DatabaseProvider,
    SQLite,
    SQLitePorter,
    AlertaProvider,
    Geolocation,
    Diagnostic,
    Keyboard,
    File,
    AndroidFullScreen,
    Insomnia,
    Device,
    AppVersion
  ]
})
export class AppModule {}
