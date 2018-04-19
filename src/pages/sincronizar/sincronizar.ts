import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the SincronizarPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-sincronizar',
  templateUrl: 'sincronizar.html',
})
export class SincronizarPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    console.log('Uac -> ',navParams.get("uac"));
    
  }

  sincronizarClientes(){
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SincronizarPage');
  }

}
