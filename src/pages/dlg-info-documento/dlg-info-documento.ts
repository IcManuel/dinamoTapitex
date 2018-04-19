import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';



@Component({
  selector: 'page-dlg-info-documento',
  templateUrl: 'dlg-info-documento.html',
})
export class DlgInfoDocumentoPage {
  doc={};
  constructor(public navCtrl: NavController, public navParams: NavParams, public view: ViewController) {
    this.doc = this.navParams.get("doc");

  }
  cerrar(){
    this.view.dismiss();
  }
  formateo = function(amount, decimals) {
    amount += '';
    amount = parseFloat(amount.replace(/[^0-9\.]/g, ''));
    decimals = decimals || 0;
    if (isNaN(amount) || amount === 0)
    return parseFloat("0").toFixed(decimals);
    amount = '' + amount.toFixed(decimals);
    var amount_parts = amount.split('.'),
    regexp = /(\d+)(\d{3})/;
    while (regexp.test(amount_parts[0]))
    amount_parts[0] = amount_parts[0].replace(regexp, '$1' + ',' + '$2');
    return amount_parts.join('.');
  }
}
