import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ReciboPage } from '../recibo/recibo';
import { SubirRecibosPage } from '../subir-recibos/subir-recibos';
import { RecibosSubidosPage } from '../recibos-subidos/recibos-subidos';
import { Storage } from '@ionic/storage';
@Component({
  selector: 'page-menu-recibos',
  templateUrl: 'menu-recibos.html',
})
export class MenuRecibosPage {
  uac;
  constructor(public navCtrl: NavController, public navParams: NavParams, public storage:Storage) {
    this.uac = navParams.get("uac");
  }
  irARecibos(){
    this.storage.set("datosCabeceraRec",null);
    this.storage.set("documentos",null);
    this.storage.set("clienteRec",null);
    this.navCtrl.push(ReciboPage,{
      uac:this.uac
    })
  }
  irASubirRecibos(){
    this.navCtrl.push(SubirRecibosPage,{
      uac:this.uac
    })
  }
  irAEnviados(){
    this.navCtrl.push(RecibosSubidosPage,{
      uac:this.uac
    })
  }
}
