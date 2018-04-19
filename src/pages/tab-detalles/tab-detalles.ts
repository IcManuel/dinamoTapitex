import { Component,ViewChild } from '@angular/core';
import { NavController, NavParams,AlertController,ToastController,Platform,App } from 'ionic-angular';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { DatabaseProvider } from '../../providers/database/database';
import { LoadingController } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-tab-detalles',
  templateUrl: 'tab-detalles.html',
})
export class TabDetallesPage {
  @ViewChild('intCantidad') inputCantidad ;
  codigoFiltro ="";
  nombreFiltro="";
  productos = [];
  imagenes=[];
  saldo=0.0;
  preventas=[];
  mostrarLista =false;
  showMe = "inline";
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
    precioIva:0.0
  }
  uac:any;
  parIva:any;
  parRepetido:any;
  parItems:any;
  cliente:any;
  unidades=[];
  total=0.0;
  descuento=0.0;
  cantidad = null;
  bodegas = [];
  bodega = -1;
  disabled=true;
  precioProducto:any=0.0;
  listaDetalles = [];
  zona;
  productosAux= [];
  pos = 10;
  preventaSelect = -1;
  numitem = 10;
  constructor(public toastCtrl: ToastController,public storage:Storage, public keyboard: Keyboard,
              public navCtrl: NavController, public navParams: NavParams, public alert: AlertController, 
              public alerta: AlertaProvider, public database : DatabaseProvider, public load: LoadingController,
              public platform:Platform, public appCtrl: App) {
    let loader = load.create({
      content:"Cargando.."
    });
    loader.present().then(() =>{
      this.uac = navParams.data.uac;
      //this.cliente = navParams.data.cliente;
      this.zona = navParams.data.zona;
      this.database.getDatabaseState().subscribe(rdy =>{
        if(rdy){
            this.numitem = parseInt(((platform.height()-200)/40)+"",10);
            this.database.obtenerParametros().then(data =>{
                this.parIva = data[3];
                this.parRepetido =  data[4];
                this.parItems = data[2];
                this.storage.get("detalles").then(detalles =>{
                  if(detalles !== null){
                    this.listaDetalles = detalles;
                  }else{
                    this.listaDetalles = [];
                  }
                  this.storage.get('cliente').then(res=>{
                      let cli;
                      cli =res;
                      this.cliente = cli;
                      this.pos = this.numitem;          
                      this.database.obtenerProductos(this.nombreFiltro).then(res =>{
                          this.mostrarLista = true;
                          this.showMe = "inline";
                        this.productosAux = res;
                        for(let xd = this.pos-this.numitem; xd<this.pos;xd++ ){
                          this.productos.push(this.productosAux[xd]);
                        }
                        loader.dismiss();
                      }).catch(error=>{
                        loader.dismiss();
                        this.alerta.mostrarError('Error',error);
                      });                        
                    }).catch(errc =>{
                      loader.dismiss();
                      this.alerta.mostrarError('Error al obtener cliente',errc.message);
                    });
                }).catch(error =>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error al obtener detalles guardados',error);
                });
              
            }).catch(error =>{
              loader.dismiss();
              this.alerta.mostrarError('Error',error);
            });
          }
        });
    });
    
  }
  doInfinite(): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if(this.productos.length<this.productosAux.length){
          let res = (this.productosAux.length-this.productos.length);
          if(res>=this.numitem){
            this.pos+=this.numitem; 
            for(let xd = this.pos-this.numitem; xd<this.pos;xd++ ){
              this.productos.push(this.productosAux[xd]);
            }
            resolve();
          }else{
            this.pos+=res;
            for(let xd = this.pos-res; xd<this.pos;xd++ ){
              this.productos.push(this.productosAux[xd]);
            }
            resolve();
          }
        }else{
          resolve();
        }
      }, 500);
    })
  }
  doYourStuff()
  { 
    console.log('Entra acaá?');
      if(this.mostrarLista === true){
        this.appCtrl.getRootNav().pop(); // remember to put this to add the back button behavior
      }else{
        this.mostrarLista = true;
      }
    }
  busqueda(){
     this.mostrarLista = true;
     this.showMe = "inline";
    this.pos = this.numitem;
     this.productos = [];          
    this.database.obtenerProductos(this.nombreFiltro).then(res =>{
      this.mostrarLista = true;
      this.showMe = "inline";
      this.productosAux = res;
      if(this.productosAux.length > this.numitem){
        for(let xd = this.pos-this.numitem; xd<this.pos;xd++ ){
          this.productos.push(this.productosAux[xd]);
        }
      }else{
        for(let xd = 0; xd<this.productosAux.length;xd++ ){
          this.productos.push(this.productosAux[xd]);
        }
      }
    }).catch(error=>{
      this.alerta.mostrarError('Error',error);
    });     
  }
  ionViewDidEnter() {
    this.storage.get("detalles").then(det => {
      if(det !==null ){
        this.listaDetalles = det;
      }else{
        this.listaDetalles = [];
      }   
    }).catch(erro =>{
      this.alerta.mostrarError('Error al obtener detalles',erro.message);
    });
  }
  agregarDetalle(){    
    if(this.bodega !== null && this.bodega !== -1){
      if(this.producto.umedida !==null && this.producto.umedida !== -1){
        if(this.cantidad!==null){
          var cant:string;
          cant = this.cantidad.toString();
          if(cant.trim().length>0){
            if(this.parRepetido.valor.toUpperCase() === "FALSE"){
              let existe = false;
              for(var i = 0; i < this.listaDetalles.length;i++){
                if(this.producto.id === this.listaDetalles[i].idProducto){
                  existe = true;
                }
              }
              if(!existe){
                this.guardarDetalle();
              }else{
                this.alerta.mostrarError('Error','El producto ya se encuentra ingresado');
              }
            }else{
              this.guardarDetalle();
            }
          }else{
            this.alerta.mostrarError('Error','Debe ingresar una cantidad');
          }
        }else{
          this.alerta.mostrarError('Error','Debe ingresar una cantidad');
        }
      }else{
        this.alerta.mostrarError('Error','No posee unidad de medida');
      }
    }else{
      this.alerta.mostrarError('Error','No se ha ingresado bodega');
    }
    
  }
  guardarDetalle(){
    if(this.listaDetalles.length<Number(this.parItems.valor)){
      this.database.obtenerUnidad(this.producto.umedida).then(res=>{
        this.database.obtenerBodegaPorId(this.bodega).then(resbod => {
            var uni;
            var bod;
          uni = res;
          bod = resbod;
          let cant = Number(this.cantidad);
          let iva = (this.producto.precioIva - this.producto.precio)*cant
          let total = this.total-iva;
          let detalle = {
            idProducto : this.producto.id,
            cantidad: cant,
            descuento:this.descuento,
            nombreProducto:this.producto.nombre,
            precio:this.producto.precio,
            promocion :0.0,
            cpedido:-1,
            unidad:this.producto.umedida,
            bodega:this.bodega,
            total:this.total,
            subtotal : total,
            iva:iva,
            nombreUnidad: uni.nombre,
            nombreBodega: bod.nombre,
            cordcom:this.preventaSelect
        }
        let toast = this.toastCtrl.create({
          message: 'Producto agregado correctamente',
          duration: 1000,
          position: 'middle'
        });
        toast.present();
        this.listaDetalles.push(detalle);
          this.storage.set('detalles',null);
          this.storage.set('detalles',this.listaDetalles); 
          this.nombreFiltro ="";
          this.codigoFiltro="";
          //this.busqueda();
          this.mostrarLista = true;
          this.showMe = "inline";
          console.log('Productos----> ', this.productos.length);
          this.disabled =true;
          this.preventaSelect=-1;
          this.preventas=[];
          this.preventas.push({nombre:"PREDETERMINADA",id:-1});
        }).catch(errorbod => {
          this.alerta.mostrarError('Error al obtener nombre bodega',errorbod)
        })
      }).catch(erroun =>{
        this.alerta.mostrarError('Error al obtener unidad',erroun);
      })
    }else{
      this.alerta.mostrarError('Info','Solo se pueden agregar hasta '+this.parItems.valor+" ítems");
    }
  }

  cambioPreventa(){
    if(this.preventaSelect !== -1){
      this.database.obtenerSaldoPreventa(this.producto.id,this.preventaSelect).then(res =>{
        let rr;
         rr =res;
        this.producto.stock = rr;
      }).catch(ee =>{
        this.alerta.mostrarError('Error al obtener saldo ',ee.message);
      })
    }else{
      this.producto.stock = this.saldo;
    }
  }
  mostrarElegido(producto){
    let loader = this.load.create({
      content:"Cargando"
    });
    loader.present().then(()=>{
      this.disabled =false;
      this.total=0.0;
      this.descuento = 0.0;
      this.mostrarLista=false;
      this.showMe = "none";
      this.producto = producto;
      this.cantidad = null;
      var fA = new Date();
      var anio = fA.getFullYear();
      var mes = fA.getMonth()+1;
      this.preventaSelect=-1;
      this.preventas=[];
      this.preventas.push({nombre:"PREDETERMINADA",id:-1});
      this.database.obtenerpreventasPorProducto(this.producto.id).then(rp => {
        let da;
        da =rp;
        if(da.length >0){
          this.preventas = da;
        }
      }).catch(err=>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener detalles preventas',err);
      });
      this.database.obtenerCantidadProducto(producto.id).then(cant=>{
        let cantidad = cant;
        this.database.obtenerSaldo(producto.id,anio,mes,this.uac.empleado).then(saldo =>{
          let stock = 0;
          if(Number(saldo) < Number(cantidad)){
            stock = 0;
          }else{
            stock = Number(saldo) - Number(cantidad);
          }
          this.producto.stock = stock;
          this.saldo = stock;
          this.database.obtenerPrecio(this.cliente.listaPrecios,producto.id).then(precio => {
            this.precioProducto = precio;
            producto.precio = precio;
            if(producto.impuesto ===1){
              producto.precioIva = producto.precio * (1 + (Number(this.parIva.valor)/100));
            }else{
              producto.precioIva =producto.precio;
            }
            this.database.obtenerFactores(this.producto.id).then(res=>{
              this.unidades = res;
              this.database.obtenerBodega().then(bode =>{
                this.bodegas = bode;
                if(this.bodegas.length>0){
                  this.bodega = this.bodegas[0].id;
                }
                setTimeout(() => {
                      this.inputCantidad.setFocus();
                      this.keyboard.show();
                  },150);
                  loader.dismiss();
              }).catch(errbod => {
                loader.dismiss();
                this.alerta.mostrarError('Error al obtener bodegas',errbod);
              });
            }).catch(errorunid =>{
              loader.dismiss();
              this.alerta.mostrarError('Error al obtener factores',errorunid);
            });
          }).catch(errprecio=>{
            loader.dismiss();
            this.alerta.mostrarError('Error al obtener el precio',errprecio);
          });
        }).catch(errsal =>{
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener stock',errsal);
        });
      }).catch(err =>{
        loader.dismiss();
        this.alerta.mostrarError('Error al obtener la cantidad',err);
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
      precioAntes = Number(this.precioProducto);
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
        let sub = this.cantidad*this.producto.precioIva;
        this.total = sub - (sub*desc);
      }else{
        this.total = 0.0;
      }
    }else{
      this.total=0.0;
    }
  }
  buscarPorCodigo(){    
    let loader = this.load.create({
      content:"Cargando..."
    });
    loader.present().then(()=>{
      this.mostrarLista = true;
      this.showMe = "inline";
      this.productos = [];
      if(this.codigoFiltro !==null && this.codigoFiltro.trim().length>0){
        this.database.obtenerProductoPorCodigo(this.codigoFiltro).then(res =>{
          var pro;
          pro = res;
          if(pro.id !==null){
            loader.dismiss();
            this.productos.push(res);
          }else{
            loader.dismiss();
            this.alerta.mostrarError('Info','No existe producto con ese código');
            this.mostrarLista=false;
          }
        }).catch(error=>{
          loader.dismiss();
          this.alerta.mostrarError('Error',error);
        });
      }else{
        loader.dismiss();
        this.alerta.mostrarError('Info','No se ha ingresado ningún código');
        this.mostrarLista=false;
      }
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
}
