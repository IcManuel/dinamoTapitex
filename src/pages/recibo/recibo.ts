import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TabRecClientePage } from '../tab-rec-cliente/tab-rec-cliente';
import { TabRecResumenPage } from '../tab-rec-resumen/tab-rec-resumen';
import { TabRecTipopagoPage} from '../tab-rec-tipopago/tab-rec-tipopago';

@Component({
  selector: 'page-recibo',
  templateUrl: 'recibo.html',
})
export class ReciboPage {
  tabResumen = TabRecResumenPage;
  tabTipoPago = TabRecTipopagoPage;
  tabCliente = TabRecClientePage;
  params={};
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.params = {
      uac : this.navParams.get("uac")
    }
  }
}
