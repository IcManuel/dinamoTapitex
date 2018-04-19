import { Component } from '@angular/core';
import { NavController, NavParams,AlertController} from 'ionic-angular';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { DatabaseProvider } from '../../providers/database/database';
import { LoadingController } from 'ionic-angular';



@Component({
  selector: 'page-subir-recibos',
  templateUrl: 'subir-recibos.html',
})
export class SubirRecibosPage {
  tiposPago = [];
  recibos = [];
  i = 0;
  j=0;
  uac;
   respuestas;
  parametros=[];
  constructor(public navCtrl: NavController, public navParams: NavParams, public alert:AlertController, 
              public alerta:AlertaProvider, public database: DatabaseProvider, public load: LoadingController) {
    let loader = load.create();
    this.uac = navParams.data.uac;
    loader.present().then(() =>{
      this.database.obtenerTotalesPorTpa().then(res =>{
        let f;
        f =res;
        if(f !==null){
          this.tiposPago = f;
        }else{
          this.tiposPago = [];
        }
        this.database.obtenerRecibosSincro(0).then(re => {
          if(re !==null){
            let f;
            f =re;
            this.recibos = f;
            this.cargarDatos();
          }else{
            this.recibos =[];
          }
          this.database.obtenerSaldoPendiente().then(sl=>{
            if(sl!==null){
              let s;
              s = sl;
              let tp = {
                nombre:"PENDIENTE",
                valor:Math.round(s*100)/100,
                color:"#F4FA58"
              }
              this.tiposPago.push(tp);
            }
             this.database.obtenerParametros().then(par =>{
              this.parametros = par;
              loader.dismiss();
            });
          }).catch(ecsd=>{
            loader.dismiss();
            this.alerta.mostrarError('Error al obtener saldo pendiente',ecsd.message);
          })
        }).catch(ec =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener recibos',ec.message);
        });
      }).catch(err =>{  
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener tipos de pago',err.message);
      })
    });
  }
  cargarDatos(){
    return new Promise ((resolve)=>{
      this.i = 0;
      this.nextStep();
    });
  }
  nextStep() {
        if(this.i<this.recibos.length){
          this.obtenerClienteNuevo(this.i).then(rs=>{
            this.i++;
            setTimeout(this.nextStep(), 500);
          }).catch(ecs=>{
            this.alerta.mostrarError('Error al verificar item '+this.i,ecs.message);
          });
        }else{
          console.log('Finish ->' ,this.recibos);
          
        }
      }
  subirTodo(){
    let loader = this.load.create({
      content:"Procesando..."
    });
    loader.present().then(() =>{
      this.database.sincronizarRecibos(this.parametros,this.recibos).then(respuesta => {

        this.respuestas = respuesta;
        this.revisarRespuesta();
        loader.dismiss();
      }).catch(error =>{
        loader.dismiss();
        this.alerta.mostrarError('Error al sincronizar información',error.message);
      });
    });
  }
  revisarRespuesta(){
    return new Promise ((resolve)=>{
      this.j = 0;
      this.siguiente();
    });
  }
  siguiente() {
        if(this.j<this.respuestas.length){
          this.revisarRes(this.j).then(rs=>{
            this.j++;
            setTimeout(this.siguiente(), 500);
          }).catch(ecs=>{
            this.alerta.mostrarError('Error al veriricar respuesta '+this.j,ecs.message);
          });
        }else{
         console.log('Finalizó subida -> ',this.recibos);
          this.database.obtenerTotalesPorTpa().then(res =>{
                    let f;
                    f =res;
                    if(f !==null){
                      this.tiposPago = f;
                    }else{
                      this.tiposPago = [];
                    }
                    this.database.obtenerRecibosSincro(0).then(re => {
                      if(re !==null){
                        let f;
                        f =re;
                        this.recibos = f;
                        this.cargarDatos();
                      }else{
                        this.recibos =[];
                      }
                      this.database.obtenerSaldoPendiente().then(sl=>{
                        if(sl!==null){
                          let s;
                          s = sl;
                          let tp = {
                            nombre:"PENDIENTE",
                            valor:Math.round(s*100)/100,
                            color:"#F4FA58"
                          }
                          this.tiposPago.push(tp);
                        }
                      }).catch(ecsd=>{
                        this.alerta.mostrarError('Error al obtener saldo pendiente',ecsd.message);
                      })
                    }).catch(ec =>{
                      this.alerta.mostrarError('Error al obtener recibos',ec.message);
                    });
                  }).catch(err =>{  
                    this.alerta.mostrarError('Error al obtener tipos de pago',err.message);
                  });
          
        }
  }
  revisarRes(i){
    return new Promise((resolve)=>{
      let cpe = this.respuestas[i];
      if(cpe.estado === 1){
        this.database.actualizarSincroCre(cpe.idReciboMovil,1);
        let ped = this.obtenerCreciboDeLista(cpe.idReciboMovil);
        let a = this.recibos.lastIndexOf(ped);
        this.recibos.splice(a,1);
        resolve(1);
      }else{
        let ped = this.obtenerCreciboDeLista(cpe.idReciboMovil);
        let a = this.recibos.lastIndexOf(ped);
        this.recibos[a].error = true;
        this.recibos[a].mensaje=cpe.mensaje;
        resolve(1);
      }
    });
  }
  subirUno(rec){
    let loader = this.load.create({
      content:"Procesando..."
    });
    loader.present().then(() =>{
      let recibos = [rec];
      this.database.sincronizarRecibos(this.parametros,recibos).then(respuesta => {
        let cpe = respuesta[0];
        if(cpe.estado === 1){
          this.database.actualizarSincroCre(cpe.idReciboMovil,1);
          let ped = this.obtenerCreciboDeLista(cpe.idReciboMovil);
          let a = this.recibos.lastIndexOf(ped);
          this.recibos.splice(a,1);
          this.database.obtenerTotalesPorTpa().then(res =>{
                    let f;
                    f =res;
                    if(f !==null){
                      this.tiposPago = f;
                    }else{
                      this.tiposPago = [];
                    }
                    this.database.obtenerRecibosSincro(0).then(re => {
                      if(re !==null){
                        let f;
                        f =re;
                        this.recibos = f;
                        this.cargarDatos();
                      }else{
                        this.recibos =[];
                      }
                      this.database.obtenerSaldoPendiente().then(sl=>{
                        if(sl!==null){
                          let s;
                          s = sl;
                          let tp = {
                            nombre:"PENDIENTE",
                            valor:Math.round(s*100)/100,
                            color:"#F4FA58"
                          }
                          this.tiposPago.push(tp);
                        }
                        loader.dismiss();
                      }).catch(ecsd=>{
                        loader.dismiss();
                        this.alerta.mostrarError('Error al obtener saldo pendiente',ecsd.message);
                      })
                    }).catch(ec =>{
                      loader.dismiss();
                      this.alerta.mostrarError('Error al obtener recibos',ec.message);
                    });
                  }).catch(err =>{  
                    loader.dismiss();
                    this.alerta.mostrarError('Error al obtener tipos de pago',err.message);
                  });
        }else{
          let ped = this.obtenerCreciboDeLista(cpe.idReciboMovil);
          let a = this.recibos.lastIndexOf(ped);
          this.recibos[a].error = true;
          this.recibos[a].mensaje=cpe.mensaje;
        }
        loader.dismiss();
      }).catch(error =>{
        loader.dismiss();
        this.alerta.mostrarError('Error al sincronizar información',error.message);
      });
    });
  }
  mostrarError(ped){
    if(ped.error === true ){
      let alert = this.alert.create({
        title: 'Error',
        subTitle: ped.mensaje,
        buttons: ['Dismiss']
      });
      alert.present();
    }
  }
  obtenerCreciboDeLista(id){
    for(var i = 0;i<this.recibos.length;i++){
      if(this.recibos[i].id === id){
        return this.recibos[i];
      }
    }
  }
  obtenerClienteNuevo(i){
    return new Promise((resolve,reject)=>{
      if(this.recibos[i].cliente < 0){
        this.database.obtenerClienteNuevoPorId(this.recibos[i].cliente).then(resc =>{
          this.recibos[i].clientemovilnuevo = resc;
          this.database.obtenerDetallesRecibo(this.recibos[i].id).then(res=>{
            this.recibos[i].detalles = res;
            this.recibos[i].uac = this.uac;
            this.recibos[i].error = false;
            this.recibos[i].mensaje ="";
            this.database.obtenerDcancelaRecibo(this.recibos[i].id).then(dres=>{
              this.recibos[i].cancelaciones = dres;
            });
          });
          resolve(1);
        }).catch(errcl =>{
          reject(-1)
          this.alerta.mostrarError('Error al obtener cliente nuevo ',errcl.message);
          this.recibos[i].clienteNuevo = null;
        });
      }else{
        this.recibos[i].clienteNuevo = null;
        this.database.obtenerDetallesRecibo(this.recibos[i].id).then(res=>{
          this.recibos[i].detalles = res;
          this.recibos[i].uac = this.uac;
          this.database.obtenerDcancelaRecibo(this.recibos[i].id).then(dres=>{
              this.recibos[i].cancelaciones = dres;
            });
        });
        resolve(1);
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
                for(var i = 0; i < rec.cancelaciones.length; i++){
                  let cn = rec.cancelaciones[i];
                  let doc = {
                    saldo : cn.valor,
                    id : cn.iddocumento
                  }
                  this.database.actualizarSaldoDdoSuma(doc);
                }
                this.database.borrarDetallesPorRecibo(rec.id);
                this.database.borrarReciboPorId(rec.id);
                this.database.borrarCancelacionesPorRecibo(rec.id);
                this.database.obtenerTotalesPorTpa().then(res =>{
                    let f;
                    f =res;
                    if(f !==null){
                      this.tiposPago = f;
                    }else{
                      this.tiposPago = [];
                    }
                    this.database.obtenerRecibosSincro(0).then(re => {
                      if(re !==null){
                        let f;
                        f =re;
                        this.recibos = f;
                        this.cargarDatos();
                      }else{
                        this.recibos =[];
                      }
                      this.database.obtenerSaldoPendiente().then(sl=>{
                        if(sl!==null){
                          let s;
                          s = sl;
                          let tp = {
                            nombre:"PENDIENTE",
                            valor:Math.round(s*100)/100,
                            color:"#F4FA58"
                          }
                          this.tiposPago.push(tp);
                        }
                        loader.dismiss();
                      }).catch(ecsd=>{
                        loader.dismiss();
                        this.alerta.mostrarError('Error al obtener saldo pendiente',ecsd.message);
                      })
                    }).catch(ec =>{
                      loader.dismiss();
                      this.alerta.mostrarError('Error al obtener recibos',ec.message);
                    });
                  }).catch(err =>{  
                    loader.dismiss();
                    this.alerta.mostrarError('Error al obtener tipos de pago',err.message);
                  });
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
