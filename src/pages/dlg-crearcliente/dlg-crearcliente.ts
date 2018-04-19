import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ViewController } from 'ionic-angular';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { DatabaseProvider } from '../../providers/database/database';
import { LoadingController } from 'ionic-angular';


@Component({
  selector: 'page-dlg-crearcliente',
  templateUrl: 'dlg-crearcliente.html',
})
export class DlgCrearclientePage {
  clienteNuevo ={
    identificacion:"",
    apellidos:"",
    nombres: "",
    nombreComercial:"",
    telefono:"",
    mail:"",
    direccion:"",
    fechaNacimiento:null,
    canal:-1,
    politica:-1,
    zona:-1,
    id:-1
  }
  politicas = [];
  canales = [];
  existe=false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public database : DatabaseProvider, 
              public alerta: AlertaProvider, public load: LoadingController, public alert: AlertController,
              public view: ViewController) {
    var fecha = new Date();
    fecha.setMonth(0);
    fecha.setFullYear(1990);
    fecha.setDate(1);
     this.existe=false;
    this.clienteNuevo ={
      identificacion:"",
      apellidos:"",
      nombres: "",
      nombreComercial:"",
      telefono:"",
      mail:"",
      direccion:"",
      fechaNacimiento:null,
      canal:-1,
      politica:-1,
      zona:-1,
      id:-1
    }
    this.clienteNuevo.zona = navParams.data.zona;
    let loader =this.load.create({
        content:'Procesando...'
      });
    loader.present().then(() =>{
      this.database.getDatabaseState().subscribe(rdy =>{
        if(rdy){
          this.database.obtenerPoliticas().then(pol =>{
            this.politicas = pol;
            if(this.politicas.length>0){
              this.clienteNuevo.politica = this.politicas[0].id;
            }
            this.database.obtenerCanales().then(das =>{
              this.canales = das;
              if(this.canales.length>0){
                this.clienteNuevo.canal = this.canales[0].id;
              }
               this.database.obtenerIdCliente().then(idr =>{
                let idfi;
                idfi = idr;
                this.clienteNuevo.id = idfi;
                loader.dismiss();
              }).catch(errcli =>{
                loader.dismiss();
              });
            }).catch(ecan =>{
              loader.dismiss();
              this.alerta.mostrarError('Error al obtener canales',ecan.message);
            })
          }).catch(epol =>{
            loader.dismiss();
            this.alerta.mostrarError('Error',epol.message);
          });
        }
      });
    });
  }
  buscarPorId(){
    this.database.obtenerClienteNuevoPorIdentificacion(this.clienteNuevo.identificacion).then(cn =>{
      let res;
      res = cn;
      console.log('Que obtengo -> ',cn);
      if(res.id !== null){
        this.clienteNuevo = res;
         this.existe=true;
      }else{
         this.existe=false;
      }
    }).catch(ercn =>{
      this.alerta.mostrarError('Error al obtener cliente',ercn.message);
    })
  }
  guardar(){
    if(this.clienteNuevo.identificacion !==null && this.clienteNuevo.identificacion.trim().length>0){
      if(this.clienteNuevo.apellidos.trim().length>0 || this.clienteNuevo.nombres.trim().length>0){
        if(this.clienteNuevo.telefono!==null && this.clienteNuevo.telefono.trim().length>0){
          if(this.clienteNuevo.mail !==null && this.clienteNuevo.mail.trim().length>0){
            if(this.clienteNuevo.direccion !==null && this.clienteNuevo.direccion.trim().length>0){
              let loader = this.load.create({
                content:"Guardando..."
              });
              loader.present().then(()=>{                
                let cerrar = {
                  cerrar: false,
                  clienteNuevo:this.clienteNuevo
                }
                if(!this.existe){
                  this.database.insertarClienteNuevo(this.clienteNuevo).then(res=>{
                    loader.dismiss();
                    this.view.dismiss(cerrar);
                  }).catch(errclis=>{
                    loader.dismiss();
                    this.alerta.mostrarError('Error al guardar',errclis.message);
                  })
                }else{
                  loader.dismiss();
                  this.view.dismiss(cerrar);
                }
              });
            }else{
              this.alerta.mostrarError('Error','Debe ingresar una dirección');
            }
          }else{
            this.alerta.mostrarError('Error','Debe ingresar un email');
          }
        }else{
          this.alerta.mostrarError('Error','Debe ingresar un teléfono');
        }
      }else{
        this.alerta.mostrarError('Error','Debe ingresar nombres o apellidos');
      }
    }else{
      this.alerta.mostrarError('Error','Debe ingresar la identificación');
    }
  }
  cerrar(){
    let cerrar = {
      cerrar: true
    }
    this.view.dismiss(cerrar);
  }
}
