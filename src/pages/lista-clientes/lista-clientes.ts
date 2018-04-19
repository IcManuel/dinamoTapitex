import { Component } from '@angular/core';
import { NavController, NavParams, App, Platform,ModalController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { PedidoPage } from '../pedido/pedido';
import { SaldosPage } from '../saldos/saldos';
import { Storage } from '@ionic/storage';
import { MenuPedidosPage } from '../menu-pedidos/menu-pedidos';

@Component({
  selector: 'page-lista-clientes',
  templateUrl: 'lista-clientes.html',
})
export class ListaClientesPage {
  zonas = [];
  zonaSelect = -1;
  nombreFiltro="";
  todos = false;
  cabecera ="Clientes de Ruta";
  clientes =[];
  clientesAux=[];
  buttonColor: string = 'white';
  uac:any;
  numitem=10;
  pos = 10;
  constructor(public platform:Platform, public appCtrl: App,
     public navCtrl: NavController, public storage: Storage, 
     public navParams: NavParams, public database:DatabaseProvider, 
     public alerta:AlertaProvider, public alert: AlertController,
     public load:LoadingController, public modalCtrl:ModalController) {
    this.uac = this.navParams.get("uac");
  }
  ionViewDidEnter(){
    this.numitem = parseInt(((this.platform.height()-200)/40)+"",10);
    this.zonas = [];
    this.zonaSelect;
    this.nombreFiltro="";
    this.todos = false;
    this.cabecera ="Clientes de Ruta";
    this.clientes =[];
    this.buttonColor='white';
    setTimeout(() =>{
      let loader =this.load.create({
        content:'Procesando...'
      });
      loader.present().then(()=>{
        this.database.getDatabaseState().subscribe(rdy =>{
        if(rdy){
          this.database.obtenerZonas().then(data =>{
            var dat;
            dat = data;
            if(dat.length>0){
              this.zonas = dat;
              this.pos = this.numitem;       
              this.database.obtenerClientes(this.nombreFiltro,this.zonaSelect,this.todos).then(datos =>{
                this.clientesAux = datos;
                if(datos.length>0){
                    for(let xd = this.pos-this.numitem; xd<this.pos;xd++ ){
                      this.clientes.push(this.clientesAux[xd]);
                    }   
                  //loader.dismiss();
                }else{
                  //loader.dismiss();
                }
                
                
              }).catch(er =>{
                loader.dismiss();
                console.log('Error al obtener clientes -> ',er); 
              });
            }else{
                loader.dismiss();
              this.alerta.mostrarError('Error','No existen zonas');
            }
          }).catch(error => {
            loader.dismiss();
            this.alerta.mostrarError('Error',error);
          });
        }
      });
      loader.dismiss();})
    },100);
  }
  doYourStuff()
  { 
    this.appCtrl.getRootNav().push(MenuPedidosPage,{
      uac:this.uac
    });   
  }
  setQuantity() {
    if(this.todos===true){
          this.cabecera="Todos los Clientes"
        }else{
          this.cabecera="Clientes de Ruta";
        }
        this.clientes = [];
        this.pos = this.numitem;       
        this.database.obtenerClientes(this.nombreFiltro,this.zonaSelect,this.todos).then(datos =>{
          this.clientesAux = datos;
          if(this.clientesAux.length > this.numitem){
            for(let xd = this.pos-this.numitem; xd<this.pos;xd++ ){
              this.clientes.push(this.clientesAux[xd]);
            }
          }else{
            for(let xd = 0; xd<this.clientesAux.length;xd++ ){
              this.clientes.push(this.clientesAux[xd]);
            }
          }
        }).catch(er =>{
          console.log('Error al obtener clientes -> ',er); 
        });
  }

  seleccionarCliente(cliente){
      this.storage.set('latitud',null);
      this.storage.set('longitud',null);
      //this.storage.set('datosCabecera',null);
      this.storage.set('cliente',cliente);
      this.storage.set('mod',false);
      //this.storage.set("detalles",null);
      this.storage.set('idPedido',null);
      this.appCtrl.getRootNav().push(PedidoPage,{
        cliente:cliente,
        tod:this.todos,
        uac:this.uac,
        zona:this.zonaSelect
      });

  }
  doInfinite(): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if(this.clientes.length<this.clientesAux.length){
          let res = (this.clientesAux.length-this.clientes.length);
          if(res>=this.numitem){
            this.pos+=this.numitem; 
            for(let xd = this.pos-this.numitem; xd<this.pos;xd++ ){
              this.clientes.push(this.clientesAux[xd]);
            }
            resolve();
          }else{
            this.pos+=res;
            for(let xd = this.pos-res; xd<this.pos;xd++ ){
              this.clientes.push(this.clientesAux[xd]);
            }
            resolve();
          }
        }else{
          resolve();
        }
      }, 500);
    })
  }
  cambioTodos(){
     let loader =this.load.create({
        content:'Procesando...'
      });
      loader.present().then(() =>{
        if(this.todos===true){
          this.cabecera="Todos los Clientes"
        }else{
          this.cabecera="Clientes de Ruta";
        }
        this.clientes = [];
        this.pos = this.numitem;       
        this.database.obtenerClientes(this.nombreFiltro,this.zonaSelect,this.todos).then(datos =>{
          this.clientesAux = datos;
          if(this.clientesAux.length > this.numitem){
            for(let xd = this.pos-this.numitem; xd<this.pos;xd++ ){
              this.clientes.push(this.clientesAux[xd]);
            }
            loader.dismiss();
          }else{
            for(let xd = 0; xd<this.clientesAux.length;xd++ ){
              this.clientes.push(this.clientesAux[xd]);
            }
            loader.dismiss();
          }
        }).catch(er =>{
          console.log('Error al obtener clientes -> ',er); 
        });
      });
  }
  abrirDocumentos(cliente){
    let profileModal = this.modalCtrl.create(SaldosPage, 
      { 
        cliente: cliente
      },{cssClass : 'pricebreakup'});
    profileModal.present();
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
