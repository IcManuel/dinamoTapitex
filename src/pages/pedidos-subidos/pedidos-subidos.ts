import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TabResumenComercialPage } from '../tab-resumen-comercial/tab-resumen-comercial';
import { TabPedidosSubidosPage } from '../tab-pedidos-subidos/tab-pedidos-subidos';

@Component({
  selector: 'page-pedidos-subidos',
  templateUrl: 'pedidos-subidos.html',
})
export class PedidosSubidosPage {
  tabPedidosSubidos = TabPedidosSubidosPage;
  tabResumen = TabResumenComercialPage;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }


}
