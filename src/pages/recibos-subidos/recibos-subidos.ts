import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-recibos-subidos',
  templateUrl: 'recibos-subidos.html',
})
export class RecibosSubidosPage {
  recibos = [];
  i = 0;
  constructor(public navCtrl: NavController, public navParams: NavParams, public database: DatabaseProvider, public alerta: AlertaProvider,
              public alert: AlertController, public load: LoadingController) {
       let loader = load.create();
       loader.present().then(() =>{
         this.database.obtenerRecibosSincro(1).then(re => {
          if(re !==null){
            let f;
            f =re;
            this.recibos = f;
            this.cargarDatos(loader);
          }else{
            this.recibos =[];
          }
        }).catch(ec =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener recibos',ec.message);
        });
       });

  }
  cargarDatos(loader){
    return new Promise ((resolve)=>{
      this.i = 0;
      this.nextStep(loader);
    });
  }
  nextStep(loader) {
    if(this.i<this.recibos.length){
      this.obtenerClienteNuevo(this.i).then(rs=>{
        this.i++;
        setTimeout(this.nextStep(loader), 500);
      }).catch(ecs=>{
        this.alerta.mostrarError('Error al verificar item '+this.i,ecs.message);
      });
    }else{
      console.log('Finish ->' ,this.recibos); 
      loader.dismiss();
    }
  }
   obtenerClienteNuevo(i){
    return new Promise((resolve,reject)=>{
      if(this.recibos[i].cliente < 0){
        this.database.obtenerClienteNuevoPorId(this.recibos[i].cliente).then(resc =>{
          this.recibos[i].clientemovilnuevo = resc;
          resolve(1);
        }).catch(errcl =>{
          reject(-1)
          this.alerta.mostrarError('Error al obtener cliente nuevo ',errcl.message);
          this.recibos[i].clienteNuevo = null;
        });
      }else{
        this.recibos[i].clienteNuevo = null;
        resolve(1);
      }
    });
  }
  eliminarTodo(){
    let loader = this.load.create({
      content:"Eliminando..."
    });
    loader.present().then(()=>{
      for(var x =0; x < this.recibos.length; x++){
        let rec = this.recibos[x];
        this.database.borrarDetallesPorRecibo(rec.id);
        this.database.borrarReciboPorId(rec.id);
        this.database.borrarCancelacionesPorRecibo(rec.id);
        if(x === (this.recibos.length-1)){
          loader.dismiss();
          this.recibos = [];
        }
      }
    });
  }
  eliminarRec(rec){
    let alert = this.alert.create({
      title: 'Eliminar recibo',
      message: '¿Desea eliminar el recibo?',
      buttons: [
          {
            text: 'No',
            role: 'cancel'
          },
          {
            text: 'Si',
            handler: () => {
              let loader = this.load.create({
                content:"Eliminando..."
              });
              loader.present().then(()=>{
                this.database.borrarDetallesPorRecibo(rec.id);
                this.database.borrarReciboPorId(rec.id);
                this.database.borrarCancelacionesPorRecibo(rec.id);
                loader.dismiss();
              });
            }
          }
        ]
      });
    alert.present();
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
