import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ViewController } from 'ionic-angular';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { DatabaseProvider } from '../../providers/database/database';
import { LoadingController } from 'ionic-angular';

@Component({
  selector: 'page-dlg-filtro',
  templateUrl: 'dlg-filtro.html',
})
export class DlgFiltroPage {
 
  modeloSelect = -1;
  modelos = [];
  preventas=[];
  preventaSelect = -1;
  promoFiltro = false;
  nuevo = false;
  llegado = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public database : DatabaseProvider, 
              public alerta: AlertaProvider, public load: LoadingController, public alert: AlertController,
              public view: ViewController) {
   
    this.modeloSelect = navParams.data.modeloSelect;
    this.modelos = navParams.data.modelos;
    this.preventas=navParams.data.preventas;
    this.preventaSelect = navParams.data.preventaSelect;
  }
  filtrar(){
    let tieneFiltro = false;
    if(this.promoFiltro===true || this.nuevo ===true || 
       this.modeloSelect!==-1 || this.preventaSelect!==-1 || this.llegado ===true){
        tieneFiltro = true;
    }
    let cerrar = {
      cerrar:false,
      modeloSelect : this.modeloSelect,
      preventaSelect : this.preventaSelect,
      tieneFiltro : tieneFiltro,
      promoFiltro : this.promoFiltro,
      nuevo : this.nuevo,
      llegado : this.llegado
    }
    this.view.dismiss(cerrar);
  }
  cerrar(){
    let cerrar = {
      cerrar: true

    }
    this.view.dismiss(cerrar);
  }
}
