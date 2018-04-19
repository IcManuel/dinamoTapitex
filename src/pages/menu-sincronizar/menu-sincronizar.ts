import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Insomnia } from '@ionic-native/insomnia';



@Component({
  selector: 'page-menu-sincronizar',
  templateUrl: 'menu-sincronizar.html',
})
export class MenuSincronizarPage {
  uac;
  parametros = [];
  parValStock = false;
  parRecibos = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public databaseProvider:DatabaseProvider, public alerta: AlertaProvider,
              public load: LoadingController, public alert: AlertController, public storage: Storage, public insomnia: Insomnia) {
    this.insomnia.keepAwake();
                this.uac = navParams.get("uac");
    this.databaseProvider.getDatabaseState().subscribe(rdy =>{
      if(rdy){
        this.databaseProvider.obtenerParametros().then(data =>{
          this.parametros = data;
          if( data[10].valor.toUpperCase() === "FALSE"){
           this.parValStock = false;
          }else if(data[10].valor.toUpperCase() === "TRUE"){
              this.parValStock = true;
          }
          if( data[11].valor.toUpperCase() === "FALSE"){
           this.parRecibos = false;
          }else if(data[11].valor.toUpperCase() === "TRUE"){
              this.parRecibos = true;
          }
        }).catch(error =>{
          this.alerta.mostrarError('Error',error);
        });
      }
    });
  }
   sincronizarCanal(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getCanales(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          if(dat.length>0){
            this.databaseProvider.borrarCanales();
            for(let i = 0; i < dat.length;i++){
              this.databaseProvider.insertarCanal(dat[i]).then(rcl =>{
                if(i === (dat.length-1)){
                  resolve(1);
                }
              }).catch(ecli =>{
                reject(ecli);
              });
            }
          }else{
            resolve(1);
          }
          }).catch(e => {
            reject('Error al conectarse con el servidor: Canal');
          })
       });
  }
 
  
  sincronizarClientes(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getClientes(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarClientes();
          if(dat.length>0){
            
            for(let i = 0; i < dat.length;i++){
              this.databaseProvider.insertarCliente(dat[i]).then(rcl =>{
                if(i === (dat.length-1)){
                  resolve(1);
                }
              }).catch(ecli =>{
                reject(ecli);
              });
            }
          }else{
            resolve(1);
          }
          }).catch(e => {
            reject('Error al conectarse con el servidor: Clientes');
          })
       });
  }
  sincronizarDirecciones(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getDirecciones(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarDirecciones();
          if(dat.length>0){
           
            for(let j = 0; j < dat.length;j++){
              this.databaseProvider.insertarDireccion(dat[j]).then(rcl =>{
                if(j === (dat.length-1)){
                  resolve(1);
                }
              }).catch(ecli =>{
                reject(ecli);
              });
            }
          }else{
            resolve(1);
          }
          }).catch(e => {
            reject('Error al conectarse con el servidor: direcciones');
          })
       });
  }
  sincronizarZonas(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getZonas(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarZonas();
          if(dat.length>0){
            
            for(let k = 0; k < dat.length;k++){ 
              this.databaseProvider.insertarZona(dat[k]).then(rcl =>{
                if(k === (dat.length-1)){
                  resolve(1);
                }
              }).catch(ecli =>{
                reject(ecli);
              });
            }
          }else{
            resolve(1);
          }
          }).catch(e => {
            reject('Error al conectarse con el servidor: zonas');
          })
       });
  }
  sincronizarMarcas(){
    return new Promise((resolve,reject)=>{this.databaseProvider.getMarcas(this.parametros, this.uac).then(data => {
        var dat;
        dat = data;
        if(dat.length>0){
          this.databaseProvider.borrarMarcas();
          for(let k = 0; k < dat.length;k++){ 
            this.databaseProvider.insertarMarca(dat[k]).then(rcl =>{
              if(k === (dat.length-1)){
                resolve(1);
              }
            }).catch(ecli =>{
              reject(ecli);
            });
          }
        }else{
          resolve(1);
        }
        }).catch(e => {
          reject('Error al conectarse con el servidor: marcas');
        })
     });
}
sincronizarModelos(){
  return new Promise((resolve,reject)=>{this.databaseProvider.getModelos(this.parametros, this.uac).then(data => {
      var dat;
      dat = data;
      console.log('Data que viene modelo',dat);
      
      if(dat.length>0){
        this.databaseProvider.borrarModelos();
        for(let k = 0; k < dat.length;k++){ 
          this.databaseProvider.insertarModelo(dat[k]).then(rcl =>{
            if(k === (dat.length-1)){
              resolve(1);
            }
          }).catch(ecli =>{
            reject(ecli);
          });
        }
      }else{
        resolve(1);
      }
      }).catch(e => {
        reject('Error al conectarse con el servidor: modelos');
      })
   });
}
sincronizarClasificaciones(){
  return new Promise((resolve,reject)=>{this.databaseProvider.getClasificaciones(this.parametros, this.uac).then(data => {
      var dat;
      dat = data;
      if(dat.length>0){
        this.databaseProvider.borrarClasificaciones();
        for(let k = 0; k < dat.length;k++){ 
          this.databaseProvider.insertarClasificacion(dat[k]).then(rcl =>{
            if(k === (dat.length-1)){
              resolve(1);
            }
          }).catch(ecli =>{
            reject(ecli);
          });
        }
      }else{
        resolve(1);
      }
      }).catch(e => {
        reject('Error al conectarse con el servidor: clasificaciones');
      })
   });
}
  sincronizarTablaPreventas(){
    return new Promise((resolve,reject)=>{this.databaseProvider.getTablaPreventa(this.parametros, this.uac).then(data => {
        var dat;
        dat = data;
        if(dat.length>0){
          console.log('Que me llega de preventas --> ',dat);
          
          this.databaseProvider.borrarTablaPreventa();
          for(let k = 0; k < dat.length;k++){ 
            this.databaseProvider.insertarTablaPreventa(dat[k]).then(rcl =>{
              if(k === (dat.length-1)){
                resolve(1);
              }
            }).catch(ecli =>{
              reject(ecli);
            });
          }
        }else{
          resolve(1);
        }
        }).catch(e => {
          reject('Error al conectarse con el servidor: tabla preventas');
        })
     });
}
  sincronizarRutas(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getRutas(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarRutas();
          if(dat.length>0){
            
            for(let m = 0; m < dat.length;m++){
              this.databaseProvider.insertarRuta(dat[m]).then(rcl =>{
                console.log('M  de rutas -> ',m);
                
                if(m === (dat.length-1)){
                  console.log('Acava rutas');
                  resolve(1);
                }
              }).catch(ecli =>{
                reject(ecli);
              });
            }
          }else{
            resolve(1);
          }
          }).catch(e => {
            reject('Error al conectarse con el servidor: rutas');
          })
       });
  }
  
  sincronizarUmedida(){
    return new Promise ((resolve,reject) => {this.databaseProvider.getUmedida(this.parametros, this.uac).then(data => { 
        var dat;
        dat = data;
        if(dat.length>0){
          this.databaseProvider.borrarUmedida();
          for(let i = 0; i < dat.length;i++){
            this.databaseProvider.insertarUmedida(dat[i]).then(rcl =>{
                if(i === (dat.length-1)){
                  resolve(1);
                }
              }).catch(ecli =>{
                reject(ecli);
              });
            }
        }else{
          resolve(1);
        }
      }).catch(e => {
        reject('Error al conectarse con el servidor: Umedida');
      })
    });
  }
  sincronizarTipoProducto(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getTipoProducto(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          if(dat.length>0){
            this.databaseProvider.borrarTipoProducto();
            for(let i = 0; i < dat.length;i++){
              this.databaseProvider.insertarTipoProducto(dat[i]).then(rcl =>{
                if(i === (dat.length-1)){
                  resolve(1);
                }
              }).catch(ecli =>{
                reject(ecli);
              });
            }
          }else{
            resolve(1);
          }
          }).catch(e => {
            reject('Error al conectarse con el servidor: Tipo Producto');
          })
       });
  }
  sincronizarBodega(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getBodegas(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          console.log('Que bodegas vienen ',dat);
          
          if(dat.length>0){
            this.databaseProvider.borrarBodegas();
            for(let i = 0; i < dat.length;i++){
              this.databaseProvider.insertarBodega(dat[i]).then(rcl =>{
                if(i === (dat.length-1)){
                  resolve(1);
                }
              }).catch(ecli =>{
                reject(ecli);
              });
            }
          }else{
            resolve(1);
          }
          }).catch(e => {
            reject('Error al conectarse con el servidor: Bodega');
          })
       });
  }
  sincronizarSaldos(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getSaldoinv(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          if(dat.length>0){
            this.databaseProvider.borrarSaldos();
            for(let i = 0; i < dat.length;i++){
              this.databaseProvider.insertarSaldoInv(dat[i]).then(rcl =>{
                if(i === (dat.length-1)){
                  resolve(1);
                }
              }).catch(ecli =>{
                reject(ecli);
              });
            }
          }else{
            resolve(1)
          }
          }).catch(e => {
            reject('Error al conectarse con el servidor: saldos');
          })
       });
  }
  sincronizarPolitica(){
    console.log('Va a politicas?');
    
      return new Promise((resolve,reject)=>{this.databaseProvider.getPolitica(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          if(dat.length>0){
            this.databaseProvider.borrarPoliticas();
            for(let i = 0; i < dat.length;i++){
              this.databaseProvider.insertarPolitica(dat[i]).then(rcl =>{
                if(i === (dat.length-1)){
                  resolve(1);
                }
              }).catch(ecli =>{
                reject(ecli);
              });
            }
          }else{
            resolve(1);
          }
          }).catch(e => {
            reject('Error al conectarse con el servidor: Politicas');
          })
       });
  }
  sincronizarEmisor(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getEmisores(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          if(dat.length>0){
            this.databaseProvider.borrarEmisor();
            for(let i = 0; i < dat.length;i++){
              this.databaseProvider.insertarEmisor(dat[i]).then(rcl =>{
                if(i === (dat.length-1)){
                  resolve(1);
                }
              }).catch(ecli =>{
                reject(ecli);
              });
            }
          }else{
            resolve(1)
          }
          }).catch(e => {
            reject('Error al conectarse con el servidor: emisores');
          })
       });
  }
    sincronizarBancos(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getBancos(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          if(dat.length>0){
            this.databaseProvider.borrarBanco();
            for(let i = 0; i < dat.length;i++){
              this.databaseProvider.insertarBanco(dat[i]).then(rcl =>{
                if(i === (dat.length-1)){
                  resolve(1);
                }
              }).catch(ecli =>{
                reject(ecli);
              });
            }
          }else{
            resolve(1)
          }
          }).catch(e => {
            reject('Error al conectarse con el servidor: bancos');
          })
       });
  }
  sincronizarTpa(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getTipoPagos(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          if(dat.length>0){
            this.databaseProvider.borrarTiposPagos();
            for(let i = 0; i < dat.length;i++){
              this.databaseProvider.insertarTipoPago(dat[i]).then(rcl =>{
                if(i === (dat.length-1)){
                  resolve(1);
                }
              }).catch(ecli =>{
                reject(ecli);
              });
            }
          }else{
            resolve(1)
          }
          }).catch(e => {
            reject('Error al conectarse con el servidor: tipospagpos');
          })
       });
  }
  sincronizarDpedidoInfo(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getDPedidoInfo(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          if(dat.length>0){
            this.databaseProvider.borrarDPedidoInfo();
            for(let xc = 0; xc < dat.length;xc++){
              this.databaseProvider.insertarDPedidoInfo(dat[xc]).then(rcl =>{
                if(xc === (dat.length-1)){
                  resolve(1);
                }
              }).catch(ecli =>{
                reject(ecli);
              });
            }
          }else{
            resolve(1)
          }
          }).catch(e => {
            reject('Error al conectarse con el servidor: zonas');
          })
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
    sincronizarProductos(){
      return new Promise ((resolve,reject) => {
        this.databaseProvider.obtenerProductosSinc().then(res =>{
          this.uac.productos = res;
          this.databaseProvider.getProductos(this.parametros, this.uac).then(data => {   
            console.log('Que viene prod--> ',data);
            var dat;
            dat = data;
            if(dat.length>0){
              for(let i = 0; i < dat.length;i++){
                let img = dat[i];
                
                img.fechaact = this.darFormatoFecha(new Date());
                if(img.tipo ===1 || img.tipo ===2){
                  this.databaseProvider.exiteIdProducto(img.id).then(ex =>{
                    if(ex === false){
                      this.databaseProvider.insertarProducto(img).then(rr =>{
                        if(i === (dat.length-1)){
                          resolve(1);
                        }
                      }).catch(ee=>{
                        reject(ee.message);
                      });
                    }else{
                      this.databaseProvider.actualizarProducto(img).then(rr =>{
                        if(i === (dat.length-1)){
                          resolve(1);
                        }
                      }).catch(ee=>{
                        reject(ee.message);
                      });
                    }
                  });
                }else if(img.tipo ===3 ){ 
                  
                  this.databaseProvider.eliminarProducto(img).then(rr =>{
                    if(i === (dat.length-1)){
                      resolve(1);
                    }
                  }).catch(ee=>{
                    reject(ee.message);
                  });
                }
              }
            }else{
              resolve(1);
            }
            this.uac.productos = [];
          }).catch(e => {
            reject('Error al conectarse con el servidor: Productos');
          })
        });
      });
    }
    sincronizarFactor(){
      return new Promise ((resolve,reject) => {
        this.databaseProvider.obtenerTodosFactores().then( res => {
          this.uac.factores = res;
          this.databaseProvider.getFactores(this.parametros, this.uac).then(data => {      
            var dat;
            dat = data;
            
            
            if(dat.length>0){
              for(let i = 0; i < dat.length;i++){

                let img = dat[i];
                img.fechaact = this.darFormatoFecha(new Date());
                if(img.tipo === 1 || img.tipo === 2){

                  this.databaseProvider.exiteIdFactor(img.id).then(res =>{
                    if(res === false){
                      this.databaseProvider.insertarFactor(img).then(rr =>{
                        if(i === (dat.length-1)){
    
                          resolve(1);
                        }
                      }).catch(ee=>{
                        console.log('Rejeci ',ee.message);
                        
                        reject(ee);
                      });
                    }else{

                      this.databaseProvider.actualizarFactor(img).then(rr =>{
                        if(i === (dat.length-1)){
                          resolve(1);
                        }
                      }).catch(ee=>{
                        console.log('Rejecm ',ee.message);
                        reject(ee);
                      });
                    }
                  })
                }else if(img.tipo ===3 ){
                  this.databaseProvider.eliminarFactor(img).then(rr =>{
                    if(i === (dat.length-1)){
                      resolve(1);
                    }
                  }).catch(ee=>{
                    console.log('Rejece ',ee.message);
                    reject(ee);
                  });
                }else{
                  reject('No vienen datos ')
                }
              }
            }else{
              resolve(1);
            }
            this.uac.factores = [];
          }).catch(e => {
            reject('Error al conectarse con el servidor: Factor');
          });
        });
      });
    }
    sincronizarDlistaPre(){
      return new Promise ((resolve,reject) => {
        this.databaseProvider.obtenerDlistaPre().then(res => {
          this.uac.dlistapre = res;
          this.databaseProvider.getDlistaPre(this.parametros, this.uac).then(data => {
            //console.log('Ca ',data);
            
            var dat;
            dat = data;
            if(dat.length>0){
              for(let i = 0; i < dat.length;i++){
                let img = dat[i];
                img.fechaact = this.darFormatoFecha(new Date());
                if(img.tipo ===1 || img.tipo === 2){
                  this.databaseProvider.exiteIdDlistapre(img.producto,img.listapre).then(res => {
                    if(res === false){
                      this.databaseProvider.insertarDlistaPre(img).then(rr =>{
                        if(i === (dat.length-1)){
                          resolve(1);
                        }
                      }).catch(ee=>{
                        reject(ee);
                      });
                    }else{
                      this.databaseProvider.actualizarDlistaPre(img).then(rr =>{
                        if(i === (dat.length-1)){
                          resolve(1);
                        }
                      }).catch(ee=>{
                        reject(ee);
                      });
                    }
                  })
                }else if(img.tipo ===3 ){
                  this.databaseProvider.eliminarDlistaPre(img).then(rr =>{
                    if(i === (dat.length-1)){
                      resolve(1);
                    }
                  }).catch(ee=>{
                    reject(ee);
                  });
                }
              }
            }else{
              resolve(1);
            }
            this.uac.dlistapre = [];
          }).catch(e => {
            reject('Error al conectarse con el servidor: DlistaPre');
          })
        });
      });
    }

    sincronizarProductoModelo(){
      return new Promise ((resolve,reject) => {
        this.databaseProvider.obtenerProductosModelos().then(res => {
          console.log('Que va a mandar ',res);
          
          this.uac.productosModelo = res;
          this.databaseProvider.getProductoModelos(this.parametros, this.uac).then(data => {
            
            var dat;
            dat = data;
            if(dat.length>0){
              for(let i = 0; i < dat.length;i++){
                let img = dat[i];
                img.fechaact = this.darFormatoFecha(new Date());
                if(img.tipo ===1 || img.tipo === 2){
                  this.databaseProvider.exiteIdProductoModelo(img.id).then(res =>{
                    if(res===false){
                      this.databaseProvider.insertarProductoModelo(img).then(rr =>{
                        if(i === (dat.length-1)){
                          resolve(1);
                        }
                      }).catch(ee=>{
                        reject(ee);
                      });
                    }else{
                      this.databaseProvider.actualizarProductoModelo(img).then(rr =>{
                        if(i === (dat.length-1)){
                          resolve(1);
                        }
                      }).catch(ee=>{
                        reject(ee);
                      });
                    
                    }
                  });
                }
                else if(img.tipo ===3 ){
                  this.databaseProvider.eliminarProductoModelo(img).then(rr =>{
                    if(i === (dat.length-1)){
                      resolve(1);
                    }
                  }).catch(ee=>{
                    reject(ee);
                  });
                }
              }
            }else{
              resolve(1);
            }
            this.uac.dlistapre = [];
          }).catch(e => {
            reject('Error al conectarse con el servidor: producto_modelo');
          })
        });
      });
    }  

  sincronizarImagenes(){
      return new Promise((resolve,reject)=>{
        this.databaseProvider.obtenerImagenes().then(res =>{
          this.uac.imagenes = res;
          console.log(res);
          
          this.databaseProvider.getImagenes(this.parametros, this.uac).then(data => {          
            var dat;
            dat = data;
            console.log('Imagenes que vienen= ',dat.length);
            if(dat.length>0){
              for(let i = 0; i < dat.length;i++){
                let img = dat[i];
                img.fechaact = this.darFormatoFecha(new Date());
                if(img.tipo === 1 || img.tipo ===2){
                  this.databaseProvider.exiteIdImagen(img.id).then(res=>{
                    if(res === false){
                      this.databaseProvider.insertarImagen(img).then(rr =>{
                        if(i === (dat.length-1)){
                          this.storage.set("versionImagen",this.darFormatoFecha(new Date()));
                          resolve(1);
                        }
                      }).catch(ee=>{
                        reject(ee);
                      });
                    }else{
                      this.databaseProvider.actualizarImagen(img).then(rr =>{
                        if(i === (dat.length-1)){
                          this.storage.set("versionImagen",this.darFormatoFecha(new Date()));
                          resolve(1);
                        }
                      }).catch(ee=>{
                        reject(ee);
                      });
                    }
                  });
                }else if(img.tipo ===3 ){
                  this.databaseProvider.eliminarImagen(img).then(rr =>{
                    if(i === (dat.length-1)){
                      this.storage.set("versionImagen",this.darFormatoFecha(new Date()));
                      resolve(1);
                    }
                  }).catch(ee=>{
                    reject(ee);
                  });
                }
              }
            }else{
              resolve(1);
            }
            
          this.uac.imagenes = [];
          }).catch(e => {
            reject('Error al conectarse con el servidor: imágenes');
          });
        }).catch(er =>{
          reject(er);
        }); 
       });
  }
  sincronizarDocumentos(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getDocumentos(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarDocumentos();
          if(dat.length>0){
            for(let i = 0; i < dat.length;i++){
              this.databaseProvider.insertarDocumento(dat[i]).then(rcl =>{
                  if(i === (dat.length-1)){
                    resolve(1);
                  }
                }).catch(ecli =>{
                  reject(ecli);
                });
              }
              
          }else{
            resolve(1)
          }
          }).catch(e => {
            reject('Error al conectarse con el servidor: documentos');
          })
       });
  }
    sincronizarPreventaBtn(){
    let loader = this.load.create({
        content:"Sincronizando importaciones..."
    });
    loader.present().then(() =>{
      this.databaseProvider.obtenerCantidadPedidos(0).then(cped => {
        this.databaseProvider.obtenerCantidadRecibos(0).then(crec =>{
          if(cped <= 0){
            if(crec <= 0){
                this.sincronizarPreventa().then(resc =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Info','Importaciones sincronizadas correctamente');
                }).catch(ecn =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error al sincronizar',ecn.message);
                });
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Existen recibos que no se han sincronizado ');
            }
          }else{
            loader.dismiss();
            this.alerta.mostrarError('Error','Existen pedidos que no se han sincronizado ');
          }
        }).catch(ecer =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener cantidad de recibos',ecer.message);
        });
      }).catch(ecpe=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener cantidad de pedidos',ecpe.message);
      }); 
    });
  }
  sincronizarTablaPreventaBtn(){
    let loader = this.load.create({
        content:"Sincronizando preventas..."
    });
    loader.present().then(() =>{
      this.databaseProvider.obtenerCantidadPedidos(0).then(cped => {
        this.databaseProvider.obtenerCantidadRecibos(0).then(crec =>{
          if(cped <= 0){
            if(crec <= 0){
                this.sincronizarTablaPreventas().then(resc =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Info','Preventas sincronizadas correctamente');
                }).catch(ecn =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error al sincronizar',ecn.message);
                });
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Existen recibos que no se han sincronizado ');
            }
          }else{
            loader.dismiss();
            this.alerta.mostrarError('Error','Existen pedidos que no se han sincronizado ');
          }
        }).catch(ecer =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener cantidad de recibos',ecer.message);
        });
      }).catch(ecpe=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener cantidad de pedidos',ecpe.message);
      }); 
    });
  }
  sincronizarPreventa(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getPreventa(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          if(dat.length>0){
            this.databaseProvider.borrarPreventa();
            this.databaseProvider.borrarPreventaDetalles();
            for(let i = 0; i < dat.length;i++){
              this.databaseProvider.insertarPreventa(dat[i]).then(rcl =>{
                this.insertarDetallesPreventa(dat[i].detalles).then(rc=>{
                  if(i === (dat.length-1)){
                      resolve(1);
                   }
                  });
                }).catch(ecli =>{
                  reject(ecli);
                });
              }
              
          }else{
            resolve(1)
          }
          }).catch(e => {
            reject('Error al conectarse con el servidor: importaciones');
          })
       });
  }
  insertarDetallesPreventa(det){
      return new Promise((resolve,reject)=>{
            for(let i = 0; i < det.length;i++){
              this.databaseProvider.insertarDetallePreventa(det[i]).then(rcl =>{
                  if(i === (det.length-1)){
                    resolve(1);
                  }
                }).catch(ecli =>{
                  reject(ecli);
                });
              }
       });
  }
  sincronizarNovedad(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getNovedades(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          if(dat.length>0){
            this.databaseProvider.borrarNovedad();
            for(let i = 0; i < dat.length;i++){
              this.databaseProvider.insertarNovedad(dat[i]).then(rcl =>{
                  if(i === (dat.length-1)){
                    resolve(1);
                  }
                }).catch(ecli =>{
                  reject(ecli);
                });
              }
          }else{
            resolve(1)
          }
          }).catch(e => {
            reject('Error al conectarse con el servidor: novedades');
          })
       });
  }
  sincronizarImagenesBtn(){
    let loader = this.load.create({
        content:"Sincronizando imágenes..."
    });
    loader.present().then(() =>{
      console.log('Entra-->');
      
      this.databaseProvider.obtenerCantidadPedidos(0).then(cped => {
        this.databaseProvider.obtenerCantidadRecibos(0).then(crec =>{
          if(cped <= 0){
            if(crec <= 0){
              console.log('Pasa-->');
                this.sincronizarImagenes().then(resc =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Info','Imágenes sincronizados correctamente');
                }).catch(ecn =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error al sincronizar',ecn.message);
                });
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Existen recibos que no se han sincronizado ');
            }
          }else{
            loader.dismiss();
            this.alerta.mostrarError('Error','Existen pedidos que no se han sincronizado ');
          }
        }).catch(ecer =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener cantidad de recibos',ecer.message);
        });
      }).catch(ecpe=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener cantidad de pedidos',ecpe.message);
      }); 
    });
  }
  sincronizarDocumentoBtn(){
    let loader = this.load.create({
        content:"Sincronizando documentos..."
    });
    loader.present().then(() =>{
      this.databaseProvider.obtenerCantidadPedidos(0).then(cped => {
        this.databaseProvider.obtenerCantidadRecibos(0).then(crec =>{
          if(cped <= 0){
            if(crec <= 0){
                this.sincronizarDocumentos().then(resc =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Info','Documentos sincronizados correctamente');
                }).catch(ecn =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error al sincronizar',ecn.message);
                });
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Existen recibos que no se han sincronizado ');
            }
          }else{
            loader.dismiss();
            this.alerta.mostrarError('Error','Existen pedidos que no se han sincronizado ');
          }
        }).catch(ecer =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener cantidad de recibos',ecer.message);
        });
      }).catch(ecpe=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener cantidad de pedidos',ecpe.message);
      }); 
    });
  }
  sincronizarTpaBtn(){
    let loader = this.load.create({
        content:"Sincronizando tipos de pago..."
    });
    loader.present().then(() =>{
      this.databaseProvider.obtenerCantidadPedidos(0).then(cped => {
        this.databaseProvider.obtenerCantidadRecibos(0).then(crec =>{
          if(cped <= 0){
            if(crec <= 0){
                this.sincronizarTpa().then(resc =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Info','Tipos de pago sincronizados correctamente');
                }).catch(ecn =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error al sincronizar',ecn.message);
                });
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Existen recibos que no se han sincronizado ');
            }
          }else{
            loader.dismiss();
            this.alerta.mostrarError('Error','Existen pedidos que no se han sincronizado ');
          }
        }).catch(ecer =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener cantidad de recibos',ecer.message);
        });
      }).catch(ecpe=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener cantidad de pedidos',ecpe.message);
      }); 
    });
  }
  sincronizarBancoBtn(){
    let loader = this.load.create({
        content:"Sincronizando bancos..."
    });
    loader.present().then(() =>{
      this.databaseProvider.obtenerCantidadPedidos(0).then(cped => {
        this.databaseProvider.obtenerCantidadRecibos(0).then(crec =>{
          if(cped <= 0){
            if(crec <= 0){
                this.sincronizarBancos().then(resc =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Info','Bancos sincronizados correctamente');
                }).catch(ecn =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error al sincronizar',ecn.message);
                });
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Existen recibos que no se han sincronizado ');
            }
          }else{
            loader.dismiss();
            this.alerta.mostrarError('Error','Existen pedidos que no se han sincronizado ');
          }
        }).catch(ecer =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener cantidad de recibos',ecer.message);
        });
      }).catch(ecpe=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener cantidad de pedidos',ecpe.message);
      }); 
    });
  }
  sincronizarTipoProductoBtn(){
    let loader = this.load.create({
        content:"Sincronizando tipos de producto..."
    });
    loader.present().then(() =>{
      this.databaseProvider.obtenerCantidadPedidos(0).then(cped => {
        this.databaseProvider.obtenerCantidadRecibos(0).then(crec =>{
          if(cped <= 0){
            if(crec <= 0){
                this.sincronizarTipoProducto().then(resc =>{
                  this.sincronizarMarcas().then(resm =>{
                    this.sincronizarClasificaciones().then(rescla =>{
                      this.sincronizarModelos().then(resmod =>{
                        this.sincronizarProductoModelo().then(resmm => {
                          loader.dismiss();
                          this.alerta.mostrarError('Info','Tipos de producto sincronizados correctamente');
                          }).catch(ecn =>{
                            loader.dismiss();
                            this.alerta.mostrarError('Error al sincronizar',ecn.message);
                          });
                        }).catch(ermap =>{
                          loader.dismiss();
                          this.alerta.mostrarError('Error al sincronizar',ermap.message);
                        })
                      }).catch( err=>{
                        loader.dismiss();
                        this.alerta.mostrarError('Error al sincronizar',err.message);
                      });
                    }).catch(erc =>{
                      loader.dismiss();
                      this.alerta.mostrarError('Error al sincronizar',erc.message);
                    })
                }).catch(emar =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error al sincronizar',emar.message);
                });
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Existen recibos que no se han sincronizado ');
            }
          }else{
            loader.dismiss();
            this.alerta.mostrarError('Error','Existen pedidos que no se han sincronizado ');
          }
        }).catch(ecer =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener cantidad de recibos',ecer.message);
        });
      }).catch(ecpe=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener cantidad de pedidos',ecpe.message);
      }); 
    });
  }
  sincronizarEmisoresBtn(){
    let loader = this.load.create({
        content:"Sincronizando emisores..."
    });
    loader.present().then(() =>{
      this.databaseProvider.obtenerCantidadPedidos(0).then(cped => {
        this.databaseProvider.obtenerCantidadRecibos(0).then(crec =>{
          if(cped <= 0){
            if(crec <= 0){
                this.sincronizarEmisor().then(resc =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Info','Emisores sincronizados correctamente');
                }).catch(ecn =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error al sincronizar',ecn.message);
                });
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Existen recibos que no se han sincronizado ');
            }
          }else{
            loader.dismiss();
            this.alerta.mostrarError('Error','Existen pedidos que no se han sincronizado ');
          }
        }).catch(ecer =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener cantidad de recibos',ecer.message);
        });
      }).catch(ecpe=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener cantidad de pedidos',ecpe.message);
      }); 
    });
  }
  sincronizarBodegasBtn(){
    let loader = this.load.create({
        content:"Sincronizando bodegas..."
    });
    loader.present().then(() =>{
      this.databaseProvider.obtenerCantidadPedidos(0).then(cped => {
        this.databaseProvider.obtenerCantidadRecibos(0).then(crec =>{
          if(cped <= 0){
            if(crec <= 0){
                this.sincronizarBodega().then(resc =>{
                  this.sincronizarSaldos().then(rsla =>{
                    loader.dismiss();
                    this.alerta.mostrarError('Info','Bodegas sincronizadas correctamente');
                  }).catch(esla =>{
                    loader.dismiss();
                    this.alerta.mostrarError('Error al sincronizar saldos',esla.message);
                  });
                }).catch(ecn =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error al sincronizar bodegas',ecn.message);
                });
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Existen recibos que no se han sincronizado ');
            }
          }else{
            loader.dismiss();
            this.alerta.mostrarError('Error','Existen pedidos que no se han sincronizado ');
          }
        }).catch(ecer =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener cantidad de recibos',ecer.message);
        });
      }).catch(ecpe=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener cantidad de pedidos',ecpe.message);
      }); 
    });
  }
  sincronizarDlistapreBtn(){
    let loader = this.load.create({
        content:"Sincronizando precios..."
    });
    loader.present().then(() =>{
      this.databaseProvider.obtenerCantidadPedidos(0).then(cped => {
        this.databaseProvider.obtenerCantidadRecibos(0).then(crec =>{
          if(cped <= 0){
            if(crec <= 0){
                this.sincronizarDlistaPre().then(resc =>{
                  this.sincronizarNovedad().then(rnov =>{
                    loader.dismiss();
                    this.alerta.mostrarError('Info','Precios sincronizados correctamente');
                  }).catch(enov=>{
                    loader.dismiss();
                    this.alerta.mostrarError('Error al sincronizar novedades',enov.message);
                  });
                }).catch(ecn =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error al sincronizar precios',ecn.message);
                });
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Existen recibos que no se han sincronizado ');
            }
          }else{
            loader.dismiss();
            this.alerta.mostrarError('Error','Existen pedidos que no se han sincronizado ');
          }
        }).catch(ecer =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener cantidad de recibos',ecer.message);
        });
      }).catch(ecpe=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener cantidad de pedidos',ecpe.message);
      }); 
    });
  }
  sincronizarPoliticaBtn(){
    let loader = this.load.create({
        content:"Sincronizando políticas..."
    });
    loader.present().then(() =>{
      this.databaseProvider.obtenerCantidadPedidos(0).then(cped => {
        this.databaseProvider.obtenerCantidadRecibos(0).then(crec =>{
          if(cped <= 0){
            if(crec <= 0){
                this.sincronizarPolitica().then(resc =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Info','Políticas sincronizados correctamente');
                }).catch(ecn =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error al sincronizar',ecn.message);
                });
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Existen recibos que no se han sincronizado ');
            }
          }else{
            loader.dismiss();
            this.alerta.mostrarError('Error','Existen pedidos que no se han sincronizado ');
          }
        }).catch(ecer =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener cantidad de recibos',ecer.message);
        });
      }).catch(ecpe=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener cantidad de pedidos',ecpe.message);
      }); 
    });
  }
  sincronizarUmedidaBtn(){
    let loader = this.load.create({
        content:"Sincronizando unidades de medida..."
    });
    loader.present().then(() =>{
      this.databaseProvider.obtenerCantidadPedidos(0).then(cped => {
        this.databaseProvider.obtenerCantidadRecibos(0).then(crec =>{
          if(cped <= 0){
            if(crec <= 0){
                this.sincronizarUmedida().then(resc =>{
                  this.sincronizarFactor().then(resf =>{
                    loader.dismiss();
                    this.alerta.mostrarError('Info','Unidades de medida sincronizadas correctamente');
                  }).catch(ef =>{
                    loader.dismiss();
                    this.alerta.mostrarError('Error al sincronizar factores',ef.message);
                  });
                }).catch(ecn =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error al sincronizar unidades de medida',ecn.message);
                });
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Existen recibos que no se han sincronizado ');
            }
          }else{
            loader.dismiss();
            this.alerta.mostrarError('Error','Existen pedidos que no se han sincronizado ');
          }
        }).catch(ecer =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener cantidad de recibos',ecer.message);
        });
      }).catch(ecpe=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener cantidad de pedidos',ecpe.message);
      }); 
    });
  }
  sincronizarProductosBtn(){
    let loader = this.load.create({
        content:"Sincronizando productos..."
    });
    loader.present().then(() =>{
      this.databaseProvider.obtenerCantidadPedidos(0).then(cped => {
        this.databaseProvider.obtenerCantidadRecibos(0).then(crec =>{
          if(cped <= 0){
            if(crec <= 0){
              this.sincronizarProductos().then(res =>{
                this.sincronizarCanal().then(resc =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Info','Productos sincronizados correctamente');
                }).catch(ecn =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error al sincronizar canales',ecn.message);
                });
              }).catch(epr=>{
                loader.dismiss();
                this.alerta.mostrarError('Error al sincronizar productos',epr.message);
              });
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Existen recibos que no se han sincronizado ');
            }
          }else{
            loader.dismiss();
            this.alerta.mostrarError('Error','Existen pedidos que no se han sincronizado ');
          }
        }).catch(ecer =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener cantidad de recibos',ecer.message);
        });
      }).catch(ecpe=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener cantidad de pedidos',ecpe.message);
      }); 
    });
  }
  sincronizarClientesBtn(){
      let loader = this.load.create({
        content:"Sincronizando clientes..."
      });
      loader.present().then(()=>{
        this.databaseProvider.obtenerCantidadPedidos(0).then(cped => {
          this.databaseProvider.obtenerCantidadRecibos(0).then(crec =>{
            if(cped <= 0){
              if(crec <= 0){
                this.databaseProvider.getClientes(this.parametros, this.uac).then(data => {
                  var dat;
                  dat = data;
                  this.databaseProvider.borrarClientes();
                  this.databaseProvider.borrarClientesNuevo();
                  if(dat.length>0){
                    for(let i = 0; i < dat.length;i++){
                      this.databaseProvider.insertarCliente(dat[i]).then(ecl =>{        
                        if(i=== (dat.length-1)){
                        this.sincronizarDirecciones().then(rdir =>{
                          this.sincronizarZonas().then(rzon =>{
                            this.sincronizarDpedidoInfo().then(rdp =>{
                              this.sincronizarRutas().then(rru =>{
                                loader.dismiss();
                                this.alerta.mostrarError('Info','Clientes sincronizados correctamente');
                              }).catch(eru =>{
                                loader.dismiss();
                                this.alerta.mostrarError('Error al sincronizar rutas',eru.message);
                              });
                            }).catch(edz =>{
                              loader.dismiss();
                              this.alerta.mostrarError('Error al sincronizar información pedidos',edz.message);
                            });
                          }).catch(ezon =>{
                            loader.dismiss();
                            this.alerta.mostrarError('Error al sincronizar zonas',ezon.message);
                          })
                        }).catch(edir=>{
                          loader.dismiss();
                          this.alerta.mostrarError('Error al sincronizar direcciones',edir.message);
                        });
                      }
                      }).catch(ecss=>{
                        loader.dismiss();
                        this.alerta.mostrarError('Error al sincronizar clientes',ecss.message);
                      });
                    }
                }else{
                  loader.dismiss();
                  this.alerta.mostrarError('Info','Clientes sincronizados correctamente');
                }
                }).catch(e => {
                  this.alerta.mostrarError('Error al sincronizar ',e.message);
                });
              }else{
                loader.dismiss();
                this.alerta.mostrarError('Error','Existen recibos que no se han sincronizado ');
              }
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Existen pedidos que no se han sincronizado ');
            }
          }).catch(ecer =>{
            loader.dismiss();
            this.alerta.mostrarError('Error al obtener cantidad de recibos',ecer.message);
          });
        }).catch(ecpe=>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener cantidad de pedidos',ecpe.message);
        }); 
      });
  }
  
  sincronizarTodo(){
    let loader = this.load.create({
        content: 'Descargando...',
      });
    loader.present().then(()=>{
       this.databaseProvider.obtenerCantidadPedidos(0).then(cped => {
          this.databaseProvider.obtenerCantidadRecibos(0).then(crec =>{
            if(cped <= 0){
              if(crec <= 0){
                this.sincronizarClientes().then(rescli =>{
                  this.sincronizarDocumentos().then(resdos  =>{
                    this.sincronizarTablaPreventas().then(resprv =>{
                        this.sincronizarDlistaPre().then(resdlp=>{
                          this.sincronizarProductos().then(respro =>{
                            this.sincronizarUmedida().then(resume =>{
                              this.sincronizarFactor().then(resfac =>{
                                this.sincronizarPolitica().then(respol =>{
                                  this.sincronizarTipoProducto().then(restpr =>{
                                    this.sincronizarMarcas().then(resmar => {
                                      this.sincronizarClasificaciones().then(resclzz=>{
                                        this.sincronizarModelos().then(resmdd => {
                                          this.sincronizarProductoModelo().then(reszas => {
                                            this.sincronizarBodega().then(resbod =>{
                                              this.sincronizarCanal().then(rescan =>{
                                                    this.sincronizarDirecciones().then(resdir =>{
                                                      this.sincronizarZonas().then(reszon =>{
                                                        this.sincronizarDpedidoInfo().then(redde =>{
                                                          this.sincronizarNovedad().then(resnov =>{
                                                            this.sincronizarRutas().then(resrut => {
                                                              //this.databaseProvider.borrarDetalles();
                                                              //this.databaseProvider.borrarCpedidos();
                                                              if(this.parRecibos === true){
                                                                this.sincronizarBancos().then(resban =>{
                                                                  this.sincronizarEmisor().then(resem =>{
                                                                    this.sincronizarTpa().then(restpa => {
                                                                      this.sincronizarDocumentos().then(resdoc =>{
                                                                        if(this.parValStock ===true ){
                                                                          this.sincronizarSaldos().then(ressal =>{
                                                                            this.storage.set("secuencia",null);
                                                                            this.storage.set("versionSincronizacion",this.darFormatoFecha(new Date()));
                                                                            loader.dismiss();
                                                                            this.alerta.mostrarError('Info','Datos sincronizados correctamente');
                                                                          }).catch(errsal =>{
                                                                            loader.dismiss();
                                                                            this.alerta.mostrarError('Error',errsal);
                                                                          });
                                                                        }else{
                                                                          this.storage.set("versionSincronizacion",this.darFormatoFecha(new Date()));
                                                                          loader.dismiss();
                                                                          this.alerta.mostrarError('Info','Datos sincronizados correctamente'); 
                                                                        }           
                                                                      }).catch(errddo =>{
                                                                          loader.dismiss();
                                                                          this.alerta.mostrarError('Error',errddo);
                                                                      });
                                                                    }).catch(errtpa => {
                                                                      loader.dismiss();
                                                                      this.alerta.mostrarError('Error',errtpa);
                                                                    });
                                                                  }).catch(erremi =>{
                                                                    loader.dismiss();
                                                                    this.alerta.mostrarError('Error',erremi);
                                                                  });
                                                                }).catch( errban => {
                                                                  loader.dismiss();
                                                                  this.alerta.mostrarError('Error',errban);
                                                                });
                                                              }else{
                                                                this.sincronizarSaldos().then(ressal =>{
                                                                    loader.dismiss();
                                                                    this.storage.set("versionSincronizacion",this.darFormatoFecha(new Date()));
                                                                    this.alerta.mostrarError('Info','Datos sincronizados correctamente');
                                                                }).catch(errsal =>{
                                                                  loader.dismiss();
                                                                  this.alerta.mostrarError('Error',errsal);
                                                                });
                                                              }
                                                            }).catch(errrut =>{
                                                              loader.dismiss();
                                                            this.alerta.mostrarError('Error',errrut);
                                                            });
                                                          }).catch(errnov => {
                                                            loader.dismiss();
                                                            this.alerta.mostrarError('Error',errnov);
                                                          });
                                                        }).catch(errdep =>{
                                                            loader.dismiss();
                                                          this.alerta.mostrarError('Error',errdep);
                                                        });
                                                      }).catch(errzon =>{
                                                        loader.dismiss();
                                                        this.alerta.mostrarError('Error',errzon);
                                                      });
                                                    }).catch(errdir =>{
                                                      loader.dismiss();
                                                      this.alerta.mostrarError('Error',errdir);
                                                    });                                            
                                              }).catch(errcan=>{
                                                  this.alerta.mostrarError('Error',errcan.message);
                                              });
                                            }).catch(errbod =>{
                                                loader.dismiss();
                                              this.alerta.mostrarError('Error',errbod);
                                            });
                                          }).catch(errczx =>{
                                            loader.dismiss();
                                            this.alerta.mostrarError('Error',errczx);
                                          })
                                        }).catch(ooi=>{
                                          loader.dismiss();
                                          this.alerta.mostrarError('Error',ooi);
                                        })
                                      }).catch(errmarc=>{
                                        loader.dismiss();
                                        this.alerta.mostrarError('Error',errmarc);
                                      });
                                    }).catch(errcla => {
                                      loader.dismiss();
                                      this.alerta.mostrarError('Error',errcla);
                                    });
                                  }).catch(errtpr =>{
                                    loader.dismiss();
                                  this.alerta.mostrarError('Error',errtpr);
                                  });    
                                }).catch(errpol =>{
                                  loader.dismiss();
                                  this.alerta.mostrarError('Error',errpol);
                                });
                              }).catch(efc =>{
                                  loader.dismiss();
                                  this.alerta.mostrarError('Error',efc);
                              });
                            }).catch(eum =>{
                              loader.dismiss();
                              this.alerta.mostrarError('Error',eum);
                            });
                          }).catch(ep =>{
                            loader.dismiss();
                            this.alerta.mostrarError('Error',ep);
                          });           
                        }).catch(edl => {
                          loader.dismiss();
                          this.alerta.mostrarError('Error',edl);
                        });
                      }).catch(erd=>{
                        loader.dismiss();
                        this.alerta.mostrarError('Error',erd);
                      });
                    }).catch(rd=>{
                      loader.dismiss();
                      this.alerta.mostrarError('Error',rd);
                    });
                  }).catch(er=>{
                    loader.dismiss();
                    this.alerta.mostrarError('Error',er);
                  });
              }else{
                loader.dismiss();
                this.alerta.mostrarError('Error','Existen recibos que no se han sincronizado ');
              }
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Existen pedidos que no se han sincronizado ');
            }
          }).catch(ecer =>{
            loader.dismiss();
            this.alerta.mostrarError('Error al obtener cantidad de recibos',ecer.message);
          });
        }).catch(ecpe=>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener cantidad de pedidos',ecpe.message);
        }); 
    });
  }
  sincronizarTodoManana(){
    this.insomnia.keepAwake().then(()=>{
      let loader = this.load.create({
        content: 'Descargando...',
      });
    loader.present().then(()=>{
       this.databaseProvider.obtenerCantidadPedidos(0).then(cped => {
          this.databaseProvider.obtenerCantidadRecibos(0).then(crec =>{
            if(cped <= 0){
              if(crec <= 0){
                let ff = new Date();
                if(ff.getDay() === 6){
                  this.uac.dia = ff.getDay()+2;
                }else{
                  this.uac.dia = ff.getDay()+1;
                }
                this.sincronizarClientes().then(rescli =>{
                    this.sincronizarDlistaPre().then(resdlp=>{
                      this.sincronizarProductos().then(respro =>{
                        this.sincronizarUmedida().then(resume =>{
                          this.sincronizarFactor().then(resfac =>{
                            this.sincronizarPolitica().then(respol =>{
                              this.sincronizarTipoProducto().then(restpr =>{
                                this.sincronizarBodega().then(resbod =>{
                                  this.sincronizarCanal().then(rescan =>{
                                    this.sincronizarDirecciones().then(resdir =>{
                                      this.sincronizarZonas().then(reszon =>{
                                        this.sincronizarDpedidoInfo().then(redde =>{
                                          this.sincronizarNovedad().then(resnov =>{
                                            this.sincronizarRutas().then(resrut => {
                                              //this.databaseProvider.borrarDetalles();
                                              //this.databaseProvider.borrarCpedidos();
                                              if(this.parRecibos === true){
                                                this.sincronizarBancos().then(resban =>{
                                                  this.sincronizarEmisor().then(resem =>{
                                                    this.sincronizarTpa().then(restpa => {
                                                      this.sincronizarDocumentos().then(resdoc =>{
                                                        if(this.parValStock ===true ){
                                                          this.sincronizarSaldos().then(ressal =>{
                                                            this.storage.set("secuencia",null);
                                                            this.uac.dia = ff.getDay();
                                                            loader.dismiss();
                                                            this.alerta.mostrarError('Info','Datos sincronizados correctamente');
                                                          }).catch(errsal =>{
                                                            loader.dismiss();
                                                            this.alerta.mostrarError('Error',errsal);
                                                          });
                                                        }else{
                                                          this.uac.dia = ff.getDay();
                                                          loader.dismiss();
                                                          this.alerta.mostrarError('Info','Datos sincronizados correctamente'); 
                                                        }           
                                                      }).catch(errddo =>{
                                                          loader.dismiss();
                                                          this.alerta.mostrarError('Error',errddo);
                                                      });
                                                    }).catch(errtpa => {
                                                      loader.dismiss();
                                                      this.alerta.mostrarError('Error',errtpa);
                                                    });
                                                  }).catch(erremi =>{
                                                    loader.dismiss();
                                                    this.alerta.mostrarError('Error',erremi);
                                                  });
                                                }).catch( errban => {
                                                  loader.dismiss();
                                                  this.alerta.mostrarError('Error',errban);
                                                });
                                              }else{
                                                this.sincronizarSaldos().then(ressal =>{
                                                    this.uac.dia = ff.getDay();
                                                    loader.dismiss();
                                                    this.alerta.mostrarError('Info','Datos sincronizados correctamente');
                                                }).catch(errsal =>{
                                                  loader.dismiss();
                                                  this.alerta.mostrarError('Error',errsal);
                                                });
                                              }
                                            }).catch(errrut =>{
                                              loader.dismiss();
                                            this.alerta.mostrarError('Error',errrut);
                                            });
                                          }).catch(errnov => {
                                            loader.dismiss();
                                            this.alerta.mostrarError('Error',errnov);
                                          });
                                        }).catch(errdep =>{
                                            loader.dismiss();
                                          this.alerta.mostrarError('Error',errdep);
                                        });
                                      }).catch(errzon =>{
                                        loader.dismiss();
                                        this.alerta.mostrarError('Error',errzon);
                                      });
                                    }).catch(errdir =>{
                                      loader.dismiss();
                                      this.alerta.mostrarError('Error',errdir);
                                    });
                                  }).catch(errcan=>{
                                      this.alerta.mostrarError('Error',errcan.message);
                                  });
                                }).catch(errbod =>{
                                    loader.dismiss();
                                  this.alerta.mostrarError('Error',errbod);
                                });
                              }).catch(errtpr =>{
                                loader.dismiss();
                              this.alerta.mostrarError('Error',errtpr);
                              });    
                            }).catch(errpol =>{
                              loader.dismiss();
                              this.alerta.mostrarError('Error',errpol);
                            });
                          }).catch(efc =>{
                              loader.dismiss();
                              this.alerta.mostrarError('Error',efc);
                          });
                        }).catch(eum =>{
                          loader.dismiss();
                          this.alerta.mostrarError('Error',eum);
                        });
                      }).catch(ep =>{
                        loader.dismiss();
                        this.alerta.mostrarError('Error',ep);
                      });           
                    }).catch(edl => {
                      loader.dismiss();
                      this.alerta.mostrarError('Error',edl);
                    });
                  }).catch(er=>{
                    loader.dismiss();
                    this.alerta.mostrarError('Error',er);
                  });
              }else{
                loader.dismiss();
                this.alerta.mostrarError('Error','Existen recibos que no se han sincronizado ');
              }
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Existen pedidos que no se han sincronizado ');
            }
          }).catch(ecer =>{
            loader.dismiss();
            this.alerta.mostrarError('Error al obtener cantidad de recibos',ecer.message);
          });
        }).catch(ecpe=>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener cantidad de pedidos',ecpe.message);
        }); 
    });
    }, ()=>{
      console.log('Error ');
      
    });
  }
}
