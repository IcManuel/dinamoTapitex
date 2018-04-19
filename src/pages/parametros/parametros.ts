import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { File } from '@ionic-native/file';

/**
 * Generated class for the ParametrosPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */


@Component({
  selector: 'page-parametros',
  templateUrl: 'parametros.html'
})
export class ParametrosPage {
  admin = false;
  parServidor = "";
  parPuerto = "";
  parItems = 0;
  parIva = 12;
  parEmail = "info@icreativa.com.ec";
  parRepItem = false;
  parValStock = false;
  parRecibos = false;
  parCatalogo = false;
  direccionExterna = "";
  constructor(public navCtrl: NavController, public navParams: NavParams,public alertCtrl: AlertController,
              public database:DatabaseProvider,public alerta:AlertaProvider,  public load: LoadingController,
              public file: File) {
    this.admin =navParams.get("admin");
    this.database.getDatabaseState().subscribe(rdy =>{
      if(rdy){
        this.database.obtenerParametros().then(data =>{
          this.parServidor = data[0];
          this.parPuerto = data[1];
          this.parItems = data[2];
          this.parIva = data[3];
          this.parRepItem = data[4];
          this.parEmail = data[6];
          this.parValStock = data[10];
          this.parRecibos = data[11];
          this.parCatalogo = data[12];
        }).catch(error =>{
          this.alerta.mostrarError('Error',error);
        });
      }
    });
  }
  eliminarPrecios(){
    let loader = this.load.create({content:"Cargando..."});
    loader.present().then(()=>{
      this.database.borrarDlistaPre().then(res=>{
        let alertas = this.alertCtrl.create({
          title: 'Info',
          subTitle: 'Datos eliminados correctamente',
          buttons: [
            {
              text:'Ok',
              handler:() =>{
                loader.dismiss();
              }
            }]
        });
        alertas.present();
      }).catch(e=>{
        loader.dismiss();
      })
    });
  }
  cargarArchivo(){
    let loader = this.load.create({content:"Cargando..."});
    loader.present().then(()=>{
      this.direccionExterna = this.file.externalApplicationStorageDirectory;
      let texto = "id,cliente,descuento,diasplazo,fecha,estado,sincronizado,total,observaciones,direccion,politica,coordx,coordy,idNovedad,optimo,subEmpId , obsequio , subtotal , iva , idzona\n";
      this.database.obtenerTodosPedidos().then(res => {
         for(let xj = 0; xj <res.length;xj++){
           if(xj === res.length-1 ){
             texto+=res[xj]+"\n\n\nVAMOS POR LOS DETALLES\n";
             texto+="id, cpedido , producto , cantidad , promocion , descuento , precio , umedida , total , bodega , cordcom , preventa , observaciones\n\n"
             this.database.obtenerTodosDetalles().then(rde =>{
               for(let kj = 0; kj < rde.length; kj++){
                 if(kj === rde.length-1 ){
                   texto+=rde[kj]+"\n FINAL";
                   console.log('Texto que voy a mandar = ',texto);
                   loader.dismiss();
                   this.file.writeFile(this.direccionExterna,'Pedidos.txt',texto,{replace:true}).then(res =>{
                   }).catch(erroca =>{
                    this.alerta.mostrarError('Info','Archivo actualizado correctamente');
                   });
                 }else{
                   texto+=rde[kj]+"\n";
                 }
               }
             }).catch(erde=>{
              loader.dismiss();
               console.log('Errores al obtener dpedidos ',erde);
             })
           }else{
             texto+=res[xj]+"\n";
           }
         }
      }).catch(ers =>{
        loader.dismiss();
       console.log('Errores al obtener pedidos ',ers);
      });
    })
  }
  eliminarPedidosEliminados(){
    this.database.borrarDpedidoPorEstado(2).then(res=>{
      this.database.borrarCpedidoPorEstado(2).then(resi=>{
        console.log('Borrados correctamente');
      });
    });
  }
  guardarCambios(){
    this.database.actualizarParametros(this.parServidor);
    this.database.actualizarParametros(this.parPuerto);
    this.database.actualizarParametros(this.parItems);
    this.database.actualizarParametros(this.parIva);
    this.database.actualizarParametros(this.parRepItem);
    this.database.actualizarParametros(this.parEmail);
    this.database.actualizarParametros(this.parValStock);
    this.database.actualizarParametros(this.parRecibos);
    this.database.actualizarParametros(this.parCatalogo);
    let alertas = this.alertCtrl.create({
      title: 'Info',
      subTitle: 'Datos guardados correctamente',
      buttons: [
        {
          text:'Ok',
          handler:() =>{
            this.navCtrl.push(HomePage);
          }
        }]
    });
    alertas.present();
  }
  ionViewDidLoad() {
    
  }

}
