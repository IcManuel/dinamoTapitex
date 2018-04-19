import { Component } from '@angular/core';
import { NavController, NavParams,AlertController, ToastController} from 'ionic-angular';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { DatabaseProvider } from '../../providers/database/database';
import { LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-tab-rec-resumen',
  templateUrl: 'tab-rec-resumen.html',
})
export class TabRecResumenPage {
  datosCabeceraRec={
    observaciones:""
  };
  detalles=[];
  total = 0.0;
  uac;
  coordenadas={
    latitud:0.0,
    longitud:0.0
  };
  documentos = [];
  valorAPAgar = 0.0;
  cliente = { id:null};
  constructor(public navCtrl: NavController, public navParams: NavParams, public alert: AlertController, 
              public alerta:AlertaProvider, public database:DatabaseProvider, public load: LoadingController,
              public storage: Storage, public toast:ToastController,public diagnostic:Diagnostic, public geolocation: Geolocation) {
    this.uac = this.navParams.data.uac;
  }

  ionViewDidEnter(){
    this.storage.get("datosCabeceraRec").then(res =>{
      if(res !==null){
           this.datosCabeceraRec={
            observaciones:""
          };
      }else{
        this.datosCabeceraRec  = res;
      }
      this.storage.get("detallesRec").then(dr =>{
        if(dr !==null){
          this.detalles = dr;
        }else{
          this.detalles = [];
        }
        console.log('Detalles... ',this.detalles);
        
        this.storage.get("valorPagado").then(vp =>{
          if(vp!==null){
            this.total = vp;
          }else{
            this.total = 0.0;
          }
        });
        this.storage.get("documentos").then(dc =>{
          if(dc!==null){
            this.documentos=dc;
            this.storage.get("valorAPagar").then(vv =>{
              if(vv!==null){
                this.valorAPAgar = vv;
              }else{
                this.valorAPAgar =0.00;
              }
            });
          }else{
            this.documentos=[];
          }
        })
      }); 
    })
  }
  eliminarRecibo(){
    this.storage.set("detallesRec",[]);
    this.storage.set("valorPagado",0.00);
    this.storage.set("clienteRec",null);
    this.storage.set("datosCabeceraRec",null);
    this.storage.set("documentos",null);
    this.storage.set("valorAPagar",0.00);
    this.navCtrl.parent.select(0);
  }
  guardarTodo(){
    let loader = this.load.create({
      content:"Guardando..."
    });
    loader.present().then(()=>{
      this.diagnostic.getLocationAuthorizationStatus().then(res=>{
      if(res==="GRANTED"){  
        this.diagnostic.isLocationAvailable().then(resa =>{
          if(resa===true){
            this.obtenerPosicion().then(coord =>{
              let c;
              c = coord;
              this.coordenadas = c;
              this.storage.get("clienteRec").then(clires =>{
              this.cliente = clires;
                if(this.cliente !==null && this.cliente.id !==null){
                  if(this.detalles.length>0){
                    if(this.total === this.valorAPAgar){
                      this.guardar(loader);
                    }else{
                      loader.dismiss();
                      this.alerta.mostrarError('Error','El total ingresado en los tipos de pago no es igual al valor a pagar');
                    }
                  }else{
                    loader.dismiss();
                    this.alerta.mostrarError('Error','Debe ingresar formas de pago');
                  }
                }else{
                  loader.dismiss();
                  this.alerta.mostrarError('Error','Debe escoger un cliente');
                }
              }).catch(errcli =>{
                loader.dismiss();
                this.alerta.mostrarError('Error al obtener información del cliente',errcli.message);
              });
            }).catch(errcor =>{
              loader.dismiss();
              this.alerta.mostrarError('Error al obtener posición',errcor.message);
            });
          }else{
              loader.dismiss();
              let pr = this.alert.create({
                subTitle: 'El GPS no se encuentra activo, por favor, activarlo',
                enableBackdropDismiss : false,
                buttons: [
                  {
                    text:'Activar',
                    handler: data => {
                      this.diagnostic.switchToLocationSettings();
                    }
                  }
                ]
              });
              pr.present();
            }
          }).catch(erd =>{
            loader.dismiss();
            this.alerta.mostrarError('Error al obtener diagnóstico de si el GPS está habilitado o no',erd);
          });
        }else{
          loader.dismiss();
          this.alerta.mostrarError('Error','La aplicación no tiene permisos para acceder a ubicación, por favor, ir a configuraciones');
        }
      }).catch(err=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener status de permiso',err);
      }); 
    });
  }
  guardar(loader){
    this.database.obtenerIdUltimoRecibo().then(rid =>{
      let fechaA = new Date();
      let fStr = this.darFormatoFecha(fechaA);
      let recibo = {
        idRecibo:rid,
        fecha:fStr,
        concepto:this.datosCabeceraRec.observaciones,
        idcliente:this.cliente.id,
        idempleado:this.uac.empleado,
        total:this.total,
        coordx:this.coordenadas.latitud,
        coordy:this.coordenadas.longitud,
        estado:2,
        sincronizado:0
      }
      this.database.insertarCrecibo(recibo).then(ria =>{
        for(var i = 0; i < this.detalles.length; i++){
          this.detalles[i].idrecibo = recibo.idRecibo;
          this.database.insertarDrecibo(this.detalles[i]).then();
        }
        for(var j = 0; j < this.documentos.length;j++){
          
          let dcancela = {
            iddocumento:this.documentos[j].id,
            idrecibo: recibo.idRecibo,
            valor:this.documentos[j].acancelar,
            debcre:1
          }
          if(dcancela.valor>0){
            this.database.insertarDcancelacion(dcancela);
            this.documentos[j].saldo = this.documentos[j].saldo - this.documentos[j].acancelar;
            this.documentos[j].acancelar = 0.00;
            this.database.actualizarSaldoDdo(this.documentos[j]);
          }
        }
        let tt = this.toast.create({
          duration:1500,
          message:"Recibo guardado correctamente",
          position:"middle"
        });
        tt.present();
        this.storage.set("detallesRec",[]);
        this.storage.set("valorPagado",0.00);
        this.storage.set("clienteRec",null);
        this.storage.set("datosCabeceraRec",null);
        this.storage.set("documentos",null);
        this.storage.set("valorAPagar",0.00);
        loader.dismiss();
        this.navCtrl.parent.select(0);
      }).catch(ercs =>{
        loader.dismiss();
        this.alerta.mostrarError('Error al insertar recibo ',ercs.message);
      });

    }).catch(erd => {
      loader.dismiss();
      this.alerta.mostrarError('Error al obtener id',erd.message);
    })
  }
   darFormatoFecha(fecha){
      if(fecha!==null){
        var datestring = ("0" + fecha.getDate()).slice(-2) + "-" + ("0"+(fecha.getMonth()+1)).slice(-2) + "-" +fecha.getFullYear()+" "+("0" + fecha.getHours()).slice(-2)+":"+("0" + fecha.getMinutes()).slice(-2) +":"+("0" + fecha.getSeconds()).slice(-2) ;
        return datestring;
      }else{
        return "";
      }
  }
  obtenerPosicion(){
    return new Promise ((resolve, reject) =>{
      this.geolocation.getCurrentPosition({
        enableHighAccuracy:true
      }).then((resp) => {
          this.coordenadas.latitud = resp.coords.latitude;
          this.coordenadas.longitud = resp.coords.longitude;
          this.storage.set('latitud',resp.coords.latitude);
          this.storage.set('longitud',resp.coords.longitude);
          resolve(this.coordenadas);
        }).catch((error) => {
          reject(error);
        });
    }); 
  }
  eliminarDetalle(det){
    let ind = this.detalles.indexOf(det);
    this.detalles.splice(ind,1);
    this.total = this.total-det.valortotal;
    this.total = Math.round(this.total*100)/100;
    this.storage.set("detallesRec",this.detalles);
    this.storage.set("valorPagado",this.total);
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
