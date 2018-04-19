import { Component } from '@angular/core';
import { NavController,Platform } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ParametrosPage } from '../parametros/parametros';
import { MenuPage } from '../menu/menu';
import { Storage } from '@ionic/storage';
import { AppVersion } from '@ionic-native/app-version';
import { Insomnia } from '@ionic-native/insomnia';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  parametros:any;
  codigoIngreso = "";
  image={img:""};
  version="";
  constructor(public alertCtrl: AlertController, public storage: Storage, public navCtrl: NavController, 
    public databaseProvider: DatabaseProvider, public alerta:AlertaProvider,  public load: LoadingController,
  public appVersion: AppVersion, public insomnia: Insomnia, public platform :Platform) {     
    let loader =this.load.create({
        content:'Procesando...'
      });
      this.insomnia.keepAwake();
    loader.present().then(() =>{
      this.storage.set('latitud',null);
      this.storage.set('longitud',null);
      this.storage.set('datosCabecera',null);
      this.storage.set('detalles',null);
      this.storage.set('cliente',null);
      this.storage.set('mod',null);
      this.storage.set('idPedido',null);
      this.storage.set("datosCabeceraRec",null);
      this.storage.set("documentos",null);
      this.databaseProvider.getDatabaseState().subscribe(rdy =>{
      if(rdy){
          this.databaseProvider.obtenerParametros().then(data =>{
            this.parametros = data;
            
           this.appVersion.getVersionNumber().then(res=>{
            this.version = res;
           }).catch(err =>{
             console.log('Error al obtener versión');
             
           });


            loader.dismiss();
          }).catch(error =>{
            loader.dismiss();
            this.alerta.mostrarError('Error',error);
          });
        }
      });
    });
  }
  salir(){
    this.platform.exitApp();
  }
  sincronizarUsuarios(){
    let loader = this.load.create({
        content: 'Procesando...',
      });
    loader.present().then(()=>{
      this.databaseProvider.getUsuarios(this.parametros).then(data => {
        var dat;
        dat = data;
        this.databaseProvider.borrarUsuarios();
        this.databaseProvider.borrarEmpleado();
          for(var i = 0; i < dat.length;i++){
            this.databaseProvider.insertarUsuario(dat[i]);
            var vendedores;
            vendedores = dat[i].vendedores;
            for(var j = 0; j < vendedores.length; j++){
              this.databaseProvider.insertarEmpleado(vendedores[j],dat[i].id);           
            }
          }
          this.alerta.mostrarError('Info','Usuarios sincronizados correctamente');
          loader.dismiss(); 
      }).catch(e => {
        loader.dismiss();
        this.alerta.mostrarError('Error','Error al conectarse con el servidor');
      });
    });    
    
  }

  irAParametros(){

    let ale = this.alertCtrl.create({
      inputs:[
        {
          name: 'password',
          placeholder: 'Código',
          type: 'password'
        }
      ],
      buttons:[
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Ingresar',
          handler: data => {

            if (data.password === 'admin21630') {
              this.navCtrl.push(ParametrosPage,{
                admin:true
              });
            } else if(data.password === 'ic'){
              this.navCtrl.push(ParametrosPage,{
                admin:false
              });
            }else{
              this.alerta.mostrarError('Error','Código incorrecto');
              return false;
            }
          }
        }
      ]
    });
    ale.present();
    
  }
  ingresar(){
    //console.log('Cod-> ',this.codigoIngreso.trim().length);
    
    if(this.codigoIngreso.trim().length>0){
      this.databaseProvider.obtenerUsuario(this.codigoIngreso).then(respuesta =>{
        if(respuesta.length>0){
          if(respuesta.length>1){
              var options = {
                message: 'Seleccionar la empresa',
                buttons: [
                  {
                    text: 'Seleccionar',
                    handler: data => {
                      var fa = new Date();
                      if(data !== undefined){
                        this.storage.set("usuario",this.codigoIngreso);
                       
                        var usu = {
                          usuario: this.codigoIngreso,
                          empleado : data,
                          dia:fa.getDay(),
                          imagenes:[],
                          version:this.version
                        }
                        this.navCtrl.push(MenuPage,{
                          uac:usu
                        });
                        this.storage.set("uac",usu);
                      }else{
                        this.alerta.mostrarError('Error','Debe seleccionar una empresa');
                        return false;
                      }
                    }
                  }
                ],
                inputs:[]
              }
              options.inputs = [];
              for(var i = 0; i < respuesta.length; i++){
                var res = respuesta[i];
                options.inputs.push({ name : res.idEmpresa, value: res.idEmpleado, label: res.nombreEmpresa, type: 'radio' });
              }
              let prr = this.alertCtrl.create(options);
              prr.present();
          }else{
            this.storage.set("usuario",this.codigoIngreso);
             var fa = new Date();
            var usu = {
              usuario: respuesta[0].usuario,
              empleado : respuesta[0].idEmpleado,
              dia:fa.getDay(),
              version:this.version
            }
            this.storage.set("uac",usu);
            this.navCtrl.push(MenuPage,{
                          uac:usu
            });
          }
        }else{
          this.alerta.mostrarError('Error','No existe el usuario');
        }
      }).catch(error =>{
        this.alerta.mostrarError('Error al obtener empleado',error);
      })
    }else{
      this.alerta.mostrarError('Error','Debe ingresar un código');
    }
    
  }

}
