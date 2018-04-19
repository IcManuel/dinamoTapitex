import { Component } from '@angular/core';
import { NavController, NavParams,App,Platform } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { MenuPedidosPage } from '../menu-pedidos/menu-pedidos';
import { SaldosPage } from '../saldos/saldos';
import { MenuRecibosPage } from '../menu-recibos/menu-recibos';
import { MenuSincronizarPage } from '../menu-sincronizar/menu-sincronizar';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';
import { AppVersion } from '@ionic-native/app-version';
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {
  parametros = [];
  parValStock = false;
  parRecibos = false;
  uac={};
  versionApp="";
  versionSincro="";
  versionPreventa="";
  verionImagen="";
  versionImportacion="";
  usuario="";
  constructor(public storage:Storage, public alertCtrl: AlertController, 
    public navCtrl: NavController, public databaseProvider: DatabaseProvider, 
    public alerta:AlertaProvider,  public load: LoadingController, public navParams: NavParams,
  public appCtrl:App, public platform :Platform, public appVersion:AppVersion) {
    this.uac = navParams.get("uac");
    if(this.uac===null || this.uac===undefined){
      this.storage.get("uac").then(rr=>{
        this.uac = rr;
      })
    }
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
  ionViewDidEnter() {
    this.appVersion.getVersionNumber().then(res=>{
      this.versionApp = res;
     }).catch(err =>{
     });
    this.storage.get("usuario").then(usu=>{
      this.usuario = usu;
    })
    this.storage.get("versionImagen").then(usu=>{
      if(usu!==null && usu !== undefined){
        this.verionImagen = usu;
      }else{
        this.verionImagen = "S/N";
      }
    })
    this.storage.get("versionSincronizacion").then(usu=>{
      if(usu!==null && usu !== undefined){
        this.versionSincro = usu;
      }else{
        this.versionSincro = "S/N";
      }
    })
  }
  cerrarSesion(){
    this.storage.set("usuario",null);
    this.appCtrl.getRootNav().push(HomePage,{
      uac:this.uac
    }); 
  }
  doYourStuff()
  { 
    this.appCtrl.getRootNav().push(HomePage,{
      uac:this.uac
    });   
  }
  salir(){
    this.platform.exitApp();
  }
  irAPedidos(){
    this.navCtrl.push(MenuPedidosPage,{
      uac:this.uac
    });
  }
  irASaldos(){
    this.navCtrl.push(SaldosPage,{
      uac:this.uac
    });
  }
   irARecibos(){
    this.navCtrl.push(MenuRecibosPage,{
      uac:this.uac
    });
  }
  irASincronizar(){
    
    this.navCtrl.push(MenuSincronizarPage,{uac:this.uac});
    // let loader = this.load.create({
    //     content: 'Descargando...',
    //   });
    // loader.present().then(()=>{
    //     this.sincronizarClientes().then(rescli =>{
    //       this.sincronizarDlistaPre().then(resdlp=>{
    //         this.sincronizarProductos().then(respro =>{
    //           this.sincronizarUmedida().then(resume =>{
    //             this.sincronizarFactor().then(resfac =>{
    //               this.sincronizarPolitica().then(respol =>{
    //                 this.sincronizarTipoProducto().then(restpr =>{
    //                   this.sincronizarBodega().then(resbod =>{
    //                     this.sincronizarCanal().then(rescan =>{
    //                       this.sincronizarDirecciones().then(resdir =>{
    //                         this.sincronizarZonas().then(reszon =>{
    //                           this.sincronizarDpedidoInfo().then(redde =>{
    //                             this.sincronizarNovedad().then(resnov =>{
    //                               this.sincronizarRutas().then(resrut => {
    //                                 this.databaseProvider.borrarDetalles();
    //                                 this.databaseProvider.borrarCpedidos();
    //                                 if(this.parRecibos === true){
    //                                   this.sincronizarBancos().then(resban =>{
    //                                     this.sincronizarEmisor().then(resem =>{
    //                                       this.sincronizarTpa().then(restpa => {
    //                                         this.sincronizarDocumentos().then(resdoc =>{
    //                                           if(this.parValStock ===true ){
    //                                             this.sincronizarSaldos().then(ressal =>{
    //                                               this.storage.set("secuencia",null);
    //                                               loader.dismiss();
    //                                               this.alerta.mostrarError('Info','Datos sincronizados correctamente');
    //                                             }).catch(errsal =>{
    //                                               loader.dismiss();
    //                                               this.alerta.mostrarError('Error',errsal);
    //                                             });
    //                                           }else{
    //                                             loader.dismiss();
    //                                             this.alerta.mostrarError('Info','Datos sincronizados correctamente'); 
    //                                           }           
    //                                         }).catch(errddo =>{
    //                                             loader.dismiss();
    //                                             this.alerta.mostrarError('Error',errddo);
    //                                         });
    //                                       }).catch(errtpa => {
    //                                         loader.dismiss();
    //                                         this.alerta.mostrarError('Error',errtpa);
    //                                       });
    //                                     }).catch(erremi =>{
    //                                       loader.dismiss();
    //                                       this.alerta.mostrarError('Error',erremi);
    //                                     });
    //                                   }).catch( errban => {
    //                                     loader.dismiss();
    //                                     this.alerta.mostrarError('Error',errban);
    //                                   });
    //                                 }else{
    //                                   this.sincronizarSaldos().then(ressal =>{
    //                                     setTimeout(()=>{
    //                                       loader.dismiss();
    //                                       this.alerta.mostrarError('Info','Datos sincronizados correctamente');
    //                                     },3000);
    //                                   }).catch(errsal =>{
    //                                     loader.dismiss();
    //                                     this.alerta.mostrarError('Error',errsal);
    //                                   });
    //                                 }
    //                               }).catch(errrut =>{
    //                                 loader.dismiss();
    //                               this.alerta.mostrarError('Error',errrut);
    //                               });
    //                             }).catch(errnov => {
    //                               loader.dismiss();
    //                               this.alerta.mostrarError('Error',errnov);
    //                             });
    //                           }).catch(errdep =>{
    //                               loader.dismiss();
    //                             this.alerta.mostrarError('Error',errdep);
    //                           });
    //                         }).catch(errzon =>{
    //                           loader.dismiss();
    //                           this.alerta.mostrarError('Error',errzon);
    //                         });
    //                       }).catch(errdir =>{
    //                         loader.dismiss();
    //                         this.alerta.mostrarError('Error',errdir);
    //                       });
    //                     }).catch(errcan=>{
    //                         this.alerta.mostrarError('Error',errcan.message);
    //                     });
    //                   }).catch(errbod =>{
    //                       loader.dismiss();
    //                     this.alerta.mostrarError('Error',errbod);
    //                   });
    //                 }).catch(errtpr =>{
    //                   loader.dismiss();
    //                  this.alerta.mostrarError('Error',errtpr);
    //                 });    
    //               }).catch(errpol =>{
    //                 loader.dismiss();
    //                  this.alerta.mostrarError('Error',errpol);
    //               });
    //             }).catch(efc =>{
    //                 loader.dismiss();
    //                  this.alerta.mostrarError('Error',efc);
    //             });
    //           }).catch(eum =>{
    //             loader.dismiss();
    //             this.alerta.mostrarError('Error',eum);
    //           });
    //         }).catch(ep =>{
    //           loader.dismiss();
    //           this.alerta.mostrarError('Error',ep);
    //         });           
    //       }).catch(edl => {
    //         loader.dismiss();
    //         this.alerta.mostrarError('Error',edl);
    //       });
    //     }).catch(er=>{
    //       loader.dismiss();
    //       this.alerta.mostrarError('Error',er);
    //     });
    //   });
  }
  sincronizarClientes(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getClientes(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarClientes();
          for(var i = 0; i < dat.length;i++){
            this.databaseProvider.insertarCliente(dat[i]);
          }
          resolve(1);
          }).catch(e => {
            reject('Error al conectarse con el servidor: Clientes');
          })
       });
  }

  sincronizarDlistaPre(){
    return new Promise ((resolve,reject) => {this.databaseProvider.getDlistaPre(this.parametros, this.uac).then(data => {
        var dat;
        dat = data;
        this.databaseProvider.borrarDlistaPre();
         for(var i = 0; i < dat.length;i++){
           this.databaseProvider.insertarDlistaPre(dat[i]);
         }
        resolve(1);
      }).catch(e => {
        reject('Error al conectarse con el servidor: DlistaPre');
      })
    });
  }
  sincronizarProductos(){
    return new Promise ((resolve,reject) => {this.databaseProvider.getProductos(this.parametros, this.uac).then(data => {   
        var dat;
        dat = data;
        this.databaseProvider.borrarProductos();
         for(var i = 0; i < dat.length;i++){
           this.databaseProvider.insertarProducto(dat[i]);
         }
        resolve(1);
      }).catch(e => {
        reject('Error al conectarse con el servidor: Productos');
      })
    });
  }
  sincronizarUmedida(){
    return new Promise ((resolve,reject) => {this.databaseProvider.getUmedida(this.parametros, this.uac).then(data => { 
        var dat;
        dat = data;
        this.databaseProvider.borrarUmedida();
         for(var i = 0; i < dat.length;i++){
           this.databaseProvider.insertarUmedida(dat[i]);
         }
        resolve(1);
      }).catch(e => {
        reject('Error al conectarse con el servidor: Umedida');
      })
    });
  }
  sincronizarFactor(){
    return new Promise ((resolve,reject) => {this.databaseProvider.getFactores(this.parametros, this.uac).then(data => {      
        var dat;
        dat = data;
        this.databaseProvider.borrarFactores();
         for(var i = 0; i < dat.length;i++){
           this.databaseProvider.insertarFactor(dat[i]);
         }
        resolve(1);
      }).catch(e => {
        reject('Error al conectarse con el servidor: Factor');
      })
    });
  }
  sincronizarPolitica(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getPolitica(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarPoliticas();
          for(var i = 0; i < dat.length;i++){
            this.databaseProvider.insertarPolitica(dat[i]);
          }
          resolve(1);
          }).catch(e => {
            reject('Error al conectarse con el servidor: Politicas');
          })
       });
  }
  sincronizarTipoProducto(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getTipoProducto(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarTipoProducto();
          for(var i = 0; i < dat.length;i++){
            this.databaseProvider.insertarTipoProducto(dat[i]);
          }
          resolve(1);
          }).catch(e => {
            reject('Error al conectarse con el servidor: Tipo Producto');
          })
       });
  }
  sincronizarBodega(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getBodegas(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarBodegas();
          for(var i = 0; i < dat.length;i++){
            this.databaseProvider.insertarBodega(dat[i]);
          }
          resolve(1);
          }).catch(e => {
            reject('Error al conectarse con el servidor: Bodega');
          })
       });
  }
  sincronizarCanal(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getCanales(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarCanales();
          for(var i = 0; i < dat.length;i++){
            this.databaseProvider.insertarCanal(dat[i]);
          }
          resolve(1);
          }).catch(e => {
            reject('Error al conectarse con el servidor: Canal');
          })
       });
  }
  sincronizarDirecciones(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getDirecciones(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarDirecciones();
          for(var i = 0; i < dat.length;i++){
            this.databaseProvider.insertarDireccion(dat[i]);
          }
          resolve(1);
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
          for(var i = 0; i < dat.length;i++){
            this.databaseProvider.insertarZona(dat[i]);
          }
          resolve(1);
          }).catch(e => {
            reject('Error al conectarse con el servidor: zonas');
          })
       });
  }
  sincronizarDpedidoInfo(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getDPedidoInfo(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarDPedidoInfo();
          for(var i = 0; i < dat.length;i++){
            this.databaseProvider.insertarDPedidoInfo(dat[i]);
          }
          resolve(1);
          }).catch(e => {
            reject('Error al conectarse con el servidor: zonas');
          })
       });
  }
  sincronizarNovedad(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getNovedades(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarNovedad();
          for(var i = 0; i < dat.length;i++){
            this.databaseProvider.insertarNovedad(dat[i]);
          }
          resolve(1);
          }).catch(e => {
            reject('Error al conectarse con el servidor: novedades');
          })
       });
  }
  sincronizarBancos(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getBancos(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarBanco();
          for(var i = 0; i < dat.length;i++){
            this.databaseProvider.insertarBanco(dat[i]);
          }
          resolve(1);
          }).catch(e => {
            reject('Error al conectarse con el servidor: bancos');
          })
       });
  }

  sincronizarEmisor(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getEmisores(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarEmisor();
          for(var i = 0; i < dat.length;i++){
            this.databaseProvider.insertarEmisor(dat[i]);
          }
          resolve(1);
          }).catch(e => {
            reject('Error al conectarse con el servidor: emisores');
          })
       });
  }
  sincronizarTpa(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getTipoPagos(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarTiposPagos();
          for(var i = 0; i < dat.length;i++){
            this.databaseProvider.insertarTipoPago(dat[i]);
          }
          resolve(1);
          }).catch(e => {
            reject('Error al conectarse con el servidor: tipospagpos');
          })
       });
  }
  sincronizarDocumentos(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getDocumentos(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarDocumentos();
          for(var i = 0; i < dat.length;i++){
            this.databaseProvider.insertarDocumento(dat[i]);
          }
          resolve(1);
          }).catch(e => {
            reject('Error al conectarse con el servidor: documentos');
          })
       });
  }
  
  sincronizarSaldos(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getSaldoinv(this.parametros, this.uac).then(data => {
          var dat;
          dat = data;
          this.databaseProvider.borrarSaldos();
          for(var i = 0; i < dat.length;i++){
            this.databaseProvider.insertarSaldoInv(dat[i]);
          }
          resolve(1);
          }).catch(e => {
            reject('Error al conectarse con el servidor: saldos');
          })
       });
  }
  sincronizarRutas(){
      return new Promise((resolve,reject)=>{this.databaseProvider.getRutas(this.parametros, this.uac).then(data => {
          console.log('Rutas-> ',data);
          
          var dat;
          dat = data; 
          this.databaseProvider.borrarRutas();
          for(var i = 0; i < dat.length;i++){
            this.databaseProvider.insertarRuta(dat[i]);
          }
          resolve(1);
          }).catch(e => {
            reject('Error al conectarse con el servidor: rutas');
          })
       });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuPage');
  }

}
