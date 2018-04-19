import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
@Component({
  selector: 'page-dialog-info',
  templateUrl: 'dialog-info.html',
})
export class DialogInfoPage {
  cliente="";
  subtotal=0.0;
  total=0.0;
  iva=0.0;
  fecha="";
  dat=[];
  constructor(public alerta:AlertaProvider,public alert:AlertController,public load:LoadingController, public navCtrl: NavController, public navParams: NavParams, public view:ViewController,public databaseProvider:DatabaseProvider) {
    let loader = this.load.create({
      content:"Cargando..."
    })
    loader.present().then(() =>{
    console.log(navParams.data);
    this.cliente = navParams.data.cli;
     this.databaseProvider.getDatabaseState().subscribe(rdy =>{
        if(rdy){
          this.databaseProvider.obtenerDpedidosInfo(navParams.data.userId).then(data =>{
            this.dat = data;
            this.subtotal=0.0;
            this.total=0.0;
            this.iva=0.0;
            for(var i=0; i < this.dat.length;i++){
              if(i===0){
                this.fecha = this.dat[0].fecha;
              }
              this.subtotal+=this.dat[i].subtotal;
              this.total+=this.dat[i].total;
              this.iva+=this.dat[i].iva;
            }
            this.subtotal = this.formateo(this.subtotal,2);
            this.total = this.formateo(this.total,2);
            this.iva = this.formateo(this.iva,2);
            loader.dismiss();
          }).catch(error =>{
            loader
            this.alerta.mostrarError('Error',error);
          });
        }
      });
    });
   
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
  cerrar(){
    this.view.dismiss();
  }

}
