import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams,Tabs } from 'ionic-angular';
import { TabClientePage } from '../tab-cliente/tab-cliente';
import { TabDetallesPage } from '../tab-detalles/tab-detalles';
import { TabDetallesCatalogoPage } from '../tab-detalles-catalogo/tab-detalles-catalogo';
import { TabResumenPage } from '../tab-resumen/tab-resumen';
import { DatabaseProvider } from '../../providers/database/database';

@Component({
  selector: 'page-pedido',
  templateUrl: 'pedido.html',
})
export class PedidoPage {
  @ViewChild('myTabs') tabRef: Tabs;
  tabCliente = TabClientePage;
  tabDetalles = TabDetallesPage;
  tabResumen = TabResumenPage;
  tabCatalogo = TabDetallesCatalogoPage;
  params={};
  parametros=[];
  parCatalogo = false;
  indice = 0;
  constructor(public navCtrl: NavController, public navParams: NavParams,public databaseProvider: DatabaseProvider) {
    
    this.params = {
      cliente: this.navParams.get("cliente"),
      todos : this.navParams.get("tod"),
      uac:this.navParams.get("uac"),
      zona: this.navParams.get("zona")
    }
    this.databaseProvider.getDatabaseState().subscribe(rdy =>{
      if(rdy){
        
      }
    });
    
  }
  ionViewDidEnter(){
    this.databaseProvider.obtenerParametros().then(data =>{
      this.parametros = data;
      if(data[12].valor === "TRUE"){
        this.parCatalogo = false;
        //this.indice = 1;
      }else{
       // this.indice = 0;
        this.parCatalogo = true;
      }
      console.log('ACCC ',this.parCatalogo);
      
    });
  }
}
