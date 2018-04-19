import { Component,ViewChild,ElementRef, Input  } from '@angular/core';
import { NavController, NavParams,AlertController,ToastController,Content, ModalController,ViewController,App } from 'ionic-angular';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { DatabaseProvider } from '../../providers/database/database';
import { LoadingController } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';
import { DlgFiltroPage } from '../dlg-filtro/dlg-filtro';
import { DlgDetProductoPage } from '../dlg-det-producto/dlg-det-producto';
import { ListaClientesPage } from '../lista-clientes/lista-clientes';
import { SubirPedidosPage} from '../subir-pedidos/subir-pedidos';
import { VirtualScroll } from 'ionic-angular';


@Component({
  selector: 'page-tab-detalles-catalogo',
  templateUrl: 'tab-detalles-catalogo.html',
})
export class TabDetallesCatalogoPage {

   @ViewChild('intCantidad') inputCantidad ;
   @ViewChild(Content) content: Content;
   @ViewChild('intCard') inputCard: ElementRef;
   @ViewChild('mycontent') cc: ElementRef;
   @Input("header") header:HTMLElement;
   @ViewChild('virtualScroll', { read: VirtualScroll }) virtualScroll: VirtualScroll;
  
  estaCargando=false;
  clasificacionSelect=-1; 
  clasificaciones = [];
  marcaSelect = -1;
  marcas = [];
  modeloSelect = -1;
  modelos = [];
  codigoFiltro ="";
  nombreFiltro="";
  productos = [];
  imagenes = [];
  nuevo = false;
  mostrarLista =false;
  modelosProducto =[];
  soloPedidos = false;
  proSeleccionados = [];
  virtualClass = '';
  nombreCli = '';
  llegado = false;
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
  posss = 0;
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
  pos = 72;
  observaciones ="";
  preventas=[];
  preventaSelect = -1;
  preventas2=[];
  preventaSelect2 = "-1";
  saldo=0.0;
  precio = 0.0;
  totalFinal = 0.0;
  psos;
  tieneFiltro = false;
  promoFiltro = false;
  cantAux=0;
  cantProd = 0;
  parCatalogo = false;
  
  constructor(public toastCtrl: ToastController,public storage:Storage, public keyboard: Keyboard, 
    public navCtrl: NavController, public navParams: NavParams, public alert: AlertController,
     public alerta: AlertaProvider, public database : DatabaseProvider, public load: LoadingController,
    public viewCtrl : ViewController, public appCtrl: App, public element : ElementRef, 
  public modalCtrl: ModalController,private alertCtrl: AlertController) {
    
    let loader = load.create({
      content:"Cargando.."
    });
    loader.present().then(() =>{
      this.viewCtrl.showBackButton(false);
      this.uac = navParams.data.uac;
      //this.cliente = navParams.data.cliente;
      this.zona = navParams.data.zona;
      this.database.getDatabaseState().subscribe(rdy =>{
        if(rdy){
            this.database.obtenerTotalProductosTmp().then(ressa=>{
              let res = ressa;
              if(res!==null && res !== undefined){
                this.totalFinal = Number(res);
              }else{
                this.totalFinal = 0.0;
              }
            }).catch(err=>{

            });
           
            this.database.obtenerParametros().then(data =>{
              this.parIva = data[3];
              this.parRepetido =  data[4];
              this.parItems = data[2];
              if(data[12].valor === "TRUE"){
                this.parCatalogo = false;
              }else{
                this.parCatalogo = true;
              }
              this.database.obtenerClasificaciones().then(res =>{
                this.clasificaciones=res;
              }).catch(err =>{
                this.alerta.mostrarError('Error al obtener clasificaciones',err.message);
              });
              this.database.obtenerMarcas(-1).then(res =>{
                this.marcas=res;
              }).catch(err =>{
                this.alerta.mostrarError('Error al obtener mar',err.message);
              });
              // this.database.obtenerModelos(-1,-1).then(res =>{
              //   this.modelos=res;
              // }).catch(err =>{
              //   this.alerta.mostrarError('Error al obtener mar',err.message);
              // });
              this.database.obtenerTablasPreventas().then(rp => {
                let da;
                da =rp;
                if(da.length >0){
                  this.preventas2 = da;
                }
              }).catch(err=>{
                loader.dismiss();
                this.alerta.mostrarError('Error al obtener detalles importaciones',err);
              });
              this.database.obtenerBodega().then(bode =>{
                this.bodegas = bode;
                if(this.bodegas.length>0){
                  this.bodega = this.bodegas[0].id;
                }
              }).catch(errbod => {
                loader.dismiss();
                this.alerta.mostrarError('Error al obtener bodegas',errbod);
              });
              
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
                    this.pos = 72;
                    
                    this.database.obtenerCantidadProductosTmp().then(res=>{
                      let dd;
                      dd = res;
                      this.cantProd = dd;
                    })
                    this.database.obtenerProductos2(this.nombreFiltro,this.cliente.listaPrecios,this.parIva).then(res =>{
                        this.mostrarLista = true;
                        this.virtualClass ='';
                        this.productosAux = res;
                        console.log('Cuantos vienen ',res);
                      for(let xd = this.pos-72; xd<this.pos;xd++ ){

                        this.database.obtenerUnaImagen(this.productosAux[xd].id).then(igr => {
                          let dd;
                          dd =igr;
                          let pr = this.productosAux[xd];
                          if(igr!==null){
                            pr.imagen = dd.imagen;
                            pr.ext = dd.extension;
                            if(dd.img !==null && dd.img !== undefined){
                               pr.mostrar = 'data:image/jpeg;base64,'+dd.img;
                            }else{
                              pr.imagen = 'no_imagen.png';
                              pr.ext ='png';
                              pr.mostrar = 'assets/images/no_image.png'
                            }
                          }else{
                              pr.imagen = 'no_imagen.png';
                              pr.ext ='png';
                              pr.mostrar = 'assets/images/no_image.png'
                          }
                          this.productos.push(pr);
                          if(xd === (this.pos-1)){
                            this.virtualScroll.resize(); 
                            loader.dismiss();
                          }

                        }).catch(egrd=>{
                          this.alerta.mostrarError('Error',egrd.message);
                        });
                      }
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
        loader.dismiss();
      });
  }
  cambioPreventa(){

  }
  abrirFiltro(){
    let clienteModal = this.modalCtrl.create(DlgFiltroPage,{
      modeloSelect : this.modeloSelect,
      modelos : this.modelos,
      preventas:this.preventas2,
      preventaSelect : this.preventaSelect2,
      nuevo: this.nuevo,
      promoFiltro:this.promoFiltro
    });
    clienteModal.onDidDismiss(datos =>{
      if(datos!==null && datos !== undefined){
        if(datos.cerrar === false){
          this.modeloSelect = datos.modeloSelect;
          this.preventaSelect2 = datos.preventaSelect;
          this.tieneFiltro = datos.tieneFiltro;
          this.promoFiltro = datos.promoFiltro;
          this.nuevo = datos.nuevo;
          this.llegado = datos.llegado;
          this.buscarPorCodigo();
        }
      }
    });
    clienteModal.present();
  }
  darFormatoFecha(fecha){
    if(fecha!==null){
      var datestring = ("0" + fecha.getDate()).slice(-2) + "-" + ("0"+(fecha.getMonth()+1)).slice(-2) + "-" +fecha.getFullYear()+" "+("0" + fecha.getHours()).slice(-2)+":"+("0" + fecha.getMinutes()).slice(-2) +":"+("0" + fecha.getSeconds()).slice(-2) ;
   return datestring;
    }else{
      return "";
    }
 }
  onBlurMethod(prod){
    let jd = this.productos.map(function(e) { return e.id; }).indexOf(prod.id);
    let ax = this.proSeleccionados.map(function(e) { return e.id; }).indexOf(prod.id);
    if(prod.cantidad ===null || prod.cantidad === undefined || prod.cantidad==="" || prod.cantidad<=0){
      this.productos[jd].cantidad = 0;
      this.productos[jd].color ='transparent';
      this.productos[jd].total = 0;
      this.productos[jd].ti=false;
      
      if(this.productos[jd].preventa!=="-1" && this.productos[jd].preventa!==null)
        this.productos[jd].precioIva=this.productos[jd].precioIva2;
      
      this.productos[jd].preventa=null;
      this.database.eliminarProductotmp(prod).then(res=>{
        this.database.obtenerTotalProductosTmp().then(ressa=>{
          let res = ressa;
          if(res!==null && res !== undefined){
            this.totalFinal = Number(res);
          }else{
            this.totalFinal = 0.0;
          
          }
          this.database.obtenerCantidadProductosTmp().then(res=>{
            let dd;
            dd = res;
            this.cantProd = dd;
            
          })
        }).catch(err=>{
        });
      }).catch(er=>{
        console.log('Error al eliminar tmp');
      });
    }else{
      if(prod.cantminima===null  || prod.cantminima===undefined || prod.cantminima===0){
        prod.cantminima=1;
      }
      let residuo = prod.cantidad%prod.cantminima;
      if(residuo === 0 ){
        this.agregarDetalleCat(prod);
      }else{
        this.productos[jd].cantidad = this.cantAux;
        this.alerta.mostrarError('Error','La cantidad mínima del producto es: '+prod.cantminima);
      }
    }
    
  }
  eventHandler(keyCode,prod) {
    if(keyCode===13){

    }
    
  }
  clickCantidad(){
    if(this.producto.cantidad === undefined || this.producto.cantidad ===null || this.producto.cantidad<=0){
      this.cantidad = null;
    }
  }
  clickCantidad2(prod){
    let ax = this.productos.map(function(e) { return e.id; }).indexOf(prod.id);
    if(prod.cantidad === undefined || prod.cantidad ===null || prod.cantidad<=0){
      this.productos[ax].cantidad = null;
    }else{
      this.cantAux = prod.cantidad;
    }
  }
  agregarAlCarrito(){
    let loader = this.load.create({
      content:"Cargando.."
    });
    loader.present().then(() => {
      this.listaDetalles = [];
      this.database.obtenerProductosTmp(this.cliente.listaPrecios,this.parIva).then(resz =>{
        let dat;
        dat = resz;
        if(dat.length>0){
          this.proSeleccionados = dat;
        }
        else{
          this.proSeleccionados = [];
        }
      if(this.proSeleccionados.length>0){
            for(let i = 0; i < this.proSeleccionados.length; i++){
              let producto = this.proSeleccionados[i];
              console.log('Producto que agregar -> ',producto);
              
                this.guardarDetalleProd(producto).then(res=>{
                  if(i === (this.proSeleccionados.length-1)){
                    loader.dismiss();
                    let toas = this.toastCtrl.create({
                      duration:1500,
                      position:'middle',
                      message:"Productos agregados correctamente"
                    });
                    toas.present();
                  }
                }).catch(err=>{
                  loader.dismiss();
                  this.alerta.mostrarError('Error',err);
                });
              
            }
        }else{
          loader.dismiss();
        }
      }).catch(rop =>{
        loader.dismiss();
      }); 
    });
  }
  buscarSiExiste(prod){
    return this.listaDetalles.map(function(e) { return e.idProducto; }).indexOf(prod.id);
  }
  cambioClasificacion(){
    this.marcaSelect = -1;
    this.modeloSelect = -1;
    this.database.obtenerMarcas(this.clasificacionSelect).then(res =>{
      this.marcas=res;
      this.buscarPorCodigo();
    }).catch(err =>{
      this.alerta.mostrarError('Error al obtener mar',err.message);
    });
    if(this.clasificacionSelect===-1){
      this.modelos=[];
      this.modelos.push({id:-1,nombre:"TODOS"});
      this.modeloSelect = -1;
    }else{
      this.database.obtenerModelos(this.clasificacionSelect,this.marcaSelect).then(res =>{
        this.modelos=res;
      }).catch(err =>{
        this.alerta.mostrarError('Error al obtener mod',err.message);
      });
    }
  }
  cambioMarcas(){
    this.modeloSelect = -1;
    if(this.clasificacionSelect===-1 && this.marcaSelect===-1){
      this.modelos=[];
      this.modelos.push({id:-1,nombre:"TODOS"});
      this.buscarPorCodigo();
    }else{ 
      this.database.obtenerModelos(this.clasificacionSelect,this.marcaSelect).then(res =>{
        this.modelos=res;
        this.buscarPorCodigo();
      }).catch(err =>{
        this.alerta.mostrarError('Error al obtener mod',err.message);
      });
    }
  }
  infinitamente(ionScroll){
    setTimeout(() => {
      this.estaCargando = true;
      if(this.productos.length<this.productosAux.length){
        let res = (this.productosAux.length-this.productos.length);
        if(res>=72){
          this.pos+=72; 
          for(let xd = this.pos-72; xd<this.pos;xd++ ){
            this.database.obtenerUnaImagen(this.productosAux[xd].id).then(igr => {
                        let dd;
                        dd =igr;
                        let pr = this.productosAux[xd];
                        if(igr!==null){
                          pr.imagen = dd.imagen;
                          pr.ext = dd.extension;
                          if(dd.img !==null && dd.img !== undefined){
                             pr.mostrar = 'data:image/jpeg;base64,'+dd.img;
                          }else{
                            pr.mostrar = 'assets/images/no_image.png'
                          }
                        }else{
                            pr.imagen = 'no_imagen.png';
                            pr.ext ='png';
                            pr.mostrar = 'assets/images/no_image.png'
                        }
                        this.productos.push(pr);
                        if(xd === (this.pos-1)){
                          this.estaCargando = false;
                          ionScroll.complete();
                        }
                      }).catch(egrd=>{
                        this.estaCargando = false;
                        this.alerta.mostrarError('Error',egrd.message);
                        ionScroll.complete();
                      });
          }
        }else{
          this.pos+=res;
          for(let xd = this.pos-res; xd<this.pos;xd++ ){
            this.database.obtenerUnaImagen(this.productosAux[xd].id).then(igr => {
                        let dd;
                        dd =igr;
                        let pr = this.productosAux[xd];
                        if(igr!==null){
                          pr.imagen = dd.imagen;
                          pr.ext = dd.extension;
                          if(dd.img !==null && dd.img !== undefined){
                             pr.mostrar = 'data:image/jpeg;base64,'+dd.img;
                          }else{
                            pr.mostrar = 'assets/images/no_image.png'
                          }
                        }else{
                            pr.imagen = 'no_imagen.png';
                            pr.ext ='png';
                            pr.mostrar = 'assets/images/no_image.png'
                        }
                        this.productos.push(pr);
                        if(xd === (this.pos-1)){
                          this.estaCargando = false;
                          ionScroll.complete();
                        }
                      }).catch(egrd=>{
                        this.estaCargando = false;
                        ionScroll.complete();
                        this.alerta.mostrarError('Error',egrd.message);
                      });
          }
        } 
      }else{
        this.estaCargando = false;
        ionScroll.complete();
      }
    }, 1000);
  }

  doInfinite(): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if(this.productos.length<this.productosAux.length){
          let res = (this.productosAux.length-this.productos.length);
          if(res>=72){
            this.pos+=72; 
            for(let xd = this.pos-72; xd<this.pos;xd++ ){
              this.database.obtenerUnaImagen(this.productosAux[xd].id).then(igr => {
                          let dd;
                          dd =igr;
                          let pr = this.productosAux[xd];
                          if(igr!==null){
                            pr.imagen = dd.imagen;
                            pr.ext = dd.extension;
                            if(dd.img !==null && dd.img !== undefined){
                               pr.mostrar = 'data:image/jpeg;base64,'+dd.img;
                            }else{
                              pr.mostrar = 'assets/images/no_image.png'
                            }
                          }else{
                              pr.imagen = 'no_imagen.png';
                              pr.ext ='png';
                              pr.mostrar = 'assets/images/no_image.png'
                          }
                          var fA = new Date();
                          var anio = fA.getFullYear();
                          var mes = fA.getMonth()+1;
                          let stock = 0 ;
                          this.database.obtenerCantidadProducto(pr.id).then(cant=>{
                            let cantidad = cant;
                            this.database.obtenerSaldo2(pr.id,anio,mes).then(saldo=>{
                             if(Number(saldo) < Number(cantidad)){
                                stock = 0;
                                pr.stock=stock;
                                this.productos.push(pr);
                                if(xd === (this.pos-1))
                                  resolve();
                              }else{
                                stock = Number(saldo) - Number(cantidad);
                                pr.stock=stock;
                                this.productos.push(pr);
                                if(xd === (this.pos-1))
                                  resolve();
                              }
                            }).catch(e=>{
                            })
                          }).catch(cs=>{
                          })
                        }).catch(egrd=>{
                          this.alerta.mostrarError('Error',egrd.message);
                        });
            }
          }else{
            this.pos+=res;
            for(let xd = this.pos-res; xd<this.pos;xd++ ){
              this.database.obtenerUnaImagen(this.productosAux[xd].id).then(igr => {
                          let dd;
                          dd =igr;
                          let pr = this.productosAux[xd];
                          if(igr!==null){
                            pr.imagen = dd.imagen;
                            pr.ext = dd.extension;
                            pr.mostrar = 'data:image/jpeg;base64,'+dd.img;
                          }
                          var fA = new Date();
                          var anio = fA.getFullYear();
                          var mes = fA.getMonth()+1;
                          let stock = 0 ;
                          this.database.obtenerCantidadProducto(pr.id).then(cant=>{
                            let cantidad = cant;
                            this.database.obtenerSaldo2(pr.id,anio,mes).then(saldo=>{
                             if(Number(saldo) < Number(cantidad)){
                                stock = 0;
                                pr.stock=stock;
                                this.productos.push(pr);
                                if(xd === (this.pos-1))
                                  resolve();
                              }else{
                                stock = Number(saldo) - Number(cantidad);
                                pr.stock=stock;
                                this.productos.push(pr);
                                if(xd === (this.pos-1))
                                  resolve();
                              }
                            }).catch(e=>{
                            })
                          }).catch(cs=>{
                          })
                        }).catch(egrd=>{
                          this.alerta.mostrarError('Error',egrd.message);
                        });
            }
          }
        }else{
          resolve();
        }
      }, 500);
    })
  }

  busqueda(){
    this.mostrarLista = true;
    this.virtualClass ='';
    this.pos = 72;
     this.productos = [];          
    this.database.obtenerProductos2(this.nombreFiltro,this.cliente.listaPrecios,this.parIva).then(res =>{
      this.mostrarLista = true;
      this.virtualClass ='virtual-hide';
      this.productosAux = res;
      let num;
      
      
      if(this.productosAux.length>0){
        if(this.productosAux.length>72){
        for(let xd = this.pos-72; xd<this.pos;xd++ ){
          if(this.productosAux[xd]!==null && this.productosAux[xd]!==undefined){
          this.database.obtenerUnaImagen(this.productosAux[xd].id).then(igr => {
            
            if(this.productosAux[xd]!==null && this.productosAux[xd]!==undefined){
                            let dd;
                            dd =igr;
                            let pr = this.productosAux[xd];
                            if(igr!==null){
                              pr.imagen = dd.imagen;
                              pr.ext = dd.extension;
                              pr.mostrar = 'data:image/jpeg;base64,'+dd.img;
                            if(dd.img !==null && dd.img !== undefined){
                                pr.mostrar = 'data:image/jpeg;base64,'+dd.img;
                              }else{
                                pr.mostrar = 'assets/images/no_image.png'
                              }
                            }else{
                                pr.imagen = 'no_imagen.png';
                                pr.ext ='png';
                                pr.mostrar = 'assets/images/no_image.png'
                            }
                            this.productos.push(pr);
                          }
                          }).catch(egrd=>{
                            this.alerta.mostrarError('Error',egrd.message);
                          });
                        }
        }
      }else{
        for(let xd = 0; xd<this.productosAux.length;xd++){
          if(this.productosAux[xd]!==null && this.productosAux[xd]!==undefined){
            this.database.obtenerUnaImagen(this.productosAux[xd].id).then(igr => {
              if(this.productosAux[xd]!==null && this.productosAux[xd]!==undefined){
              let dd;
              dd =igr;
              let pr = this.productosAux[xd];
              if(igr!==null){
                pr.imagen = dd.imagen;
                pr.ext = dd.extension;
                pr.mostrar = 'data:image/jpeg;base64,'+dd.img;
                if(dd.img !==null && dd.img !== undefined){
                  pr.mostrar = 'data:image/jpeg;base64,'+dd.img;
                }else{
                  pr.mostrar = 'assets/images/no_image.png'
                }
              }else{
                pr.imagen = 'no_imagen.png';
                pr.ext ='png';
                pr.mostrar = 'assets/images/no_image.png'
              }
              this.productos.push(pr);
            }
          }).catch(egrd=>{
            this.alerta.mostrarError('Error',egrd.message);
          });
        }
      }
      }
    }else{
      console.log('Entra en el eslse');
      
      this.productos = [];
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
      this.cargarDatosCabecera();  
    }).catch(erro =>{
      this.alerta.mostrarError('Error al obtener detalles',erro.message);
    });
  }

  cargarDatosCabecera(){
   let datosCabecera = {
      observaciones:"",
      novedad:0,
      obsequio:false,
      descuento:0.0,
      idpol:0,
      diasPlazo:1,
      zona:-1
    }
    this.storage.get('datosCabecera').then(respu => {
      if(respu!==null){
        datosCabecera = respu;
      }
    });
      this.database.obtenerNovedades().then(nov =>{
        this.storage.get('datosCabecera').then(respu => {
          this.storage.get('cliente').then(res=>{
            let cli;
            cli =res;
            this.nombreCli = res.nombre;
            if(respu === null){
              datosCabecera.novedad= nov[0].id;
              datosCabecera.descuento = cli.descuento;
              datosCabecera.idpol = cli.politica;
              datosCabecera.diasPlazo = cli.diasplazo;
              datosCabecera.zona = this.zona;
              this.storage.set('datosCabecera',datosCabecera);
            }             
          }).catch(errc =>{
            this.alerta.mostrarError('Error al obtener cliente',errc.message);
          });
        });
    }).catch(errnov => {
      this.alerta.mostrarError('Error',errnov);
    }) 
    
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
  buscarBodegaProducto(){

  }
  agregarDetalleCat(prod){
    
    let loader = this.load.create({content:"Guardando.. "});
    loader.present().then(()=>{
      let jd = this.productos.indexOf(prod)
      let ax = this.proSeleccionados.map(function(e) { return e.id; }).indexOf(prod.id);
      let hay = 0;
      
      this.database.existeEnTmp(prod.id).then(res=>{
        hay = res;
        if(res>0){
          this.productos[jd].cantidad = prod.cantidad;
          let precioFinal = 0;
          if(prod.stock!=0){
            if(prod.cantidad<=prod.stock){
              this.productos[jd].total = prod.cantidad * Math.round(prod.precioIva*100)/100 ;
              precioFinal = prod.precioIva;
            }else{
              this.productos[jd].total = prod.stock * Math.round(prod.precioIva*100)/100 ;
              precioFinal = prod.precioIva;
            }
          }else{
            this.productos[jd].total = 0;
            precioFinal = 0;
          }
          this.productos[jd].ti=true;
          if(this.productos[jd].preventa ===null || this.productos[jd].preventa ==="-1"){
            this.productos[jd].color ='#CFFABA';
          }
          else{
            this.productos[jd].color =  '#7DFFF9'
          }
          // if(ax!==-1){
          //   this.proSeleccionados.splice(ax,1);
          // } 
          // this.proSeleccionados.push(this.productos[jd]);
          let prv = this.preventaSelect2;
          if(this.productos[jd].preventa!==null){
            prv = this.productos[jd].preventa;
          }
          let tmp = {
            id : this.productos[jd].id,
            cantidad : this.productos[jd].cantidad,
            total : this.productos[jd].total,
            precio : precioFinal,
            preventa : prv
          }
          // this.proSeleccionados[ax] = this.productos[jd];
          this.database.actualizarProductotmp(tmp).then(res=>{
            this.database.obtenerTotalProductosTmp().then(ressa=>{
              let res = ressa;
              if(res!==null && res !== undefined){
                this.totalFinal = Number(res);
              }else{
                this.totalFinal = 0.0;
              }
              loader.dismiss();
            }).catch(err=>{
              loader.dismiss();
            });
          }).catch(er=>{
            loader.dismiss();
            console.log('Error al actualizar tmp');
          });
        }else{
          this.productos[jd].cantidad =prod.cantidad;
          let precioFinal = 0;
          if(prod.stock!=0){
            if(prod.cantidad<=prod.stock){
              this.productos[jd].total = prod.cantidad * Math.round(prod.precioIva*100)/100 ;
              precioFinal = prod.precioIva;
            }else{
              this.productos[jd].total = prod.stock * Math.round(prod.precioIva*100)/100 ;
              precioFinal = prod.precioIva;
            }
          }else{
            this.productos[jd].total = 0;
            precioFinal = 0;
          }
          this.productos[jd].ti=true;
          if(this.preventaSelect2==="-1"){
            this.productos[jd].color ='#CFFABA';
          }
          else{
            this.productos[jd].preventa = this.preventaSelect2;
            this.productos[jd].color =  '#7DFFF9'
          }
          // this.proSeleccionados.push(this.productos[jd]);
          let prv = this.preventaSelect2;
          if(this.productos[jd].preventa!==null){
            prv = this.productos[jd].preventa;
          }
                        let tmp = {
                          id : this.productos[jd].id,
                          cantidad : this.productos[jd].cantidad,
                          total : this.productos[jd].total,
                          precio : precioFinal,
                          preventa : prv
                        }
                        this.database.existeEnTmp(tmp.id).then(exi=>{
                          if(exi !== 1){
                            this.database.insertarProductotmp(tmp).then(res=>{
                              this.database.obtenerTotalProductosTmp().then(ressa=>{
                                let res = ressa;
                                if(res!==null && res !== undefined){
                                  this.totalFinal = Number(res);
                                }else{
                                  this.totalFinal = 0.0;
                                
                                }
                                this.database.obtenerCantidadProductosTmp().then(res=>{
                                  let dd;
                                  dd = res;
                                  this.cantProd = dd;
                                  
                                })
                                loader.dismiss();
                              }).catch(err=>{
                                loader.dismiss();
                              });
                            }).catch(er=>{
                              loader.dismiss();
                              console.log('Error al insertar tmp');
                            });
                          }else{
                            this.database.actualizarProductotmp(tmp).then(res=>{
                              this.database.obtenerTotalProductosTmp().then(ressa=>{
                                let res = ressa;
                                if(res!==null && res !== undefined){
                                  this.totalFinal = Number(res);
                                }else{
                                  this.totalFinal = 0.0;
                                }
                                loader.dismiss();
                              }).catch(err=>{
                                loader.dismiss();
                              }); 
                            }).catch(er=>{
                              loader.dismiss();
                              console.log('Error al actualizar tmp');
                            });
                          }
                        }).catch(err=>{
                          loader.dismiss();
                        })
                      }
                   
                    }).catch(aa=>{
                      loader.dismiss();
                    })
                
    });    
  }
  agregarDetalle2(){
    let loader = this.load.create({content:"Guardando.. "});
    loader.present().then(()=>{
                let jd = this.productos.indexOf(this.producto)
                let ax = this.proSeleccionados.map(function(e) { return e.id; }).indexOf(this.producto.id);
                  if(this.producto.cantidad>0){
                    this.productos[jd].cantidad = this.cantidad;
                    let precioFinal = 0;
                    if(this.producto.stock!=0){
                      if(this.producto.cantidad<=this.producto.stock){
                        this.productos[jd].total = this.producto.cantidad * Math.round(this.producto.precioIva*100)/100 ;
                        this.producto.total = this.producto.cantidad* Math.round(this.producto.precioIva*100)/100;
                        
                      }else{
                        this.productos[jd].total = this.producto.stock * Math.round(this.producto.precioIva*100)/100 ;
                        this.producto.total = this.producto.stock * Math.round(this.producto.precioIva*100)/100;
                        
                      }
                    }else{
                      this.productos[jd].total = 0;
                      this.producto.total = 0;
                      
                    }
                    this.productos[jd].ti=true;
                    if(this.productos[jd].preventa ===null){
                      this.productos[jd].color ='#CFFABA';
                    }
                    else{
                      this.productos[jd].color =  '#7DFFF9'
                    }

                    let prv = this.preventaSelect2;
                    if(this.productos[jd].preventa!==null){
                      prv = this.productos[jd].preventa;
                    }
                    let tmp = {
                      id : this.productos[jd].id,
                      cantidad : this.productos[jd].cantidad,
                      total : this.productos[jd].total,
                      precio :this.productos[jd].precioIva,
                      preventa : prv
                    }
                    this.database.actualizarProductotmp(tmp).then(res=>{
                      this.database.obtenerTotalProductosTmp().then(ressa=>{
                        let res = ressa;
                        if(res!==null && res !== undefined){
                          this.totalFinal = Number(res);
                        }else{
                          this.totalFinal = 0.0;
                        }
                      }).catch(err=>{
          
                      });
                    }).catch(er=>{
                      console.log('Error al actualizar tmp');
                    });
                  }else{
                    //this.totalFinal+=this.cantidad*this.producto.precioIva;
                    this.productos[jd].cantidad = this.cantidad;
                    let precioFinal = this.producto.precioIva;
                    if(this.producto.stock!=0){
                      if(this.producto.cantidad<=this.producto.stock){
                        this.productos[jd].total = this.producto.cantidad * Math.round(this.producto.precioIva*100)/100 ;
                        this.producto.total = this.producto.cantidad* Math.round(this.producto.precioIva*100)/100;
                        precioFinal = this.producto.precioIva;
                      }else{
                        this.productos[jd].total = this.producto.stock * Math.round(this.producto.precioIva*100)/100 ;
                        this.producto.total = this.producto.stock * Math.round(this.producto.precioIva*100)/100;
                        precioFinal = this.producto.precioIva;
                      }
                    }else{
                      this.productos[jd].total = 0;
                      this.producto.total = 0;
                      precioFinal = 0;
                    }
                    this.productos[jd].ti=true;
                    if(this.preventaSelect2==="-1"){
                      this.productos[jd].color ='#CFFABA';
                    }
                    else{
                      this.productos[jd].preventa = this.preventaSelect2;
                      this.productos[jd].color =  '#7DFFF9'
                    }
                    let prv = this.preventaSelect2;
                    if(this.productos[jd].preventa!==null){
                      prv = this.productos[jd].preventa;
                    }
                    let tmp = {
                      id : this.productos[jd].id,
                      cantidad : this.productos[jd].cantidad,
                      total : this.productos[jd].total,
                      precio : precioFinal,
                      preventa : prv
                    }
                    //this.proSeleccionados.push(this.productos[jd]);
                    this.database.existeEnTmp(tmp.id).then(exi=>{
                          if(exi !== 1){
                            this.database.insertarProductotmp(tmp).then(res=>{
                              this.database.obtenerTotalProductosTmp().then(ressa=>{
                                let res = ressa;
                                if(res!==null && res !== undefined){
                                  this.totalFinal = Number(res);
                                }else{
                                  this.totalFinal = 0.0;
                                
                                }
                                this.database.obtenerCantidadProductosTmp().then(res=>{
                                  let dd;
                                  dd = res;
                                  this.cantProd = dd;
                                  
                                })
                                loader.dismiss();
                              }).catch(err=>{
                                loader.dismiss();
                              });
                            }).catch(er=>{
                              loader.dismiss();
                              console.log('Error al insertar tmp');
                            });
                          }else{
                            this.database.actualizarProductotmp(tmp).then(res=>{
                              this.database.obtenerTotalProductosTmp().then(ressa=>{
                                let res = ressa;
                                if(res!==null && res !== undefined){
                                  this.totalFinal = Number(res);
                                }else{
                                  this.totalFinal = 0.0;
                                }
                                loader.dismiss();
                              }).catch(err=>{
                                loader.dismiss();
                              });
                            }).catch(er=>{
                              loader.dismiss();
                              console.log('Error al actualizar tmp');
                            });
                          }
                        }).catch(err=>{
                          loader.dismiss();
         });
       }       
    });    
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
            cordcom:this.preventaSelect,
            preventa:this.preventaSelect2,
            observaciones:this.observaciones
          }
          this.content.scrollTo(0,this.posss,500).then(()=>{
            console.log('Fue el escroll');
            
          });
        let toast = this.toastCtrl.create({
          message: 'Producto agregado correctamente',
          duration: 1000,
          position: 'middle'
        });
        toast.present();
        this.listaDetalles.push(detalle);
          this.storage.set('detalles',null);
          this.storage.set('detalles',this.listaDetalles); 
          // this.nombreFiltro ="";
          // this.codigoFiltro="";
          //this.busqueda();
         
          this.mostrarLista = true;
          this.virtualClass ='';
          this.disabled =true;
          this.preventaSelect=-1;
          this.preventas=[];
          this.observaciones ="";

    
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
  guardarDetalleProd(producto){
    
    return new Promise((resolve,reject)=>{
      if(this.listaDetalles.length<Number(this.parItems.valor)){
        this.database.obtenerUnidad(producto.umedida).then(res=>{
          this.database.obtenerBodegaPorId(this.bodega).then(resbod => {
              var uni;
              var bod;
            uni = res;
            bod = resbod;
            let cant = Number(producto.cantidad);
            
            let iva = (producto.precioIva - producto.precio)*cant;
            iva = Math.round(iva*100)/100;
            let totalF = cant*Math.round(producto.precioIva*100)/100;
            totalF = Math.round(totalF*100)/100;
            let total = totalF-iva;
            total = Math.round(total*100)/100;
            let preciooo =producto.precio;
            if(producto.saldo === undefined || producto.saldo ===null || producto.saldo <=0){
              total = 0 ;
              iva = 0 ;
              totalF = 0;
              
            }else{
              if(cant>producto.saldo){
                iva = (producto.precioIva - producto.precio)*producto.saldo;
                iva = Math.round(iva*100)/100;
                totalF = producto.saldo*Math.round(producto.precioIva*100)/100;
                totalF = Math.round(totalF*100)/100;
                total = totalF-iva;
                total = Math.round(total*100)/100;
              }
            }

            this.database.obtenerpreventasProductoFecha(producto.preventa,producto.id).then(resff=>{
              let prv = -1;
              let cor = -1;
              if(resff.length>0){
                prv = resff[0].id;
                cor = resff[0].corid;
              }
              let detalle = {
                idProducto : producto.id,
                cantidad: cant,
                descuento:0,
                nombreProducto:producto.nombre,
                precio:preciooo,
                promocion :0.0,
                cpedido:-1,
                unidad:producto.umedida,
                bodega:this.bodega,
                total:totalF,
                subtotal : total,
                iva:iva,
                nombreUnidad: uni.nombre,
                nombreBodega: bod.nombre,
                cordcom:cor,
                preventa:prv,
                observaciones:""
              }
              console.log('Detalle que va a agregar ', detalle);
              
              if(this.buscarSiExiste(producto) === -1){
                this.listaDetalles.push(detalle);
              }
              this.storage.set('detalles',null);
              this.storage.set('detalles',this.listaDetalles); 
              resolve(1);
            }).catch(rrrr=>{
              reject(rrrr.message);
              this.alerta.mostrarError('Error al obtener nombre bodega',rrrr.message);
            })
          }).catch(errorbod => {
            reject(errorbod);
            this.alerta.mostrarError('Error al obtener nombre bodega',errorbod)
          })
        }).catch(erroun =>{
          reject(erroun);
          this.alerta.mostrarError('Error al obtener unidad',erroun);
        })
      }else{
        reject('Solo se pueden agregar hasta '+this.parItems.valor+" ítems");
        this.alerta.mostrarError('Info','Solo se pueden agregar hasta '+this.parItems.valor+" ítems");
      }
    });
  }




  doYourStuff()
  { 
      if(this.mostrarLista === true){
        //this.navCtrl.setRoot(ListaClientesPage);
        this.storage.get("mod").then(res=>{
          if(res === true){
            this.database.borrarProductostmp().then(resaa=>{
              this.storage.set("totalFinal",0.00);
              this.appCtrl.getRootNav().push(SubirPedidosPage,{
                uac:this.uac
              }); 
            });
          }else{
            this.confirmarPedido();
            //this.appCtrl.getRootNav().push(DlgFiltroPage,{
            //uac:this.uac
            //}); 
          }
        });
     // remember to put this to add the back button behavior
      }else{
        let loader = this.load.create({content:"Cargando.."});
        loader.present().then(()=>{
          this.mostrarLista = true;
          this.virtualClass ='';
          this.producto = {
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
          this.content.scrollTo(0,this.posss,500).then(()=>{
            loader.dismiss();
          });
        })
        
      }
    }

    confirmarPedido() {
      let alert = this.alertCtrl.create({
        title: 'Estás saliendo del pedido!',
        message: 'Deseas conservar el pedido temporal?',
        buttons: [
          {
            text: 'Guardar y salir',
            handler: () => {
              console.log('Pulso guardar el pedido');
              this.appCtrl.getRootNav().push(ListaClientesPage,{
              uac:this.uac
              }); 
            }
          },
          {
            text: 'Salir sin guardar',
            handler: () => {
              console.log('Pulso borrar el pedido');
              this.database.eliminarTodoProductotmp().then(res=>{
                this.storage.set("totalFinal",0.00);
              }).catch(err=>{
                console.log('Error al eliminar');
                
              });
              this.appCtrl.getRootNav().push(ListaClientesPage,{
                uac:this.uac
                }); 
            }
          },
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Cancelo la accion');
            }
          }
        ]
      });
      alert.present();
    }
  

  mostrarElegido2(producto){
    let clienteModal = this.modalCtrl.create(DlgDetProductoPage,{
      producto : producto,
      bodega: this.bodega,
      bodegas : this.bodegas,
      parIva : this.parIva,
      productos : this.productos,
      catalogo : this.parCatalogo
    },{cssClass : 'pricebreakup'});
    clienteModal.onDidDismiss(datos =>{
      if(datos!==null && datos !== undefined){
        if(datos.cerrar === false){
          this.producto = datos.producto;
          this.cantidad = datos.cantidad;
          this.bodega = datos.bodega;
          this.agregarDetalle2();
        }
      }
    });
    clienteModal.present();
  }
  mostrarElegido(producto){
    let kk = this.productos.indexOf(producto);   
    if(this.preventaSelect===-1){
      let psos = this.inputCard.nativeElement.offsetHeight;
      let loader = this.load.create({
        content:"Cargando..."
      });
      loader.present().then(()=>{

        this.disabled =false;
        //this.total=0.0;
        this.descuento = 0.0;
        this.mostrarLista=false;
        this.virtualClass ='virtual-hide';
        this.producto = producto;
        this.modelosProducto = [];
        var fA = new Date();
        var anio = fA.getFullYear();
        var mes = fA.getMonth()+1;
  
        // this.database.obtenerTablasPreventasPorProducto(this.producto.id).then(rp => {
        //   let da;
        //   da =rp;
          
        //   if(da.length >0){
        //     this.preventas2 = da;
        //   }
        // }).catch(err=>{
        //   loader.dismiss();
        //   this.alerta.mostrarError('Error al obtener detalles preventas',err);
        // });
        this.database.obtenerModelosProducto(producto.id).then(res =>{
          this.modelosProducto = res;
          for(let jxc = 0; jxc < this.modelosProducto.length; jxc++){
            this.modelosProducto[jxc].mostrar = 'data:image/jpeg;base64,'+this.modelosProducto[jxc].img;
          }
        }).catch(er =>{ 
          loader.dismiss();
          this.alerta.mostrarError('Error al obtener imágenes de modelo',er.message);
        })
        
         this.saldo = this.producto.stock;
            this.precioProducto = this.producto.precio;
            this.precio = this.producto.precioIva;
            this.database.obtenerFactores(this.producto.id).then(res=>{
            this.unidades = res;
            let indx = this.productos.indexOf(this.producto);
            indx = indx-1;
            if(indx<0)
              indx=0;
            let id = parseInt((indx/3+""))+"";
            var numerostr="0";
            let fin = 0;
            if(id.length>1){
              numerostr=id.substring(0,id.length-1);
              let od =parseInt(indx.toString().substring(0,indx.toString().length-1));
              fin = parseInt(numerostr)+parseInt(indx.toString().substring(0,indx.toString().length-1));
            }  
            this.posss = ((parseInt((indx/3+""))*psos))+fin*60+(parseInt(numerostr)*30); 
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
                      // this.content.scrollTo(0,1,500).then(()=>{
                        
                      // });
                  }).catch(erim =>{
                    loader.dismiss();
                    this.alerta.mostrarError('Error al obtener imágenes',erim.message);
                  });
                
              }).catch(errorunid =>{
                loader.dismiss();
                this.alerta.mostrarError('Error al obtener factores',errorunid);
              });
            
          
        
      });
    }else{
      this.alerta.mostrarError('Info','No debe estar seleccionada ninguna importación')
    }
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
        let sub = this.cantidad*Math.round(this.producto.precioIva*100)/100;
        this.total = sub - (sub*desc);
      }else{
        this.total = 0.0;
      }
    }else{
      this.total=0.0;
    }
  }
  obtenerTotal(){
    let desc = 0.0;
    let total = 0.0;
    if(this.descuento !==null && this.descuento>0){
      desc = this.descuento/100;
    }
    if(this.cantidad !== null){
      if(this.cantidad>=1){
        let sub = this.cantidad*Math.round(this.producto.precioIva*100)/100;
        total = sub - (sub*desc);
      }else{
        total = 0.0;
      }
    }else{
      total=0.0;
    }
    return total;
  }
  aumentar(prod){
    let jd = this.productos.indexOf(prod);
    let ax = this.proSeleccionados.map(function(e) { return e.id; }).indexOf(prod.id);
    

    //prod.cantidad = this.proSeleccionados[ax].cantidad;
    if(prod.cantidad >= 0){
      if(prod.cantidad===0){
        prod.cantidad=prod.cantidad+1;
        this.productos[jd].cantidad = prod.cantidad;
        let precioFinal = 0;
        if(prod.stock!=0){
          if(prod.cantidad<=prod.stock){
            this.productos[jd].total = prod.cantidad * Math.round(prod.precioIva*100)/100 ;
            prod.total = prod.cantidad* Math.round(prod.precioIva*100)/100;
            precioFinal = prod.precioIva;
          }else{
            this.productos[jd].total = prod.stock * Math.round(prod.precioIva*100)/100 ;
            prod.total = prod.stock * Math.round(prod.precioIva*100)/100;
            precioFinal = prod.precioIva;
          }
        }else{
          this.productos[jd].total = 0;
          prod.total = 0;
          precioFinal = 0;
        }
        this.productos[jd].ti=true;
        if(this.preventaSelect2==="-1"){
          this.productos[jd].color ='#CFFABA';
        }
        else{
          this.productos[jd].preventa = this.preventaSelect2;
          this.productos[jd].color =  '#7DFFF9'
        }
       // this.proSeleccionados.push(this.productos[jd]);
        let prv = this.preventaSelect2;
        if(this.productos[jd].preventa!==null){
          prv = this.productos[jd].preventa;
        }
        let tmp = {
          id : prod.id,
          cantidad : prod.cantidad,
          total : prod.total,
          precio : precioFinal,
          preventa : prv
        }
        this.database.insertarProductotmp(tmp).then(res=>{
          this.database.obtenerTotalProductosTmp().then(ressa=>{
            let res = ressa;
            if(res!==null && res !== undefined){
              this.totalFinal = Number(res);
            }else{
              this.totalFinal = 0.0;
            
            } 
            this.database.obtenerCantidadProductosTmp().then(res=>{
              let dd;
              dd = res;
              this.cantProd = dd;
              
            })
          }).catch(err=>{
          });
        }).catch(er=>{
          console.log('Error al insertar tmp');
        });
      }else{
        prod.cantidad=Number(prod.cantidad)+Number(1);
        this.productos[jd].cantidad = prod.cantidad;
         let precioFinal = 0;
        if(prod.stock!=0){
          if(prod.cantidad<=prod.stock){
            this.productos[jd].total = prod.cantidad * Math.round(prod.precioIva*100)/100 ;
            prod.total = prod.cantidad* Math.round(prod.precioIva*100)/100;
            precioFinal = prod.precioIva;
          }else{
            this.productos[jd].total = prod.stock * Math.round(prod.precioIva*100)/100 ;
            prod.total = prod.stock * Math.round(prod.precioIva*100)/100;
            precioFinal = prod.precioIva;
          }
        }
        if(this.productos[jd].preventa ===null || this.preventaSelect2 === "-1"){
          this.productos[jd].color ='#CFFABA';
        }
        else{
          this.productos[jd].color =  '#7DFFF9'
        }
        this.productos[jd].ti=true;
        let prv = this.preventaSelect2;
        if(this.productos[jd].preventa!==null){
          prv = this.productos[jd].preventa;
        }
        let tmp = {
          id : prod.id,
          cantidad : prod.cantidad,
          total : prod.total,
          precio : precioFinal,
          preventa : prv
        }
        this.database.actualizarProductotmp(tmp).then(res=>{
          this.database.obtenerTotalProductosTmp().then(ressa=>{
            let res = ressa;
            if(res!==null && res !== undefined){
              this.totalFinal = Number(res);
            }else{
              this.totalFinal = 0.0;
            
            }
            this.database.obtenerCantidadProductosTmp().then(res=>{
              let dd;
              dd = res;
              this.cantProd = dd;
              
            })
          }).catch(err=>{
          });
        }).catch(er=>{
          console.log('Error al actualizar tmp');
        });
      }   
    }
    this.virtualScroll.resize();
  }
  disminuir(prod){
    
    let jd = this.productos.indexOf(prod)
    let ax = this.proSeleccionados.map(function(e) { return e.id; }).indexOf(prod.id);    
    if(prod.cantidad >= 1){
      if(prod.cantidad===1){
        prod.cantidad=prod.cantidad-1;
        this.productos[jd].cantidad = prod.cantidad;
        this.productos[jd].color ='transparent';
        this.productos[jd].total = 0;
        this.productos[jd].ti=false;
        if(this.preventaSelect2==="-1" && this.productos[jd].preventa !==null && this.productos[jd].preventa !=="-1")
          this.productos[jd].precioIva=this.productos[jd].precioIva2;
        this.productos[jd].preventa=null;
        // if(ax!==-1){
        //   this.proSeleccionados.splice(ax,1);
        // }
        this.database.eliminarProductotmp(prod).then(res=>{
          this.database.obtenerTotalProductosTmp().then(ressa=>{
            let res = ressa;
            if(res!==null && res !== undefined){
              this.totalFinal = Number(res);
            }else{
              this.totalFinal = 0.0;
            
            }
            this.database.obtenerCantidadProductosTmp().then(res=>{
              let dd;
              dd = res;
              this.cantProd = dd;
              
            })
          }).catch(err=>{
          });
        }).catch(er=>{
          console.log('Error al eliminar tmp');
        });
      }else{
        prod.cantidad=prod.cantidad-1;
        this.productos[jd].cantidad = prod.cantidad;
        let precioFinal = 0;
        if(prod.stock!=0){
          if(prod.cantidad<=prod.stock){
            this.productos[jd].total = prod.cantidad * Math.round(prod.precioIva*100)/100 ;
            prod.total = prod.cantidad* Math.round(prod.precioIva*100)/100;
            precioFinal = prod.precioIva;
          }else{
            this.productos[jd].total = prod.stock * Math.round(prod.precioIva*100)/100 ;
            prod.total = prod.stock * Math.round(prod.precioIva*100)/100;
            precioFinal = prod.precioIva;
          }
        }else{
          this.productos[jd].total = 0;
          prod.total = 0;
          precioFinal = 0;
        }
        this.productos[jd].ti=true;
        // if(ax!==-1){
        //   this.proSeleccionados[ax].cantidad = prod.cantidad;
        // }
       
        // if(ax!==-1){
        //   this.proSeleccionados[ax].cantidad = prod.cantidad;
        //   this.proSeleccionados[ax].total = prod.total;
        // }
        let prv = this.preventaSelect2;
        if(this.productos[jd].preventa!==null){
          prv = this.productos[jd].preventa;
        }
        let tmp = {
          id : prod.id,
          cantidad : prod.cantidad,
          total : prod.total,
          precio : precioFinal,
          preventa : prv
        }
        // if(ax!==-1){
        //   this.proSeleccionados[ax] = this.productos[jd];
        // }
        this.database.actualizarProductotmp(tmp).then(res=>{
          this.database.obtenerTotalProductosTmp().then(ressa=>{
            let res = ressa;
            if(res!==null && res !== undefined){
              this.totalFinal = Number(res);
            }else{
              this.totalFinal = 0.0;
            
            }
            this.database.obtenerCantidadProductosTmp().then(res=>{
              let dd;
              dd = res;
              this.cantProd = dd;
              
            })
          }).catch(err=>{
          });
        }).catch(er=>{
          console.log('Error al actualizar tmp');
        });
      }
    }
    this.virtualScroll.resize();
  }
  cambioCantidad(prod){

  }
  limpiarFiltros(){
    this.codigoFiltro="";
    this.preventaSelect=-1;
    this.preventaSelect2 = "-1";
    this.clasificacionSelect = -1;
    this.marcaSelect=-1;
    this.modeloSelect = -1;
    this.nuevo= false;
    this.llegado = false;
    this.soloPedidos = false;
    this.tieneFiltro = false;
    this.promoFiltro = false;
    this.buscarPorCodigo();
  }
  protected async buscarPorCodigo(){
      let loader = this.load.create({
        content:"Cargando...",
        //duration: 100
      });
      await this.content.scrollTo(0, 0, 0);
      this.virtualScroll.scrollUpdate({ scrollTop: 0 } as any);
      loader.present().then(()=>{
        //  if(this.productos.length>0){
        //     this.content.scrollTo(0,1,500).then(()=>{

        //     });
        //   }
        
        this.mostrarLista = true; 
        this.pos = 72;
        this.productos = [];          
        this.database.obtenerProductosPorCodigo2(this.codigoFiltro,this.clasificacionSelect,this.marcaSelect,
          this.preventaSelect2,this.cliente.listaPrecios,this.nuevo,this.modeloSelect,
          this.soloPedidos,this.parIva, this.promoFiltro,this.llegado).then(res =>{
          
            this.mostrarLista = true;
            this.virtualClass ='';
          this.productosAux = res;
          let num;
          if(this.productosAux.length>0){
            if(this.productosAux.length>72){
            for(let xd = this.pos-72; xd<this.pos;xd++ ){
              if(this.productosAux[xd]!==null && this.productosAux[xd]!==undefined){
              this.database.obtenerUnaImagen(this.productosAux[xd].id).then(igr => {
                if(this.productosAux[xd]!==null && this.productosAux[xd]!==undefined){
                                let dd;
                                dd =igr;
                                let pr = this.productosAux[xd];
                                if(igr!==null){
                                  pr.imagen = dd.imagen;
                                  pr.ext = dd.extension;
                                  pr.mostrar = 'data:image/jpeg;base64,'+dd.img;
                                if(dd.img !==null && dd.img !== undefined){
                                    pr.mostrar = 'data:image/jpeg;base64,'+dd.img;
                                  }else{
                                    pr.mostrar = 'assets/images/no_image.png'
                                  }
                                }else{
                                    pr.imagen = 'no_imagen.png';
                                    pr.ext ='png';
                                    pr.mostrar = 'assets/images/no_image.png'
                                }    
                                this.productos.push(pr);
                                if(xd === (this.pos-1)){
                                  console.log('Entra a finalizar');
                                  this.virtualScroll.resize(); 
                                  loader.dismiss();
                                }                      
                              }else{
                                if(xd === (this.pos-1)){
                                  console.log('Entra a finalizar');
                                  this.virtualScroll.resize(); 
                                  loader.dismiss();
                                }  
                              }
                              
                              }).catch(egrd=>{
                                this.alerta.mostrarError('Error',egrd.message);
                              });
                            }else{
                              if(xd === (this.pos-1)){
                                console.log('Entra a finalizar');
                                this.virtualScroll.resize(); 
                                loader.dismiss();
                              }  
                            }
            }
          }else{
            for(let xd = 0; xd<this.productosAux.length;xd++){
              if(this.productosAux[xd]!==null && this.productosAux[xd]!==undefined){
                this.database.obtenerUnaImagen(this.productosAux[xd].id).then(igr => {
                  if(this.productosAux[xd]!==null && this.productosAux[xd]!==undefined){
                  let dd;
                  dd =igr;
                  let pr = this.productosAux[xd];
                  if(igr!==null){
                    pr.imagen = dd.imagen;
                    pr.ext = dd.extension;
                    pr.mostrar = 'data:image/jpeg;base64,'+dd.img;
                    if(dd.img !==null && dd.img !== undefined){
                      pr.mostrar = 'data:image/jpeg;base64,'+dd.img;
                    }else{
                      pr.mostrar = 'assets/images/no_image.png'
                    }
                  }else{
                    pr.imagen = 'no_imagen.png';
                    pr.ext ='png';
                    pr.mostrar = 'assets/images/no_image.png'
                  }
                  this.productos.push(pr);
                  if(xd === (this.productosAux.length-1)){
                    console.log('Entra a finalizar d');
                    this.virtualScroll.resize(); 
                    loader.dismiss();
                  }
                }else{
                  if(xd === (this.productosAux.length-1)){
                    console.log('Entra a finalizar d');
                    this.virtualScroll.resize(); 
                    loader.dismiss();
                  }
                }
              }).catch(egrd=>{
                this.alerta.mostrarError('Error',egrd.message);
              });
            }else{
              if(xd === (this.productosAux.length-1)){
                console.log('Entra a finalizar d');
                this.virtualScroll.resize(); 
                loader.dismiss();
              }
            }
          }
          }
        }else{
          this.productos = [];
          let toas = this.toastCtrl.create({
            duration:1500,
            position:'middle',
            message:"No existen datos"
          });
          toas.present();
          loader.dismiss();
        }
        }).catch(error=>{
          loader.dismiss();
          this.alerta.mostrarError('Error',error);
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
}
