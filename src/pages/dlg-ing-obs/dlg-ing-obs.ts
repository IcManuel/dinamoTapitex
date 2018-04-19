import { Component } from '@angular/core';
import { NavController, NavParams,ViewController } from 'ionic-angular';

/**
 * Generated class for the DlgIngObsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-dlg-ing-obs',
  templateUrl: 'dlg-ing-obs.html',
})
export class DlgIngObsPage {
  obs:'';
  constructor(public navCtrl: NavController, public navParams: NavParams, public view: ViewController) {
  }

  guardar(){
    let cerrar = {
      cerrar: false,
      obs: this.obs
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
