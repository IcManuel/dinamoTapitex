import { Component,ViewChild, } from '@angular/core';
import { NavController, NavParams, Platform,ToastController,App,Content ,ViewController} from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { MenuPage } from '../menu/menu';

@Component({
  selector: 'page-saldos',
  templateUrl: 'saldos.html',
})
export class SaldosPage {
  @ViewChild(Content) content: Content;
  nombreFiltro= "";
  clientes = [];
  clientesAux = [];
  uac:any;
  numitem=20;
  pos = 20;
  todos = false;
  documentos = [];
  mostrarLista = false;
  clienteSelect={
    nombre:'No hay cliente seleccionado',
    saldo : 0
  } ;
  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public database:DatabaseProvider, public alerta:AlertaProvider,public alert:AlertController, 
    public load: LoadingController, public platform: Platform, public toast:ToastController,
  public appCtrl: App, public view: ViewController) {
    this.uac = this.navParams.get("uac");
    this.clienteSelect = navParams.data.cliente;;
  }

  seleccionarCliente(cliente){
    this.clienteSelect = cliente;
    this.database.obtenerDdocumentosPorCliente(cliente.id).then(res=>{
      this.documentos = [];
      if(res.length>0){
        this.documentos = res;
        this.mostrarLista = true;
      }else{
        this.mostrarLista = true;
        let toas = this.toast.create({
          duration:1500,
          position:'middle',
          message:"No existen documentos"
        });
        toas.present();
      }
    })
  }
  cerrar(){
    this.view.dismiss();
  }
  ionViewDidEnter(){
    this.numitem = parseInt(((this.platform.height()-200)/40)+"",10);
    this.nombreFiltro="";
    let loader =this.load.create({
      content:'Procesando...'
    });
    loader.present().then(()=>{
      this.database.getDatabaseState().subscribe(rdy =>{
        if(rdy){
          let cl;
          cl = this.clienteSelect;
          this.database.obtenerDdocumentosPorCliente(cl.id).then(res=>{
            this.documentos = [];
            if(res.length>0){
              this.documentos = res;
              loader.dismiss();
            }else{
              loader.dismiss();
              let toas = this.toast.create({
                duration:1500,
                position:'middle',
                message:"Cliente sin saldo vencido"
              });
              toas.present();
            }
          })
        }
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
  busquedaCliente(){
    let loader =this.load.create({
      content:'Procesando...'
    });
    loader.present().then(()=>{
      this.database.obtenerClientesSaldosF(this.nombreFiltro,this.todos).then(datos =>{
        this.clientesAux = datos;
        this.mostrarLista =false;
        if(datos.length>0){
            for(let xd = this.pos-this.numitem; xd<this.pos;xd++ ){
              this.clientes.push(this.clientesAux[xd]);
              if(xd ===(this.pos-1) ){
                loader.dismiss();
              }
            }   
          
        }else{
          loader.dismiss();
          let toas = this.toast.create({
            duration:1500,
            position:'middle',
            message:"No existen datos"
          });
          toas.present();
        }
      }).catch(er =>{
        loader.dismiss();
        console.log('Error al obtener clientes -> ',er); 
      });
    });
  }
  buscarCliente(){
    this.mostrarLista =false;
    this.clientes = [];
    this.pos = this.numitem;       
    this.database.obtenerClientesSaldosF(this.nombreFiltro,this.todos).then(datos =>{
      this.clientesAux = datos;
      if(this.clientesAux.length>0){
        if(this.clientesAux.length > this.numitem){
          for(let xd = this.pos-this.numitem; xd<this.pos;xd++ ){
            this.clientes.push(this.clientesAux[xd]);
          }
        }else{
          for(let xd = 0; xd<this.clientesAux.length;xd++ ){
            this.clientes.push(this.clientesAux[xd]);
          }
        }
      }else{
        let toas = this.toast.create({
          duration:1500,
          position:'middle',
          message:"No existen datos"
        });
        toas.present();
      }
    }).catch(er =>{
      console.log('Error al obtener clientes -> ',er); 
    });
    
  }
}
