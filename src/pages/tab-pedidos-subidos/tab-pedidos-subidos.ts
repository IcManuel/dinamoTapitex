import { Component } from '@angular/core';
import { NavController, NavParams,ModalController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import {DlgDetallesPage} from '../dlg-detalles/dlg-detalles'

@Component({
  selector: 'page-tab-pedidos-subidos',
  templateUrl: 'tab-pedidos-subidos.html',
})
export class TabPedidosSubidosPage {
  pedidos = [];
  i = 0;
  parametros = [];
  fechaInicio: String = this.getMonday(new Date()).toISOString();
  fechaFin : String = this.getSunday(new Date()).toISOString();
  total = 0;
  constructor(public navCtrl: NavController, public navParams: NavParams, public database: DatabaseProvider,
              public alerta: AlertaProvider, public load: LoadingController, public alert :AlertController,
            public modal :ModalController) {
              let fe = this.getMonday(new Date());
    let loader = load.create({
      content:"Cargando..."
    });
    loader.present().then(()=>{
      this.database.obtenerPedidosFecha(1,this.fechaInicio,this.fechaFin).then(dat =>{
        this.pedidos = dat;
        this.cargarDatos().then(res =>{
        });        
        this.database.obtenerParametros().then(par =>{
          this.parametros = par;
        });
        loader.dismiss();
      }).catch(error=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener pedidos', error.message);
      });
    }); 
  }
  cambioFecha(){
    let loader = this.load.create({
      content:"Cargando..."
    });
    loader.present().then(()=>{
      this.i = 0;
      this.pedidos = [];
      this.total =0;
      this.database.obtenerPedidosFecha(1,this.fechaInicio,this.fechaFin).then(dat =>{
        this.pedidos = dat;
        this.cargarDatos().then(res =>{
        });        
        this.database.obtenerParametros().then(par =>{
          this.parametros = par;
        });
        loader.dismiss();
      }).catch(error=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener pedidos', error.message);
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
  cargarDatos(){
    return new Promise ((resolve)=>{
      this.i = 0;
      this.nextStep();
    });
  }
  nextStep() {
    if(this.i<this.pedidos.length){
      this.obtenerClienteNuevo(this.i).then(rs=>{
        this.i++;
        setTimeout(this.nextStep(), 500);
      }).catch(ecs=>{
        this.alerta.mostrarError('Error al verificar item '+this.i,ecs.message);
      });
    }else{
    }
  }
  obtenerClienteNuevo(i){
    return new Promise((resolve,reject)=>{
      this.total+=this.pedidos[i].total;
      if(this.pedidos[i].cliente < 0){
        this.database.obtenerClienteNuevoPorId(this.pedidos[i].cliente).then(resc =>{
          this.pedidos[i].clienteNuevo = resc;
          // this.database.obtenerDetallesPedidoNormal(this.pedidos[i].id).then(res=>{
          //   this.pedidos[i].detalles = res;
          // });
          resolve(1);
        }).catch(errcl =>{
          reject(-1)
          this.alerta.mostrarError('Error al obtener cliente nuevo ',errcl.message);
          this.pedidos[i].clienteNuevo = null;
        });
      }else{
        this.pedidos[i].clienteNuevo = null;
        this.database.obtenerDetallesPedidoNormal(this.pedidos[i].id).then(res=>{
          this.pedidos[i].detalles = res;
        });
        resolve(1);
      }
    });
  }
  eliminarPed(ped){
    //this.database.borrarCpedidoPorId(ped.id);
    //this.database.borrarDpedidosPorCpedido(ped.id);
    this.database.actualizarSincro(ped.id,2);
    let ind = this.pedidos.indexOf(ped);
    this.pedidos.splice(ind,1);
  }
  eliminarTodo(){
    let loader = this.load.create( {
      content:"Eliminando..."
    });
    loader.present().then(()=>{
      for(var x =0; x < this.pedidos.length; x++){
        //this.database.borrarDpedidosPorCpedido(this.pedidos[x].id);
        this.database.actualizarSincro(this.pedidos[x].id,2);
        if(x === (this.pedidos.length-1)){
          loader.dismiss();
          this.pedidos = [];
        }
      }
    });
  }
  abrirDetalle(ped){
    let clienteModal = this.modal.create(DlgDetallesPage,{
      idPedido : ped.id,
      impuesto : this.parametros[3]
    },{cssClass : 'pricebreakup'});
    clienteModal.onDidDismiss(datos =>{
    });
    clienteModal.present();
  }
  getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }
  getSunday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1) + 6; // adjust when day is sunday
    return new Date(d.setDate(diff));
  }
  darFormatoFecha(fecha){
       if(fecha!==null){
         var datestring = ("0" + fecha.getDate()).slice(-2) + "-" + ("0"+(fecha.getMonth()+1)).slice(-2) + "-" +fecha.getFullYear()+" "+("0" + fecha.getHours()).slice(-2)+":"+("0" + fecha.getMinutes()).slice(-2) +":"+("0" + fecha.getSeconds()).slice(-2) ;
      return datestring;
       }else{
         return "";
       }
    }
  
}
