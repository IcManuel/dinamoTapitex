import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-tab-resumen-comercial',
  templateUrl: 'tab-resumen-comercial.html',
})
export class TabResumenComercialPage {
  pedidos = [];
  total = 0.0;
  parametros=[];
  i=0;
  productos = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public database: DatabaseProvider,
              public alerta: AlertaProvider, public load: LoadingController, public alert :AlertController) {
    let loader = load.create({
      content:"Cargando..."
    });
    loader.present().then(()=>{
      this.database.obtenerPedidos(1).then(dat =>{
        this.pedidos = dat;
        this.total = 0.0;
        this.cargarDatos().then(res =>{
        });        
        this.database.obtenerParametros().then(par =>{
          this.parametros = par;
        });
        this.database.obtenerResumenComercial().then(reso =>{
          this.productos = reso;
          loader.dismiss();
        }).catch(errss=>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener productos ',errss.message);
        })  
      }).catch(error=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener pedidos', error.message);
      });
    }); 
  }
  cargarDatos(){
    return new Promise ((resolve)=>{
      this.i = 0;
      this.nextStep();
    });
  }
  nextStep() {
    if(this.i<this.pedidos.length){
      console.log('Entra a sumar -> ',this.pedidos[this.i].total);
       this.total += this.pedidos[this.i].total;
       this.i++;
       setTimeout(this.nextStep(), 500);
    }else{
    }
  }

  darFormatoFecha(fecha){
       if(fecha!==null){
         var datestring = ("0" + fecha.getDate()).slice(-2) + "-" + ("0"+(fecha.getMonth()+1)).slice(-2) + "-" +fecha.getFullYear()+" "+("0" + fecha.getHours()).slice(-2)+":"+("0" + fecha.getMinutes()).slice(-2) +":"+("0" + fecha.getSeconds()).slice(-2) ;
      return datestring;
       }else{
         return "";
       }
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
