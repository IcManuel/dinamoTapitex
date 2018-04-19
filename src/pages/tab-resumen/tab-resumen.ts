import { Component } from '@angular/core';
import { NavController, NavParams, App, ToastController, ModalController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';
import { ListaClientesPage } from '../lista-clientes/lista-clientes';
import { SubirPedidosPage } from '../subir-pedidos/subir-pedidos';
import { PedidoPage } from '../pedido/pedido';
import { DlgIngObsPage } from '../dlg-ing-obs/dlg-ing-obs';
import { Diagnostic } from '@ionic-native/diagnostic';

@Component({
  selector: 'page-tab-resumen',
  templateUrl: 'tab-resumen.html',
})
export class TabResumenPage {
  parIva={valor:12};
  parCatalogo = {valor:"TRUE"};
  parametros=[];
  detalles = [];
  subtotal = 0.0;
  observaciones = "";
  total = 0.0;
  iva = 0.0;
  descuento = 0.0;
  subNeto = 0.0;
  porcIva = 0.12;
  datosCabecera = {
    observaciones:"",
    novedad:0,
    obsequio:false,
    descuento:0.0,
    idpol:0,
    diasPlazo:1,
    zona:-1
  }
  uac;
  coordenadas={
    latitud:0.0,
    longitud:0.0
  };
  cliente;
  todos =false;
  zona;
  productosTmp = 0.0;
  constructor(public navCtrl: NavController, public navParams: NavParams, public database: DatabaseProvider,
              public alerta: AlertaProvider, public load: LoadingController, public alert: AlertController,
              public storage: Storage, public app: App, public diagnostic:Diagnostic, public geolocation: Geolocation,
              public toast:ToastController, public modal:ModalController) {
    this.uac = this.navParams.data.uac;
    this.todos = this.navParams.data.todos;
    this.zona = this.navParams.data.zona;
    this.database.obtenerParametros().then(res =>{
      this.parametros = res;
      this.parIva = res[3];
      this.parCatalogo = res[12];
      console.log('CAT ',this.parCatalogo);
      
      this.porcIva = Number(this.parIva.valor)/100;
      this.storage.get("cliente").then(res =>{
        this.cliente = res;
        this.storage.get("datosCabecera").then(e=>{
          this.datosCabecera = e;
        })
      });
    }).catch(err=>{

    });
  }
  doYourStuff()
  {
    this.storage.get("mod").then(res=>{
      if(res === true){
        this.database.borrarProductostmp().then(resaa=>{
          this.storage.set("totalFinal",0.00);
            this.app.getRootNav().push(SubirPedidosPage,{
                uac:this.uac
            }); 
        });
      }else{
        this.app.getRootNav().push(ListaClientesPage,{
          uac:this.uac
        }); 
      }
    });
     
    }
  ionViewDidEnter() {
    this.datosCabecera = {
      observaciones:"",
      novedad:0,
      obsequio:false,
      descuento:0.0,
      idpol:0,
      diasPlazo:1,
      zona:-1
    }
    this.detalles = [];
    this.subtotal = 0.0;
    this.total = 0.0;
    this.iva = 0.0;
    this.descuento = 0.0;
    this.subNeto = 0.0;
    let loader = this.load.create({
      content:"Cargando..."
    });
    loader.present().then(() =>{
      this.diagnostic.getLocationAuthorizationStatus().then(res=>{   
        if(res==="GRANTED"){  
          this.diagnostic.isLocationAvailable().then(resa =>{    
            if(resa===true){
              console.log('Va a obtener posisicion did enter');
              if(this)
              this.obtenerPosicion().then(coord =>{
                console.log('Pasa de obtener posicion didenter');
                
              }).catch(errcor =>{
                //loader.dismiss();
                // this.alerta.mostrarError('Error al obtener posición',errcor.message);
                let toas = this.toast.create({
                  duration:1500,
                  position:'middle',
                  message:"Ocurrió un error al momento de obtener la posición => "+errcor.message
                });
                toas.present();
              });
              this.database.obtenerCantidadProductosTmp().then(resz =>{
                let dat;
                dat = resz;
                this.productosTmp = dat;
              }).catch(rop =>{

              });  
              this.storage.get("datosCabecera").then(datos=>{
                this.datosCabecera = datos;
                this.storage.get("detalles").then(det => {
                  if(det !== null && det !== undefined){
                    this.detalles = det;
                    console.log('Detalles ',this.detalles);
                    
                    if(this.detalles.length>0){
                      for(let i = 0; i < this.detalles.length; i++){ 
                        this.total += this.detalles[i].total;                
                        if( i=== this.detalles.length-1){
                          this.subtotal = Math.round((this.total/(1+this.porcIva))*100)/100;
                          this.descuento = (this.subtotal * this.datosCabecera.descuento / 100);
                          this.subNeto = this.subtotal - this.descuento;
                          this.iva = Math.round((this.subNeto*(this.porcIva)*100))/100;
                          this.total = this.iva+this.subNeto;
                          loader.dismiss();
                        }
                      }
                    }else{
                      loader.dismiss();
                    }
                  }else{
                    loader.dismiss();
                  }
                  }).catch(erro =>{
                    loader.dismiss();
                    this.alerta.mostrarError('Error al obtener detalles',erro.message);
                  });
              }).catch(errd =>{
                loader.dismiss();
                this.alerta.mostrarError('Error al obtener datosCabecera',errd.message);
              });
            }else{
                loader.dismiss();
                let pr = this.alert.create({
                  subTitle: 'El GPS no se encuentra activo, por favor, activarlo',
                  enableBackdropDismiss : false,
                  buttons: [
                    {
                      text:'Activar',
                      handler: data => {
                        this.diagnostic.switchToLocationSettings();
                      }
                    }
                  ]
                });
                pr.present();
              }
            }).catch(erd =>{
              loader.dismiss();
              this.alerta.mostrarError('Error al obtener diagnóstico de si el GPS está habilitado o no',erd);
            });
          }else{
            loader.dismiss();
            this.alerta.mostrarError('Error','La aplicación no tiene permisos para acceder a ubicación, por favor, ir a configuraciones');
          }
        }).catch(err=>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener status de permiso',err);
        }); 
    });
  }
eliminarPedido(){
  this.database.eliminarTodoProductotmp().then(res=>{
    this.storage.set("totalFinal",0.00);
    this.app.getRootNav().push(ListaClientesPage,{
      uac:this.uac
    });
  }).catch(err=>{
    console.log('Error al eliminar');
    
  });
 
}
guardarAntes(){
  if(this.parCatalogo.valor === "TRUE"){
    let clienteModal = this.modal.create(DlgIngObsPage,{
    });
    clienteModal.onDidDismiss(datos =>{
      if(datos!==null && datos !== undefined){
        if(datos.cerrar === false){
          this.datosCabecera.observaciones = datos.obs;
          this.storage.set("datosCabecera",this.datosCabecera);
          this.guardarTodo();
        }
      }
    });
    clienteModal.present();



  }else{
    this.guardarTodo();
  }
}
guardarTodo(){
  
  this.database.obtenerCantidadProductosTmp().then(resz =>{
    let dat;
    dat = resz;
    this.productosTmp = dat;
  }).catch(rop =>{

  }); 
  let loader = this.load.create({
    content:"Guardando..."
  })
  loader.present().then(()=>{
    this.diagnostic.getLocationAuthorizationStatus().then(res=>{   
    if(res==="GRANTED"){  
      this.diagnostic.isLocationAvailable().then(resa =>{    
        if(resa===true){
          if(this.coordenadas.latitud ===null  || this.coordenadas.longitud ===null || 
            this.coordenadas.latitud === undefined || this.coordenadas.longitud ===undefined ||
            this.coordenadas.latitud === 0 || this.coordenadas.longitud ===0){
                this.storage.get("cliente").then(clires =>{     
                this.cliente = clires;
                  if(this.cliente !==null && this.cliente.id !==null){      
                    if(this.datosCabecera.novedad>0){             
                      this.database.obtenerNovedad(this.datosCabecera.novedad).then(resn =>{
                        let noved;
                        noved = resn;                   
                        if(noved.requerido === 1){                   
                          if(this.detalles.length>0){
                            if(this.productosTmp === this.detalles.length){
                              this.guardar(loader);
                            }else{
                              loader.dismiss();
                              this.alerta.mostrarError('Info','Existen productos que no se han agregado al carrito');
                            }
                          }else{
                            loader.dismiss();
                            this.alerta.mostrarError('Error','Debe ingresar detalles');
                          }
                        }else{
                          if(this.productosTmp === this.detalles.length){      
                            this.guardar(loader);
                          }else{
                            loader.dismiss();
                            this.alerta.mostrarError('Info','Existen productos que no se han agregado al carrito');
                          }
                        }
                      }).catch(errno =>{
                        loader.dismiss();
                        this.alerta.mostrarError('Error al obtener ',errno.message);
                      });
                    }else{  
                      loader.dismiss();
                      this.alerta.mostrarError('Error','Debe seleccionar una novedad');
                    }
                  }else{
                    loader.dismiss();
                    this.alerta.mostrarError('Error','Debe escoger un cliente');
                  }
                }).catch(errcli =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error al obtener información del cliente',errcli.message);
                });

             
              // }).catch(errcor =>{
              //   loader.dismiss();
              //   this.alerta.mostrarError('Error al obtener posición',errcor.message);
              // });
        }else{
            
            this.storage.get("cliente").then(clires =>{
              
            this.cliente = clires;
              if(this.cliente !==null && this.cliente.id !==null){      
                if(this.datosCabecera.novedad>0){             
                  this.database.obtenerNovedad(this.datosCabecera.novedad).then(resn =>{
                    let noved;
                    noved = resn;                   
                    if(noved.requerido === 1){                   
                      if(this.detalles.length>0){
                        this.guardar(loader);
                      }else{
                        loader.dismiss();
                        this.alerta.mostrarError('Error','Debe ingresar detalles');
                      }
                    }else{         
                      this.guardar(loader);
                    }
                  }).catch(errno =>{
                    loader.dismiss();
                    this.alerta.mostrarError('Error al obtener ',errno.message);
                  });
                }else{  
                  loader.dismiss();
                  this.alerta.mostrarError('Error','Debe seleccionar una novedad');
                }
              }else{
                loader.dismiss();
                this.alerta.mostrarError('Error','Debe escoger un cliente');
              }
            }).catch(errcli =>{
              loader.dismiss();
              this.alerta.mostrarError('Error al obtener información del cliente',errcli.message);
            });
          }
        }else{
            loader.dismiss();
            let pr = this.alert.create({
              subTitle: 'El GPS no se encuentra activo, por favor, activarlo',
              enableBackdropDismiss : false,
              buttons: [
                {
                  text:'Activar',
                  handler: data => {
                    this.diagnostic.switchToLocationSettings();
                  }
                }
              ]
            });
            pr.present();
          }
        }).catch(erd =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener diagnóstico de si el GPS está habilitado o no',erd);
        });
      }else{
        loader.dismiss();
        this.alerta.mostrarError('Error','La aplicación no tiene permisos para acceder a ubicación, por favor, ir a configuraciones');
      }
    }).catch(err=>{
      loader.dismiss();
      this.alerta.mostrarError('Error al obtener status de permiso',err);
    }); 
  });
}

  guardar(loader){
    console.log('Vamos a guardar');
    if(this.productosTmp === this.detalles.length){
      this.storage.get("mod").then(mod =>{
        if(mod !==null && mod !== true){
          console.log('Datos obs',this.observaciones);
          
          this.database.obtenerIdUltimo().then(resid =>{
            let fechaA = new Date();
            let fStr = this.darFormatoFecha(fechaA);      
            let pedido = {
              id:resid,
              idCliente:this.cliente.id,
              descuento:this.datosCabecera.descuento,
              diasPlazo:this.datosCabecera.diasPlazo,
              fecha:fStr,
              estado:2,
              sincronizado:0,
              total:this.total,
              observaciones:this.datosCabecera.observaciones,
              direccion:this.cliente.idDir,
              politica:this.cliente.politica,
              coord_x:this.coordenadas.latitud,
              coord_y:this.coordenadas.longitud,
              novedad:this.datosCabecera.novedad,
              subEmpleado:this.uac.empleado,
              obsequio:this.datosCabecera.obsequio,
              subtotal:this.subtotal,
              iva:this.iva,
              zon:this.datosCabecera.zona
            }
            this.database.insertarCpedido(pedido).then(resins =>{
              for(let i = 0; i < this.detalles.length; i++){
                this.detalles[i].cpedido = pedido.id;
                this.database.insertarDpedido(this.detalles[i]).then(res =>{
                  if(i===(this.detalles.length-1) ){
                    this.database.obtenerIdUltimoDocumento().then(residu =>{
                      let documento = {
                        id:residu,
                        transacc:1,
                        numpago:1,
                        monto:pedido.total,
                        fechaemi:pedido.fecha,
                        fechaven:pedido.fecha,
                        idcli:pedido.idCliente,
                        cancelado: 0,
                        saldo:pedido.total,
                        doctran:'PED-1-1-'+pedido.id,
                        idmovil:pedido.id
                      }
                      //this.database.insertarDocumentoMovil(documento);
                    }).catch(errcd =>{
                      let toas = this.toast.create({
                        duration:1500,
                        position:'middle',
                        message:"Ocurrió un error al momento de generar el ddocumento => "+errcd.message
                      });
                      toas.present();
                    });
                    this.storage.set('latitud',null);
                    this.storage.set('longitud',null);
                    this.storage.set('datosCabecera',null);
                    this.storage.set('mod',false);
                    this.storage.set("detalles",null);
                    this.storage.set('idPedido',null);
                    this.database.borrarProductostmp().then(res =>{
                      this.storage.set("totalFinal",0.0);
                    })
                      if(this.todos === false){
                        this.database.obtenerClientePorSecuencia(this.zona,this.cliente.orden).then(rescl =>{
                          this.cliente = rescl;                
                          this.storage.set("datosCabecera",null);
                          if(this.cliente.id !== null){
                            let toas = this.toast.create({
                              duration:1500,
                              position:'middle',
                              message:"Pedido guardado correctamente"
                            });
                            toas.present();
                            this.storage.set("cliente",null);
                            this.storage.set("cliente",this.cliente);
                          
                            loader.dismiss();
                            // this.app.getRootNav().push(PedidoPage,{
                            //   uac:this.uac,
                            //   zona:this.zona,
                            //   cliente:this.cliente,
                            //   tod:false
                            // });
                            this.navCtrl.parent.select(0); 
                          }else{
                            loader.dismiss();
                            let toas = this.toast.create({
                              duration:2500,
                              position:'middle',
                              message:"Pedido guardado correctamente"
                            });
                            toas.present();
                            this.app.getRootNav().push(ListaClientesPage,{
                                uac:this.uac
                              });
                          }
                        }).catch(errcl =>{
                          loader.dismiss();
                          this.alerta.mostrarError('Error al obtener siguiente cliente',errcl.message);
                        });
                        }else{
                          loader.dismiss();
                          let toas = this.toast.create({
                              duration:1500,
                              position:'middle',
                              message:"Pedido guardado correctamente"
                            });
                            toas.present();
                          this.app.getRootNav().push(ListaClientesPage,{
                            uac:this.uac
                          });
                        }
                  }
                }).catch(error=>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error',error);
                });
              }
            }).catch(errins =>{
              loader.dismiss();
              this.alerta.mostrarError('Error al guardar el pedido',errins.message);
            })
          }).catch(errid =>{
            loader.dismiss();
            this.alerta.mostrarError('Error al obtener último id',errid.message);
          });
        }else{
          this.storage.get("idPedido").then(idPed =>{
            let pedido = {
              obsequio:this.datosCabecera.obsequio,
              sincronizado:0,
              descuento:this.datosCabecera.descuento,
              observaciones:this.datosCabecera.observaciones,
              diasPlazo:this.datosCabecera.diasPlazo,
              estado:2,
              novedad:this.datosCabecera.novedad,
              total:this.total,
              direccion:this.cliente.idDir,
              politica:this.cliente.politica,
              coord_x:this.coordenadas.latitud,
              coord_y:this.coordenadas.longitud,
              subtotal:this.subtotal,
              iva:this.iva,
              id:idPed,
              zon:this.datosCabecera.zona
            }
            this.database.borrarDpedidosPorCpedido(pedido.id);
            this.database.modificarCpedido(pedido);
            // this.database.obtenerDdocumentoPorIdMovil(pedido.id).then(idr =>{
            //   if(idr!==null && idr!==undefined && idr.length>0){
            //     let dat = idr[0].id;
            //     this.database.obtenerIdUltimoDocumento().then(residu =>{
            //       let fechaA = new Date();
            //       let fStr = this.darFormatoFecha2(fechaA);
            //         let documento = {
            //           id:residu,
            //           transacc:1,
            //           numpago:1,
            //           monto:pedido.total,
            //           fechaemi:fStr,
            //           fechaven:fStr,
            //           idcli:this.cliente.id,
            //           cancelado: 0,
            //           saldo:pedido.total,
            //           doctran:'PED-1-1-'+pedido.id,
            //           idmovil:pedido.id
            //         }
            //         this.database.insertarDocumentoMovil(documento);
            //         this.database.obtenerDcancelaPedido(dat).then(dres=>{
            //             let cancelaciones;
            //             cancelaciones = dres;
            //             for(var d =0 ; d < cancelaciones.length;d++){
            //               this.database.borrarReciboPorPedido(cancelaciones[d].idrecibo);
            //               this.database.borrarDetallesReciboPorPedido(cancelaciones[d].idrecibo);
            //             }
            //           });
            //           this.database.borrarCancelacionesPorPedido(dat);
            //           this.database.borrarDocumentoPorIdMovil(pedido.id);
            //           let toas = this.toast.create({
            //             duration:2500,
            //             position:'top',
            //             message:"SE ELIMINÓ EL RECIBO QUE AFECTABA A ESTE PEDIDO"
            //           });
            //           toas.present();
            //       }).catch(errcd =>{
            //         let toas = this.toast.create({
            //           duration:1500,
            //           position:'middle',
            //           message:"Ocurrió un error al momento de generar el ddocumento => "+errcd.message
            //         });
            //         toas.present();
            //       });
            //   }else{
            //      this.database.borrarDocumentoPorIdMovil(pedido.id);
            //      this.database.obtenerIdUltimoDocumento().then(residu =>{
            //       let fechaA = new Date();
            //       let fStr = this.darFormatoFecha2(fechaA);
            //         let documento = {
            //           id:residu,
            //           transacc:1,
            //           numpago:1,
            //           monto:pedido.total,
            //           fechaemi:fStr,
            //           fechaven:fStr,
            //           idcli:this.cliente.id,
            //           cancelado: 0,
            //           saldo:pedido.total,
            //           doctran:'PED-1-1-'+pedido.id,
            //           idmovil:pedido.id
            //         }
            //         this.database.insertarDocumentoMovil(documento);
            //       }).catch(errcd =>{
            //         let toas = this.toast.create({
            //           duration:1500,
            //           position:'middle',
            //           message:"Ocurrió un error al momento de generar el ddocumento => "+errcd.message
            //         });
            //         toas.present();
            //       });
            //   }
            // });
            for(let i = 0; i < this.detalles.length; i++){
                this.detalles[i].cpedido = pedido.id;
                this.database.insertarDpedido(this.detalles[i]).then(res=>{
                  if(i === this.detalles.length-1){
                    this.database.borrarProductostmp().then(res =>{
                      this.storage.set("totalFinal",0.0);
                    })
                    loader.dismiss();
                      let toas = this.toast.create({
                          duration:1500,
                          position:'middle',
                          message:"Pedido modificado correctamente"
                        });
                        toas.present();
                      this.app.getRootNav().push(SubirPedidosPage,{
                        uac:this.uac
                      });
                  }else{
                    console.log('Va a a modificar detalle ',i);
                    
                  }
                }).catch(err =>{
                  loader.dismiss();
                });
            }
          }).catch(errdi =>{
            loader.dismiss();
            this.alerta.mostrarError('Error al obtener el id del pedido',errdi.message);
          });
        }
      }).catch(errmod =>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener mod ',errmod.message);
      });
    }else{
      loader.dismiss();
      this.alerta.mostrarError('Info','Existen productos que no se han agregado al carrito');
   
    }
  }

  eliminarDetalle(det){
    this.subtotal = 0.0;
    this.total = 0.0;
    this.iva = 0.0;
    this.descuento = 0.0;
    this.subNeto = 0.0;
    let ind = this.detalles.indexOf(det);
    this.detalles.splice(ind,1);
    this.storage.set("detalles",null);
    this.storage.set("detalles",this.detalles);
    let tm = {
      id :det.idProducto
    }
    
    this.database.eliminarProductotmp(tm).then(res=>{

    });
    for(var i = 0; i < this.detalles.length; i++){
      this.subtotal += this.detalles[i].subtotal;
      this.iva += this.detalles[i].iva;
      if( i=== this.detalles.length-1){
        this.descuento = (this.subtotal * this.datosCabecera.descuento / 100);
        this.subNeto = this.subtotal - this.descuento;
        this.total = this.subNeto + this.iva;
      }
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
  obtenerPosicion(){
    return new Promise ((resolve, reject) =>{

      this.geolocation.getCurrentPosition(
        {timeout:10000,enableHighAccuracy:false,maximumAge:0}).then((resp) => { 
          this.coordenadas.latitud = resp.coords.latitude;
          this.coordenadas.longitud = resp.coords.longitude;
          this.storage.set('latitud',resp.coords.latitude);
          this.storage.set('longitud',resp.coords.longitude);
          resolve(this.coordenadas);
        }).catch((error) => {
          reject(error);
        });
    }); 
  }
  darFormatoFecha(fecha){
      if(fecha!==null){
        var datestring = ("0" + fecha.getDate()).slice(-2) + "-" + ("0"+(fecha.getMonth()+1)).slice(-2) + "-" +fecha.getFullYear()+" "+("0" + fecha.getHours()).slice(-2)+":"+("0" + fecha.getMinutes()).slice(-2) +":"+("0" + fecha.getSeconds()).slice(-2) ;
        return datestring;
      }else{
        return "";
      }
  }
     darFormatoFecha2(fecha){
      if(fecha!==null){
        var datestring = fecha.getFullYear()+"/"+(fecha.getMonth()+1)+"/"+fecha.getDate();
        return datestring;
      }else{
        return "";
      }
  }
}
