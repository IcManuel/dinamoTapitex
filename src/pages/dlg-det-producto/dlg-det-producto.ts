import { Component } from '@angular/core';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { NavController, NavParams,ViewController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { LoadingController } from 'ionic-angular';


@Component({
  selector: 'page-dlg-det-producto',
  templateUrl: 'dlg-det-producto.html',
})
export class DlgDetProductoPage {
  cantidad = 0;
  descuento = 0;
  catalogo = false;
  total = 0;
  bodegas = [];
  bodega = -1;
  observaciones ="";
  productos=[];
  imagenes = [];
  modelosProducto =[];
  indz = -1;
  parIva = {
    valor:12
  }
  unidades = [];
  producto = {
    id: -1,
    nombre: "S/N",
    umedida:-1,
    stock:0.0,
    promocion:0.0,
    idTipo:-1,
    impuesto: 0,
    codigo: "",
    precio :0.0,
    precioIva:0.0,
    ext:"",
    imagen:"",
    nuevo:false,
    cantidad:0,
    color:'transparent',
    total:0.00,
    ti:false,
    fichatecnica:'',
    cantminima:1
  }
  precio=0;
  precioIva=0
  constructor(public navCtrl: NavController, public navParams: NavParams, public alerta: AlertaProvider,
              public database :DatabaseProvider, public load: LoadingController, public view: ViewController) {
    this.producto = this.navParams.data.producto;
    this.parIva = this.navParams.data.parIva;
    this.bodega = this.navParams.data.bodega;
    this.bodegas = this.navParams.data.bodegas;
    this.precio = this.producto.precio;
    this.precioIva = this.producto.precioIva;
    this.productos = this.navParams.data.productos;
    this.catalogo = this.navParams.data.catalogo;
    this.indz =  this.productos.map(function(e) { return e.id; }).indexOf(this.producto.id);
    this.mostrarElegido(this.producto);
  }
  ionViewDidLoad(){
   
  }
  doYourStuff(){
    let cerrar = {
      cerrar: true

    }
    this.view.dismiss(cerrar);
  }
  agregarDetalle2(){
    this.producto = this.productos[this.indz];
    let loader = this.load.create({content:"Guardando.. "});
    loader.present().then(()=>{
      if(this.bodega !== null && this.bodega !== -1){
        if(this.producto.umedida !==null && this.producto.umedida !== -1){
          if(this.cantidad!==null){
            var cant:string;
            cant = this.cantidad.toString();
            if(cant.trim().length>0){
              if(this.cantidad>0){
                if(this.producto.cantminima===null  || this.producto.cantminima===undefined || this.producto.cantminima===0){
                  this.producto.cantminima=1;
                }
                let residuo = this.cantidad%this.producto.cantminima;
                if(residuo === 0){  
                  let datos = {
                    cerrar: false,
                    producto : this.producto,
                    cantidad : this.cantidad,
                    bodega :this.bodega
                  }
                  loader.dismiss();
                  this.view.dismiss(datos);
                }
                else{
                  loader.dismiss();
                  this.alerta.mostrarError('Error','La cantidad mínima del producto es: '+this.producto.cantminima);
                }
              }else{
                loader.dismiss();
                this.alerta.mostrarError('Error','Debe ingresar una cantidad mayor que cero');
              }
            }else{
              loader.dismiss();
              this.alerta.mostrarError('Error','Debe ingresar una cantidad');
            }
          }else{
            loader.dismiss();
            this.alerta.mostrarError('Error','Debe ingresar una cantidad');
          }
        }else{
          loader.dismiss();
          this.alerta.mostrarError('Error','No posee unidad de medida');
        }
      }else{
        loader.dismiss();
        this.alerta.mostrarError('Error','No se ha ingresado bodega');
      }
    });    
  }
  mostrarElegido(producto){
      let loader = this.load.create({
        content:"Cargando..."
      });
      loader.present().then(()=>{
        //this.producto = producto;
        this.modelosProducto = [];
        var fA = new Date();
        var anio = fA.getFullYear();
        var mes = fA.getMonth()+1;
        this.database.obtenerModelosProducto(producto.id).then(res =>{
          this.modelosProducto = res;
          for(let jxc = 0; jxc < this.modelosProducto.length; jxc++){
            this.modelosProducto[jxc].mostrar = 'data:image/jpeg;base64,'+this.modelosProducto[jxc].img;
          }
        }).catch(er =>{ 
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener imágenes de modelo',er.message);
        })
        console.log('P ',this.producto);
        this.database.obtenerFactores(this.producto.id).then(res=>{
          this.unidades = res; 
          this.cantidad = this.producto.cantidad;      
          this.total = Math.round(this.producto.precioIva*100)/100 * this.producto.cantidad;  
          this.database.obtenerImagenesPorProducto(this.producto.id).then(rimg =>{
            this.imagenes = [];
            let dds;
            dds = rimg;
            if(dds.length>0){
              for(let c = 0; c < dds.length; c++){
                let dd = dds[c];
                if(dd.img !==null && dd.img !== undefined){
                  dd.mostrar = 'data:image/jpeg;base64,'+dd.img;
                }else{
                  dd.mostrar = 'assets/images/no_image.png'
                }
                this.imagenes.push(dd);
                if(c ===(dds.length-1) ){
                  loader.dismiss();
                }
              }
            }else{
              let dd = {
                imagen : 'no_imagen.png',
                ext :'png',
                mostrar :'assets/images/no_image.png'
              };
              this.imagenes.push(dd);
              loader.dismiss();         
            }
          }).catch(erim =>{
            loader.dismiss();
            this.alerta.mostrarError('Error al obtener imágenes',erim.message);
          });  
        }).catch(errorunid =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener factores',errorunid);
        });
      });
  }
  calcularTotal(){
    this.database.obtenerFactorPorUnidad(this.producto.umedida,this.producto.id).then(res =>{
      let factor;
      let precioAntes;
      let precioActual;
      let algo;
      algo = res;
      factor = Number(algo.factor);
      precioAntes = Number(this.producto.precioIva);
      precioActual = precioAntes*factor;
      this.producto.precio = precioActual;
      if(this.producto.impuesto ===1){
        this.producto.precioIva = this.producto.precio * (1 + (Number(this.parIva.valor)/100));
      }else{
        this.producto.precioIva =this.producto.precio;
      }
      this.ingresoCantidad();
    }).catch(error =>{
      this.alerta.mostrarError('Error al obtener factor por unidad',error);
    })
  }
  ingresoCantidad(){  
    let desc = 0.0;
    this.total = 0.0;
    if(this.descuento !==null && this.descuento>0){
      desc = this.descuento/100;
    }
    if(this.cantidad !== null){
      if(this.cantidad>=1){
        if(this.producto.stock!==0){
          if(this.cantidad<=this.producto.stock){
            let sub = this.cantidad*Math.round(this.producto.precioIva*100)/100;
            this.total = sub - (sub*desc);
          }else{
            let sub = this.producto.stock*Math.round(this.producto.precioIva*100)/100;
            this.total = sub - (sub*desc);
          }
        }else{
          this.total = 0;
        }
      }else{
        this.total = 0.0;
      }
    }else{
      this.total=0.0;
    }
  }
  clickCantidad(){
    if(this.producto.cantidad === undefined || this.producto.cantidad ===null || this.producto.cantidad<=0){
      this.cantidad = null;
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
