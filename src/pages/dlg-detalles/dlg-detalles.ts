import { Component  } from '@angular/core';
import { NavController, NavParams,AlertController,ToastController,Content, ModalController,ViewController,App } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { DatabaseProvider } from '../../providers/database/database';

@Component({
  selector: 'page-dlg-detalles',
  templateUrl: 'dlg-detalles.html',
})
export class DlgDetallesPage {
  detalles = [];
  cabecera = {
    id:0,
    nombre:'',
    identificacion:'',
    subtotal:0,
    iva:0,
    subNeto:0,
    total:0,
    descuento:0,
    observaciones:''
  } ;
  constructor(public navCtrl: NavController, public navParams: NavParams, public database: DatabaseProvider, 
              public modalCtrl: ModalController, public load: LoadingController, public view: ViewController) {
    let loader = load.create(
      {
        content:"Cargando...",
      });
    loader.present().then(()=>{
      this.database.obtenerPedido(navParams.data.idPedido).then(res =>{
        let dd;
        dd =res;
        this.cabecera = dd;
        if(this.cabecera!==null){
          this.database.obtenerDetallesPedido2(this.cabecera.id, navParams.data.impuesto.valor).then(det =>{
            let dd;
            dd = det;
            this.detalles = dd;
            loader.dismiss();
          }).catch(ed=>{
            loader.dismiss();
            console.log('Error ',ed.message);
          })  
        }else{
          loader.dismiss();
          console.log('No hay cabecera');
          
        }
      }).catch(err=>{
        loader.dismiss(); 
        console.log('Error ',err.message);
      });
    })
  }
  cerrar(){
    this.view.dismiss();
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
  darFormatoFecha(fecha){
    if(fecha!==null){
      var datestring = ("0" + fecha.getDate()).slice(-2) + "-" + ("0"+(fecha.getMonth()+1)).slice(-2) + "-" +fecha.getFullYear()+" "+("0" + fecha.getHours()).slice(-2)+":"+("0" + fecha.getMinutes()).slice(-2) +":"+("0" + fecha.getSeconds()).slice(-2) ;
      return datestring;
    }else{
      return "";
    }
}
}
