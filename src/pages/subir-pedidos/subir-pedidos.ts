import { Component } from '@angular/core';
import { NavController, NavParams, App } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { PedidoPage } from '../pedido/pedido';
import { MenuPedidosPage } from '../menu-pedidos/menu-pedidos';
@Component({
  selector: 'page-subir-pedidos',
  templateUrl: 'subir-pedidos.html',
})
export class SubirPedidosPage {
  pedidos = [];
  uac;
  parIva;
  i = 0;
  j =0;
  parametros=[];
  respuestas;
  total = 0;
  constructor(public navCtrl: NavController, public navParams: NavParams, public database: DatabaseProvider,
              public alert : AlertController, public alerta : AlertaProvider, public load: LoadingController,
            public storage: Storage, public appCtrl: App) {
    let loader = load.create({
      content:"Cargando..."
    })
    loader.present().then(()=>{
      this.uac = this.navParams.get("uac");
      this.database.obtenerPedidosTotal(0).then(resss=>{
        this.total = resss;        
      }).catch(ecs=>{
        this.alerta.mostrarError('Error al obtener total', ecs.message);
      })
      this.database.obtenerPedidos(0).then(dat =>{
        this.pedidos = dat; 
        this.cargarDatos().then(res =>{
        });        
        this.database.obtenerParametros().then(par =>{
          this.parametros = par;
          this.parIva = par[3];
        });
        loader.dismiss();
      }).catch(error=>{
        loader.dismiss();
        console.log('Error al obtener pedidos -> ',error);
        this.alerta.mostrarError('Error al obtener pedidos', error.message);
      });
    }); 
  }
  revisarRespuesta(){
    return new Promise ((resolve)=>{
      this.j = 0;
      this.siguiente();
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
          this.obtenerClienteNuevo(this.i).then(rs=>{
            this.i++;
            setTimeout(this.nextStep(), 500);
          }).catch(ecs=>{
            this.alerta.mostrarError('Error al verificar item '+this.i,ecs.message);
          });
        }else{
          console.log('Finish ->' ,this.pedidos);
          
        }
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
          this.database.obtenerPedidosTotal(0).then(resss=>{
            this.total = resss;        
          }).catch(ecs=>{
            this.alerta.mostrarError('Error al obtener total', ecs.message);
          })
          
        }
  }
  revisarRes(i){
    return new Promise((resolve)=>{
      let cpe = this.respuestas[i];
      if(cpe.estado === 1){
        this.database.actualizarSincro(cpe.idPedidoAndroid,1);

        this.database.obtenerDdocumentoPorIdMovil(cpe.idPedidoAndroid).then(idr =>{
          if(idr!==null && idr!==undefined && idr.length>0){
            let idAntes = idr[0].id;
            this.database.actualizarDdo(cpe.idPedidoBase, cpe.idPedidoAndroid);
            this.database.obtenerDdocumentoPorIdMovil(cpe.idPedidoAndroid).then(idr2 =>{
              if(idr2!==null && idr2!==undefined && idr2.length>0){
                let idActual = idr2[0].id;
                this.database.actualizarCancelaM(idActual, idAntes);
              }
          });
          }
        });
        let ped = this.obtenerCpedidoDeLista(cpe.idPedidoAndroid);
        let a = this.pedidos.lastIndexOf(ped);
        this.pedidos.splice(a,1);
        resolve(1);
      }else{
        let ped = this.obtenerCpedidoDeLista(cpe.idPedidoAndroid);
        let a = this.pedidos.lastIndexOf(ped);
        this.pedidos[a].error = true;
        this.pedidos[a].mensaje=cpe.mensaje;
        resolve(1);
      }
    });
  }
  obtenerCpedidoDeLista(id){
    for(var i = 0;i<this.pedidos.length;i++){
      if(this.pedidos[i].id === id){
        return this.pedidos[i];
      }
    }
  }
  obtenerClienteNuevo(i){
    return new Promise((resolve,reject)=>{
      if(this.pedidos[i].cliente < 0){
        this.database.obtenerClienteNuevoPorId(this.pedidos[i].cliente).then(resc =>{
          this.pedidos[i].clienteNuevo = resc;
          this.database.obtenerDetallesPedidoNormal(this.pedidos[i].id).then(res=>{
            this.pedidos[i].detalles = res;
            this.pedidos[i].uac = this.uac;
            this.pedidos[i].error = false;
            this.pedidos[i].mensaje ="";
          });
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
          this.pedidos[i].uac = this.uac;
        });
        resolve(1);
      }
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
  subirTodo(){
    let loader = this.load.create({
      content:"Procesando..."
    });
    loader.present().then(() =>{
      this.database.sincronizarPedidos(this.parametros,this.pedidos).then(respuesta => {
        console.log('Que respuesta viene-> ', respuesta);
        
        this.respuestas = respuesta;
        this.revisarRespuesta();
        
        loader.dismiss();
      }).catch(error =>{
        loader.dismiss();
        this.alerta.mostrarError('Error al sincronizar información',error.message);
      });
    });
  }
  subirUno(ped){
    let loader = this.load.create({
      content:"Procesando..."
    });
    loader.present().then(() =>{
      let pedidos = [ped]; 
      this.database.sincronizarPedidos(this.parametros,pedidos).then(respuesta => {
        let cpe = respuesta[0];
        if(cpe.estado === 1){
          this.database.actualizarSincro(cpe.idPedidoAndroid,1);
          this.database.actualizarDdo(cpe.idPedidoBase, cpe.idPedidoAndroid);
          this.database.actualizarCancela(cpe.idPedidoBase, cpe.idPedidoAndroid);
          let ped = this.obtenerCpedidoDeLista(cpe.idPedidoAndroid);
          let a = this.pedidos.lastIndexOf(ped);
          this.pedidos.splice(a,1);
        }else{
          let ped = this.obtenerCpedidoDeLista(cpe.idPedidoAndroid);
          let a = this.pedidos.lastIndexOf(ped);
          this.pedidos[a].error = true;
          this.pedidos[a].mensaje=cpe.mensaje;
        } 
        this.database.obtenerPedidosTotal(0).then(resss=>{
          this.total = resss;        
        }).catch(ecs=>{
          this.alerta.mostrarError('Error al obtener total', ecs.message);
        })
        loader.dismiss();
      }).catch(error =>{
        loader.dismiss();
        this.alerta.mostrarError('Error al sincronizar información',error.message);
      });
    });
  }
  eliminar(ped){
    let alert = this.alert.create({
    title: 'Eliminar pedido',
    message: '¿Desea eliminar el pedido?',
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
              this.database.obtenerDdocumentoPorIdMovil(ped.id).then(idr =>{
                  if(idr!==null && idr!==undefined && idr.length>0){
                      let dat = idr[0].id
                      this.database.obtenerDcancelaPedido(dat).then(dres=>{
                      let cancelaciones;
                      cancelaciones = dres;
                      for(var d =0 ; d < cancelaciones.length;d++){
                        this.database.borrarReciboPorPedido(cancelaciones[d].idrecibo);
                        this.database.borrarDetallesReciboPorPedido(cancelaciones[d].idrecibo);
                      }
                    });
                    this.database.borrarCancelacionesPorPedido(dat);
                    this.database.borrarDocumentoPorIdMovil(ped.id);
                    this.database.borrarCpedidoPorId(ped.id);
                    this.database.borrarDpedidosPorCpedido(ped.id);
                  }else{
                    this.database.borrarDocumentoPorIdMovil(ped.id);
                    this.database.borrarCpedidoPorId(ped.id);
                    this.database.borrarDpedidosPorCpedido(ped.id);
                  }
                let index = this.pedidos[ped];
                this.pedidos.splice(index,1);
                this.database.obtenerPedidosTotal(0).then(resss=>{
                  this.total = resss;        
                }).catch(ecs=>{
                  this.alerta.mostrarError('Error al obtener total', ecs.message);
                })
                loader.dismiss();
              });
              
            });
          }
        }
      ]
    });
  alert.present();
  }
  borrarRecibo(id){

  }
  doYourStuff()
  { 
    this.appCtrl.getRootNav().push(MenuPedidosPage,{
      uac:this.uac
    });   
  }
  modificar(ped){
    let loader = this.load.create({
      content:"Cargando.."
    });
    loader.present().then(()=>{
      this.storage.set("detalles",null);
      this.storage.set('idPedido',ped.id);
      let datosCabecera = {
        observaciones:ped.observaciones,
        novedad:ped.idNovedad,
        obsequio:ped.obsequio,
        descuento:ped.descuento,
        idpol:ped.politica,
        diasPlazo:ped.diasplazo
      }
      let cliente;
      if(ped.cliente < 0){
        this.database.obtenerClienteNuevoPorId(ped.cliente).then(clin => {
          let cli;
          cli = clin;
          cliente = {
            id: ped.cliente,
            nombre: cli.nombres + " " + cli.apellidos,
            telefono:cli.telefono,
            identificacion:cli.identificacion,
            listaPrecios:cli.listaPre,
            politica:cli.politica,
            email:cli.mail,
            idDir: -1,
            dir: cli.direccion,
            diasplazo:1,
            descuento : 0,
            orden:0,
            cantPe:0,
            color:"white"
          }
          this.storage.set('mod',true);
          this.storage.set('datosCabecera',datosCabecera);
          this.storage.set('cliente',cliente);
          this.database.borrarProductostmp().then(resaaaa=>{

          }).catch(es=>{

          });
          this.database.obtenerDetallesPedido(ped.id, Number(this.parIva.valor)).then(detalles =>{
            this.storage.set('detalles',detalles);
            loader.dismiss();
            this.navCtrl.push(PedidoPage,{
              uac:this.uac
            })
          }).catch(errdet =>{
            this.alerta.mostrarError('Error al obtener detalles',errdet.message);
          });
        }).catch(errcl =>{
          this.alerta.mostrarError('Error al obtener datos cliente',errcl.message);
        });
      }else{
        this.database.obtenerClientePorId(ped.cliente).then(rescl =>{
          cliente = rescl;
          this.storage.set('mod',true);
          this.storage.set('datosCabecera',datosCabecera);
          this.storage.set('cliente',cliente);
          this.database.obtenerDetallesPedido(ped.id, Number(this.parIva.valor)).then(detalles =>{
            this.storage.set('detalles',detalles);
            loader.dismiss();
            this.navCtrl.push(PedidoPage,{
              uac:this.uac
            })
          }).catch(errdet =>{
            this.alerta.mostrarError('Error al obtener detalles',errdet.message);
          });
          
        }).catch(errcs =>{
          this.alerta.mostrarError('Error al obtener datos del cliente', errcs.message);
        })
          
      }
    })
  }
  
}
