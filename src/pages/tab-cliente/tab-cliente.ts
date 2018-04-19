import { Component } from '@angular/core';
import { NavController, NavParams,AlertController,ModalController, App } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { DatabaseProvider } from '../../providers/database/database';
import { LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DialogInfoPage } from '../dialog-info/dialog-info';
import { DlgCrearclientePage } from '../dlg-crearcliente/dlg-crearcliente';
import { ListaClientesPage } from '../lista-clientes/lista-clientes';
import { SubirPedidosPage } from '../subir-pedidos/subir-pedidos';

@Component({
  selector: 'page-tab-cliente',
  templateUrl: 'tab-cliente.html',
})
export class TabClientePage {
  cliente= {
    id: -1,
                nombre: "",
                telefono:"",
                identificacion:"",
                listaPrecios:-1,
                politica:-1,
                email:"",
                idDir: -1,
                dir: "",
                diasplazo:1,
                descuento : 0,
                orden:0,
                cantPe:0,
                color:"white"
  };
  politicas = [];
  novedades = [];
  novedad:any;
  obsequio:false;
  observaciones:"";
  todos=false;
  coordenadas={
    latitud:0.0,
    longitud:0.0
  };
  datosCabecera = {
    observaciones:"",
    novedad:0,
    obsequio:false,
    descuento:0.0,
    idpol:0,
    diasPlazo:1,
    zona:-1
  }
  zona;
  modificacion=false;
  uac:any;
  constructor(public modalCtrl: ModalController,public navCtrl: NavController,private storage: Storage,
    public load:LoadingController, public database: DatabaseProvider, public navParams: NavParams,
    public alerta:AlertaProvider, public geolocation: Geolocation,public diagnostic: Diagnostic, 
    public alert: AlertController, public appCtrl: App ) {
      //this.cliente = this.navParams.data.cliente;
      this.todos = this.navParams.data.todos;
      this.uac = this.navParams.data.uac;
      this.zona = this.navParams.data.zona;
      this.database.getDatabaseState().subscribe(rdy =>{
        if(rdy){
          this.database.obtenerPoliticas().then(data =>{
            this.politicas = data;
            this.database.obtenerNovedades().then(nov =>{
              if(nov.length>0){
                this.novedad = nov[0].id;
              } 
              if(this.politicas.length>0){
                this.datosCabecera.idpol = this.politicas[0].id;
              }
              this.novedades = nov;
          }).catch(errnov => {
            this.alerta.mostrarError('Error',errnov);
          }) 
          }).catch(error => {
            this.alerta.mostrarError('Error',error);
          });
        }
      });
  }
  doYourStuff()
  {
    this.storage.get("mod").then(res=>{
      if(res === true){
        this.database.borrarProductostmp().then(resaa=>{
          this.storage.set("totalFinal",0.00);
            this.appCtrl.getRootNav().push(SubirPedidosPage,{
                uac:this.uac
            }); 
        });
      }else{
        this.appCtrl.getRootNav().push(ListaClientesPage,{
          uac:this.uac
        }); 
      }
    });
     
    }
  ionViewDidEnter(){
    this.storage.get('datosCabecera').then(respu => {
        if(respu!==null){
          this.datosCabecera = respu;
        }
      });
      setTimeout(() =>{
      let loader =this.load.create({
        content:'Procesando...'
      });
      loader.present().then(()=>{
        if(this.novedades.length>0){
          this.novedad = this.novedades[0].id;
        }
        this.storage.get('datosCabecera').then(respu => {
          this.storage.get('cliente').then(res=>{
            let cli;
            cli =res;
            this.cliente = cli;
            this.storage.get('mod').then(modres=>{
              if(modres!==null)
                this.modificacion = modres;
              else{
                this.modificacion= false;
              }
            });
            if(respu === null){
              this.datosCabecera.novedad = this.novedad;
              this.datosCabecera.descuento = this.cliente.descuento;
              this.datosCabecera.idpol = this.cliente.politica;
              this.datosCabecera.diasPlazo = this.cliente.diasplazo;
              this.datosCabecera.zona = this.zona;
              this.storage.set('datosCabecera',this.datosCabecera);
            } 
            if(this.datosCabecera.idpol ===null){
              if(this.politicas.length>0){
                this.datosCabecera.idpol = this.politicas[0].id;
              }
            }      
            //loader.dismiss();         
          }).catch(errc =>{
            loader.dismiss();
            this.alerta.mostrarError('Error al obtener cliente',errc.message);
          });
        });
      loader.dismiss();
    });
    },100);
  }

  presentProfileModal() {
    this.database.obtenerDpedidosInfo(this.cliente.id).then(data =>{
        var dat;
        dat=data;
        if(data.length>0){
           let profileModal = this.modalCtrl.create(DialogInfoPage, 
          { 
            userId: this.cliente.id,
            cli:this.cliente.nombre 
          });
        profileModal.present();
        }else{
          this.alerta.mostrarError('Info','No posee información del último pedido');
        }
    }).catch(error =>{
      this.alerta.mostrarError('Error',error);
    });
  }
  crearNuevoCliente(){
    let clienteModal = this.modalCtrl.create(DlgCrearclientePage,{
      zona:this.zona
    });
    clienteModal.onDidDismiss(datos =>{
      this.database.obtenerIdDlistaPre().then(idres =>{
        let lp;
         lp = idres;         
        if(!datos.cerrar){
        this.cliente = {
          id: datos.clienteNuevo.id,
                nombre: datos.clienteNuevo.nombres + " " + datos.clienteNuevo.apellidos,
                telefono:datos.clienteNuevo.telefono,
                identificacion:datos.clienteNuevo.identificacion,
                listaPrecios:lp.id,
                politica:datos.clienteNuevo.politica,
                email:datos.clienteNuevo.mail,
                idDir: -1,
                dir: datos.clienteNuevo.direccion,
                diasplazo:1,
                descuento : 0,
                orden:0,
                cantPe:0,
                color:"white"
        };
        this.todos = true;
        this.storage.set('cliente',this.cliente);
      }
      }).catch(errld =>{
        this.alerta.mostrarError('Error al obtener dlistapre',errld.message);
      });
    });
    clienteModal.present();
  }
  cambio(){
    this.storage.set('datosCabecera',this.datosCabecera);
  }
  obtenerPosicion(){
        this.geolocation.getCurrentPosition({
          enableHighAccuracy:true
        }).then((resp) => {
          this.coordenadas.latitud = resp.coords.latitude;
          this.coordenadas.longitud = resp.coords.longitude;
          this.storage.set('latitud',resp.coords.latitude);
          this.storage.set('longitud',resp.coords.longitude);
        }).catch((error) => {
          this.alerta.mostrarError('Error al obtener posición',error);
        });
      
  }
 
}
