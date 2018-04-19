import { Component } from '@angular/core';
import { NavController, NavParams,App } from 'ionic-angular';
import { ListaClientesPage } from '../lista-clientes/lista-clientes';
import { SubirPedidosPage } from '../subir-pedidos/subir-pedidos';
import { PedidosSubidosPage } from '../pedidos-subidos/pedidos-subidos';
import { MenuPage } from '../menu/menu';

@Component({
  selector: 'page-menu-pedidos',
  templateUrl: 'menu-pedidos.html',
})
export class MenuPedidosPage {
  uac:any;
  constructor(public navCtrl: NavController, public navParams: NavParams,public appCtrl:App) {
    this.uac = navParams.get("uac")
    
  }
  doYourStuff()
  { 
    this.appCtrl.getRootNav().push(MenuPage,{
      uac:this.uac
    });   
  }
  irAPedidos(){
    this.navCtrl.push(ListaClientesPage,{
      uac:this.uac
    })
  }
  irASubir(){
    this.navCtrl.push(SubirPedidosPage,{
      uac:this.uac
    })
  }
   irAEnviados(){
    this.navCtrl.push(PedidosSubidosPage,{})
  }
}
