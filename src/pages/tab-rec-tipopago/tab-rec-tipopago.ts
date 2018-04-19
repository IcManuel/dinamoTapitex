import { Component } from '@angular/core';
import { NavController, NavParams,AlertController, ToastController} from 'ionic-angular';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { DatabaseProvider } from '../../providers/database/database';
import { LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-tab-rec-tipopago',
  templateUrl: 'tab-rec-tipopago.html',
})
export class TabRecTipopagoPage {
  total = 0.0;
  documentos = [];
  tiposPago=[];
  idTpa;
  tipoSelect;
  detallesRec=[];
  valorPagado=0.0;
  emisores = [];
  bancos = [];
  msjError ="";
  cliente ={id:-1};
  emisor = {
    valor:null,
    rend:false,
  }
  num_cuenta = {
    valor:null,
    rend:false
  }
  num_cheque  = {
    valor:null,
    rend:false
  }
  valor = 0.0;
  fecha_ven  = {
    valor:null,
    rend:false
  }
  num_doc  = {
    valor:null,
    rend:false
  }
  banco  = {
    valor:null,
    rend:false
  }
  num_comprobante  = {
    valor:null,
    rend:false
  }
  autorizacion  = {
    valor:null,
    rend:false
  }
  num_factura  = {
    valor:null,
    rend:false
  }
  fecha_ret  = {
    valor:null,
    rend:false
  }
  num_tarjeta = {
    valor:null,
    rend:false
  }
  constructor(public navCtrl: NavController, public navParams: NavParams, public alert: AlertController, 
              public alerta:AlertaProvider, public database:DatabaseProvider, public load: LoadingController,
              public storage: Storage, public toast:ToastController) {
      let loader = this.load.create({});
      loader.present().then(() =>{
        this.database.obtenerTiposPago().then(res =>{
          this.tiposPago = res;
          if(this.tiposPago.length>0){
            this.idTpa = this.tiposPago[0].id;
            this.tipoSelect = this.tiposPago[0];
            this.visualizarComponentes();
          }
          this.database.obtenerEmisores().then(resemi=>{
            if(resemi!==null){
              this.emisores = resemi;
              if(this.emisores.length>0){
                this.emisor.valor = this.emisores[0].id;
              }
            }
            this.database.obtenerBancos().then(resban=>{
              if(resban!==null){
                this.bancos = resban;
                if(this.bancos.length>0){
                  this.banco.valor = this.bancos[0]._id;
                }
                loader.dismiss();
              } 
            }).catch(errban=>{
              loader.dismiss();
              this.alerta.mostrarError('Error al obtener bancos',errban.message);
            });
          }).catch(erremi =>{
            loader.dismiss();
            this.alerta.mostrarError('Error al obtener emisores',erremi.message);
          });
        }).catch(err=>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener tipos de pago',err.message);
        });
      })
  }
  cambioTpa(){
    this.buscarTpa(this.idTpa).then(tpa =>{
      this.tipoSelect = tpa;
      this.idTpa = this.tipoSelect.id;
      this.visualizarComponentes();
    });
  }
  visualizarComponentes(){
     if(this.tipoSelect!==undefined)
     if(this.tipoSelect.id>0){
        this.encerarDatos();
        let contabiliza = this.tipoSelect.contabiliza;
        if(this.tipoSelect.retfuente === 1){
          this.num_comprobante.rend = true;
          this.autorizacion.rend = true;
          this.num_factura.rend =true;
          this.fecha_ven.rend = true;
          this.fecha_ret.rend = true;
        }
        if (contabiliza === 1 || contabiliza === 4) {
          if(this.tipoSelect.pidedetalle === 1){
            this.num_cuenta.rend = true;
            this.num_cheque.rend = true;
            this.emisor.rend = true;
          }
        }
        if(contabiliza ===2 ){
          this.num_doc.rend =true;
          this.num_tarjeta.rend =true;
          this.emisor.rend =true;
          this.fecha_ven.rend =true;  
        }
        if(contabiliza ===3){
          this.num_cuenta.rend = true;
          this.num_cheque.rend = true;
          this.emisor.rend = true;
          this.emisor.rend =true;
          this.fecha_ven.rend =true; 
        }
        if(contabiliza===5){
          this.num_doc.rend =true;
          this.banco.rend = true;
        }
       
      }else{
        this.encerarDatos();
      }
  }
  buscarTpa(id){
    return new Promise(resolve =>{
      for(var i = 0; i < this.tiposPago.length; i++){
        if(this.tiposPago[i].id === id){
          resolve(this.tiposPago[i]);
        }
      }
    });
  }
  ionViewDidEnter() {
    this.encerarDatos();
    this.total = 0.0;
    this.documentos = [];
    this.detallesRec=[];
    this.valorPagado=0.0;
    this.cliente ={id:-1};
    this.storage.get("documentos").then(res => {
      if(res !== null){
        this.documentos = res;
        for(var i = 0; i < this.documentos.length; i++){
          this.total+=this.documentos[i].acancelar;
          if(i === (this.documentos.length-1)){
            console.log('total-> ',this.total);
            
            this.valor = Math.round(this.total*100)/100;
            console.log('Valor-> ',this.valor);
            
            this.storage.set("valorAPagar",this.valor);
          }
        }
      }
      this.storage.get("detallesRec").then(rde =>{
        if(rde!==null){
          this.detallesRec = rde;
        }else{
          this.detallesRec = [];
        }
        this.storage.get("valorPagado").then(vpg =>{
          if(vpg!==null)
            this.valorPagado = vpg;
        });
        this.storage.get("clienteRec").then(clir =>{
          this.cliente = clir;
        }); 

        if(this.tiposPago.length>0){

            this.idTpa = this.tiposPago[0].id;
            this.tipoSelect = this.tiposPago[0];
            this.visualizarComponentes();
          }
      }).catch(edr=>{
        this.alerta.mostrarError('Error al obtener detalles',edr.message);
      });
    }).catch(err =>{
      this.alerta.mostrarError('Error al obtener documentos',err.message);
    });
  }
  agregarDetalle(){
    let correcto = true;
    let val = this.valor+"";
    if(val.trim().length>0){
      try{
        this.valor = Number(val);
        let sobra = Math.round((this.total-this.valorPagado)*100)/100;
        if(sobra >= this.valor){
          if(this.valor >0){
            this.guardarDetalle();
          }else{
            correcto = false;
            this.alerta.mostrarError('Error','El valor debe ser mayor que cero');
          }
        }else{
          correcto = false;
          this.alerta.mostrarError('Error','El monto en los tipos de pago es mayor al total a pagar')
        }
      }catch(e){
        correcto = false;
        this.alerta.mostrarError('Erorr', 'Debe ingresar un valor numérico');
      }
      this.valor = Number(val);
    }else{  
      correcto = false;
      this.alerta.mostrarError('Info','Se debe ingresar un valor');
    }
  } 
  guardarDetalle(){
    let loader = this.load.create({});
    loader.present().then(()=>{
      this.msjError ="";
      let detalleRec = {
        idrecibo:-1,
        idtpa:-1,
        valortotal:0.0,
        emisor:"",
        beneficiario:"",
        idcliente:-1,
        nrocheque:-1,
        nrocuenta:"",
        idbanco:-1,
        debcre:0,
        nrodocumento:"",
        concepto:"",
        fecha:new Date(),
        retnumcomproba:"",
        fechafactura:null,
        retnumfactura:"",
        retautorizacion:"",
        fechacaducidad:null,
        nombreTipo:"",
      }
      if(this.validarDatosGeneral() === true){
        if(this.tipoSelect.contabiliza===1 || this.tipoSelect.contabiliza===4){
          if(this.tipoSelect.pidedetalle ===1){
            detalleRec.nrocuenta=this.num_cuenta.valor;
            detalleRec.nrocheque=this.num_cheque.valor;
            detalleRec.emisor=this.emisor.valor+"";
          }
        }
        if(this.tipoSelect.contabiliza===2){
          detalleRec.nrodocumento=this.num_doc.valor;
          detalleRec.nrocuenta=this.num_cuenta.valor;
          detalleRec.emisor = this.emisor.valor;
          detalleRec.fechacaducidad=this.fecha_ven.valor;
        }
        if(this.tipoSelect.contabiliza===3){
          detalleRec.nrocuenta=this.num_cuenta.valor;
          detalleRec.nrocheque=this.num_cheque.valor;
          detalleRec.emisor=this.emisor.valor+"";
          detalleRec.fechacaducidad=this.fecha_ven.valor;
        }
        if(this.tipoSelect.contabiliza===5){
          detalleRec.nrodocumento=this.num_doc.valor;
          detalleRec.idbanco = this.banco.valor;
        }
        if(this.tipoSelect.retfuente ===1){
          detalleRec.retnumcomproba =this.num_comprobante.valor;
          detalleRec.retnumfactura=this.num_factura.valor;
          detalleRec.retautorizacion =this.autorizacion.valor;
          detalleRec.fechacaducidad=this.fecha_ven.valor;
          detalleRec.fechafactura=this.fecha_ret.valor;
        }
        detalleRec.debcre=2;
        detalleRec.valortotal=this.valor;
        detalleRec.idtpa=this.tipoSelect.id;
        detalleRec.idcliente=this.cliente.id;
        detalleRec.nombreTipo =this.tipoSelect.nombre;
        this.detallesRec.push(detalleRec);
        this.storage.set("detallesRec",this.detallesRec);
        this.valorPagado+=this.valor;
        this.storage.set("valorPagado",this.valorPagado);
        this.valor = this.total-this.valorPagado;
        this.valor = Math.round(this.valor*100)/100;
        this.visualizarComponentes();
        loader.dismiss();
        let toas = this.toast.create({
          duration:1500,
          position:'middle',
          message:"Pago agregado correctamente"
        });
        toas.present();
      }else{
        loader.dismiss();
        this.alerta.mostrarError('Error',this.msjError);
      }
    });
  }

  validarDatosGeneral(){
    let band = false;
    if(this.tipoSelect.contabiliza ===  1){
      if(this.tipoSelect.pidedetalle ===1){
        band = this.validarDatosChequeFecha();
      }else{
        band = true;
      }
    }
    if(this.tipoSelect.contabiliza ===2){
      band = this.validarDatosTarjeta();
    }
    if(this.tipoSelect.contabiliza ===3){
      band = this.validarDatosChequePostFechado();
    }
    if(this.tipoSelect.contabiliza ===5){
      band = this.validarDatosNotaDebito();
    }
    if(this.tipoSelect.contabiliza ===6){
      band = this.validarDatosChequeFecha();
    }
    if(this.tipoSelect.retfuente === 1){
      band = this.validarDatosRetencionFuente();
    }
    return band;
  }
  validarDatosRetencionFuente(){
    let bandera = true;
    if(this.autorizacion.valor === null || this.autorizacion.valor.trim().length<=0){
      bandera = false;
      this.msjError+="Requiere Autorización, ";
    }
    if(this.fecha_ven.valor === null || this.fecha_ven.valor.trim().length<=0){
      bandera = false;
      this.msjError+="Requiere fecha de vencimiento, ";
    }
    if(this.num_comprobante.valor === null || this.num_comprobante.valor.trim().length<=0){
      bandera = false;
      this.msjError+="Requiere #Comprobante, ";
    }
    if(this.num_factura.valor === null || this.num_factura.valor.trim().length<=0){
      bandera = false;
      this.msjError+="Requiere #Factura, ";
    }
    
    return bandera;
  }
  redondear(val){
    return Math.round(val * 100) / 100;
  }
  validarDatosTarjeta(){
    let bandera = true;
    if(this.emisor ===null || this.emisor.valor === null){
      bandera = false;
      this.msjError+="Requiere emisor, ";
    }
    if(this.num_cuenta.valor === null || this.num_cuenta.valor.trim().length<=0){
      bandera = false;
      this.msjError+="Requiere #Cuenta, ";
    }
    if(this.num_doc.valor === null || this.num_doc.valor.trim().length<=0){
      bandera = false;
      this.msjError+="Requiere #Documento, ";
    }
    return bandera;
  }
  validarDatosChequeFecha(){
    let bandera = true;
    if(this.emisor ===null || this.emisor.valor === null){
      bandera = false;
      this.msjError+="Requiere emisor, ";
    }
    if(this.num_cuenta.valor === null || this.num_cuenta.valor.trim().length<=0){
      bandera = false;
      this.msjError+="Requiere #Cuenta, ";
    }
    if(this.num_cheque.valor === null || this.num_cheque.valor.trim().length<=0){
      bandera = false;
      this.msjError+="Requiere #Cheque, ";
    }
    return bandera;
  }
  validarDatosChequePostFechado(){
    let bandera = true;
    if(this.emisor ===null || this.emisor.valor === null){
      bandera = false;
      this.msjError+="Requiere emisor, ";
    }
    if(this.num_cuenta.valor === null || this.num_cuenta.valor.trim().length<=0){
      bandera = false;
      this.msjError+="Requiere #Cuenta, ";
    }
    if(this.num_cheque.valor === null || this.num_cheque.valor.trim().length<=0){
      bandera = false;
      this.msjError+="Requiere #Cheque, ";
    }
    if(this.fecha_ven.valor === null || this.fecha_ven.valor.trim().length<=0){
      bandera = false;
      this.msjError+="Requiere fecha de vencimiento, ";
    }
    return bandera;
  }
  validarDatosNotaDebito(){
    let bandera = true;
    if(this.banco ===null || this.banco.valor === null){
      bandera = false;
      this.msjError+="Requiere banco, ";
    }
    if(this.num_doc.valor === null || this.num_doc.valor.trim().length<=0){
      bandera = false;
      this.msjError+="Requiere #Documento, ";
    }
    return bandera;
  }
  encerarDatos(){
    this.emisor = {
      valor:null,
      rend:false,
    }
    this.num_cuenta = {
      valor:null,
      rend:false
    }
    this.num_cheque  = {
      valor:null,
      rend:false
    }
    this.fecha_ven  = {
      valor:null,
      rend:false
    }
    this.num_doc  = {
      valor:null,
      rend:false
    }
    this.banco  = {
      valor:null,
      rend:false
    }
    this.num_comprobante  = {
      valor:null,
      rend:false
    }
    this.autorizacion  = {
      valor:null,
      rend:false
    }
    this.num_factura  = {
      valor:null,
      rend:false
    }
    this.fecha_ret  = {
      valor:null,
      rend:false
    }
    if(this.emisores.length>0){
      this.emisor.valor = this.emisores[0].id;
    }
    if(this.bancos.length>0){
      this.banco.valor = this.bancos[0]._id;
    }
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
