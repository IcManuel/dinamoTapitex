import { Component } from '@angular/core';
import { NavController, NavParams,AlertController, ModalController} from 'ionic-angular';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { DatabaseProvider } from '../../providers/database/database';
import { LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DlgInfoDocumentoPage } from '../dlg-info-documento/dlg-info-documento';

@Component({
  selector: 'page-tab-rec-cliente',
  templateUrl: 'tab-rec-cliente.html',
})
export class TabRecClientePage {
  nombreFiltro = "";
  clientes = [];
  mostrarLista=false;
  datosCabeceraRec = {
    cliente:{},
    observaciones:""
  }
  documentos=[];
  mostrarF=false;
  constructor(public navCtrl: NavController, public navParams: NavParams,public alert:AlertController, public alerta: AlertaProvider,
              public database: DatabaseProvider, public load: LoadingController, public storage: Storage, public modalCtrl: ModalController) {
        
  }
  buscarCliente(){
    this.storage.set("datosCabeceraRec",null);
    this.storage.set("documentos",null);
    this.mostrarLista = true ;
    this.mostrarF = false;
    this.database.obtenerClientesRecibo(this.nombreFiltro).then(res =>{
      this.clientes = res; 
    }).catch(err=>{
      this.alerta.mostrarError('Error al obtener clientes',err.message);
    });
  }
  cambioCan(){
    this.storage.set("documentos",this.documentos);
  }
  ionViewDidEnter(){
    this.storage.get("clienteRec").then(rc =>{
      if(rc !==null){

      }else{
        this.storage.set("datosCabeceraRec",null);
        this.nombreFiltro = "";
        this.clientes = [];
        this.mostrarLista=false;
        this.documentos=[];
      }
    });
  }
  mostrarElegido(cli){
    let loader = this.load.create({
    });
    loader.present().then(()=>{
      this.mostrarLista = false;
      this.datosCabeceraRec.cliente = cli;
      this.database.obtenerDdocumentosPorCliente(cli.id).then(rddo => {
        this.documentos = rddo;
        if(this.documentos.length>0){
          this.mostrarF = false;
        }else{
          this.mostrarF = true;
        }
        this.storage.set("detallesRec",[]);
        this.storage.set("valorPagado",0.00);
        this.storage.set("clienteRec",cli);
        this.storage.set("documentos",this.documentos);
        this.storage.set("datosCabeceraRec",this.datosCabeceraRec);
        loader.dismiss();
      }).catch(errddo =>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener documentos de cliente ',errddo.message);
      });
    });
  }
  cambioCheck(doc){
    if(doc.todo === true){
      let ind = this.documentos.indexOf(doc);
      this.documentos[ind].acancelar = Math.round(this.documentos[ind].saldo*100)/100;
    }else{
      let ind = this.documentos.indexOf(doc);
      this.documentos[ind].acancelar = 0.0;
    }
    this.storage.set("documentos",this.documentos);
  }

  
 verDocumento(doc) {
   let profileModal = this.modalCtrl.create(DlgInfoDocumentoPage, { doc: doc });
   profileModal.present();
 }

  cambio(){
    this.storage.set("datosCabeceraRec",this.datosCabeceraRec);
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
