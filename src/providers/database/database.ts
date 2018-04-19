import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { SQLite,SQLiteObject } from '@ionic-native/sqlite';
import { BehaviorSubject } from 'rxjs/Rx';
import { Storage } from '@ionic/storage';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { Platform, LoadingController } from 'ionic-angular';
import { AlertaProvider } from '../../providers/alerta/alerta';
import { Device } from '@ionic-native/device';

@Injectable()
export class DatabaseProvider {
  database: SQLiteObject;
  private databaseReady: BehaviorSubject <Boolean>;
  data: any;
  versionDB=59;
  constructor(public device:Device, public load: LoadingController, public alerta:AlertaProvider,public http: Http,private sqlitePorter: SQLitePorter,private storage: Storage,private sqlite:SQLite, private platform: Platform) {

        this.storage.get('versionDB').then(res=>{
          if(this.versionDB==res){
           
            console.log('No borra');
          }else{
            console.log('borrra al DB');
            this.storage.clear().then(()=>{
              console.log('DEBERIA BORRAR LA BASE');
              this.storage.set('database_filled',null);
              this.storage.set('database_filled',false);
            });
            this.storage.set('database_filled',null);
            this.storage.set('database_filled',false);
            
          }
        }).catch(e => {
          
          console.log('eee=> ',e)
        });
    

    this.databaseReady = new BehaviorSubject(false);
    this.platform.ready().then(()=>{
        this.sqlite.create({
          name: 'dinamo.db',
          location: 'default'
        }).then((db: SQLiteObject)=>{
          this.database=db;
          this.storage.get('database_filled').then(val=>{
            console.log('Val -> ',val);
            
            if(val){
              this.databaseReady.next(true);
            }else{
              this.fillDatabase();
            }
          })
        });
    });
  } 

/* >>>>>>>>>>>>>>>>>>>>>>>>>> ESTADO DE LA BASE <<<<<<<<<<<<<<<<<<<<<<<<<<*/
  getDatabaseState(){
    return this.databaseReady.asObservable();
  }

/* >>>>>>>>>>>>>>>>>>>>>>>>>> LLENAR LA BASE <<<<<<<<<<<<<<<<<<<<<<<<<<*/
  fillDatabase(){
    console.log('Entra a llenar la base de datos');
    this.http.get('assets/sql/creacion.sql')
    .map(res=> res.text())
    .subscribe(sql => {
      this.sqlitePorter.importSqlToDb(this.database,sql)
      .then(data => {
        this.databaseReady.next(true);
         this.storage.set('versionDB',this.versionDB);
        this.storage.set('database_filled',true);
      }).catch(e=> console.log(e));
    });
  }
  /* >>>>>>>>>>>>> PARAMETORS <<<<<<<< */
  obtenerParametros(){
      return this.database.executeSql("SELECT * FROM parametro",[]).then(data => {
        let parametros=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            parametros.push({id: data.rows.item(i).id,nombre: data.rows.item(i).nombre,valor: data.rows.item(i).valor})
          }
        }
        return parametros;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
  }

  actualizarParametros(parametro){
        return this.database.executeSql("UPDATE parametro SET valor=? WHERE id=?",[parametro.valor,parametro.id]).then(res =>{
            //console.log('Actualiza el parametro ',parametro);
            this.storage.set('database_filled',true);
            return res;
        }).catch(e => console.log(e));
  }

  /* >>>>>>>>>>>>>>>>>>>>>>>>>> USUARIOS <<<<<<<<<<<<<<<<<<<<<<<<<<*/
   getUsuarios(parametros) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servUsuario/obtenerUsuarios";
        this.http.get(url)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
    borrarUsuarios(){
	    return this.database.executeSql("DELETE FROM usuario",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    borrarEmpleado(){
	    return this.database.executeSql("DELETE FROM empleado ",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarUsuario(usuario){
	    return this.database.executeSql("INSERT INTO usuario (id) VALUES (?)",[usuario.id]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    }).catch(e => console.log('ERROR Usuario===> ',e));
	  }
    insertarEmpleado(empleado, idUsu){
	    return this.database.executeSql("INSERT INTO empleado (usuario,idEmpleado,idEmpresa, nombreEmpresa) VALUES (?,?,?,?)",[idUsu, empleado.idEmpleado, empleado.idEmpresa,empleado.nombreEmpresa]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    }).catch(e => console.log('ERROR Empleado===> ',e));
    }
    obtenerUsuario(codigo){
	    return this.database.executeSql("SELECT * FROM empleado where usuario=?",[codigo]).then(data => {
	      let empleados=[];
         if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            empleados.push({usuario: data.rows.item(i).usuario,idEmpleado: data.rows.item(i).idEmpleado,idEmpresa: data.rows.item(i).idEmpresa, nombreEmpresa:data.rows.item(i).nombreEmpresa});
          }
        }
        return empleados;
	    }).catch( e =>{
	      console.log('eroor==> ',e);
	      return null;
	    })
    }

    /* >>>>>>>>>>>>>>>>>>>>>>>>>> IMAGENES <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getImagenes(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servImagen/obtenerImagenes";
        this.http.post(url,uac)
        .subscribe(
          data => {
            console.log('Llega--');
            
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     obtenerImagenes(){
      return this.database.executeSql("SELECT id,fechaact as fecha FROM imagen_producto order by producto",[]).then(data => {
        let parametros=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            parametros.push(data.rows.item(i));
          }
        }
        return parametros;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
  }
   
    obtenerImagenesPorProducto(id){
        return new Promise ((resolve,reject) => {
          this.database.executeSql("SELECT img, imagen, extension from imagen_producto where producto = ? order by orden asc",[id]).then(data => {
          let res=[];
          if(data.rows.length >0){
            for(let i=0; i<data.rows.length;i++){
               res.push(data.rows.item(i));
               if(i === (data.rows.length-1)){
                  resolve(res);
               }
            }
          }else{
            resolve(res);
          }
          }, err =>{
            reject(err);
          })
        });
      }
    insertarImagen(img){
      // console.log('Va a insertar ',img);
      
	    return new Promise((resolve,reject) =>{this.database.executeSql("INSERT INTO imagen_producto (id,producto,tipo,imagen,extension,orden,fechaact, img) VALUES (?,?,?,?,?,?,?,?)",[
        img.id,
        img.producto,
        img.tipo,
        img.imagen,
        img.extension,
        img.orden,
        img.fechaact,
        img.img
      ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    actualizarImagen(img){
    
        // console.log('Va a actualziar ',img);
      
	    return new Promise((resolve,reject) =>{this.database.executeSql("update imagen_producto  set producto =?,imagen=?,extension=?,orden=?,fechaact=?, img = ? where id = ?",[
        img.producto,
        img.imagen,
        img.extension,
        img.orden,
        img.fechaact,
        img.img,
        img.id
      ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    eliminarImagen(img){
	    return new Promise((resolve,reject)=>{this.database.executeSql("delete from imagen_producto where id = ?",[
        img.id
      ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    /* >>>>>>>>>>>>>>>>>>>>>>>>>> CLIENTES <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getClientes(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servCliente/obtenerClientesM";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
    
    borrarClientes(){
	    return this.database.executeSql("DELETE FROM cliente",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    borrarClientesNuevo(){
	    return this.database.executeSql("DELETE FROM cliente_movil_nuevo",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarCliente(cliente){
      return new Promise ((resolve, reject)=> {this.database.executeSql("INSERT INTO cliente (id,identificacion,nombre, pol, listapre,telefono,email,diasplazo,descuento,activo) VALUES (?,?,?,?,?,?,?,?,?,?)",
          [
            cliente.id,
            cliente.identificacion,
            cliente.nombres,
            cliente.politica,
            cliente.listaPrecios,
            cliente.telefono,
            cliente.email,
            cliente.diasplazo,
            cliente.descuento,
            cliente.activo
          ]).then(res =>{ 
	            this.storage.set('database_filled',true);
	      resolve(res)
	    }).catch(e => {reject(e)})});
    }
    obtenerClientesRecibo(nombre){
      return this.database.executeSql("select cli.id, cli.nombre, cli.identificacion, COALeSCE(round((SELECT sum(COALESCE(saldo,0)) from ddocumento where idcli = cli.id and round(saldo,2) > 0),2),0.00) as totalsaldo from cliente cli where upper(cli.nombre) LIKE '%"+nombre.toUpperCase()+"%'  order by 4 desc",[]).then(data => {
        let parametros=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            parametros.push(
              {
                id: data.rows.item(i).id,
                nombre: data.rows.item(i).nombre,
                identificacion:data.rows.item(i).identificacion,
                saldo:data.rows.item(i).totalsaldo
              }
            );
          }
        }
        return parametros;
      }, err =>{
        console.log('Error: ',err);
        return [];
      });
    }
    obtenerClientesSaldosF(nombre, todos){
      var extra="";
      var select ="";
      if(nombre.trim().length>0){
        extra+=" and UPPER(nombre) LIKE '%"+nombre.toUpperCase()+"%'";
      }
      if(todos ===false){
        extra+=" and cli.activo = 1";
      } 
      select ="select cli.id, cli.nombre, sum(saldo) as saldo from cliente cli, ddocumento ddo where ddo.idcli = cli.id "+extra +" group by 1,2 order by 3 desc " ; 
      console.log(select);
      
	    return this.database.executeSql(select,[]).then(data => {
        let parametros=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            parametros.push(data.rows.item(i));
          }
        }
        return parametros;
      }, err =>{
        console.log('Error: ',err);
        return [];
      });
    }
    obtenerClientes(nombre,zona,todos){
      var extra="";
      var select ="";
      if(zona!==-1){
        extra+=" and clr.zona = "+zona;
      }
      if(todos ===false){
        extra+=" and cli.activo = 1";
      } 
      if(nombre.trim().length>0){
        extra+=" and UPPER(nombre) LIKE '%"+nombre.toUpperCase()+"%'";
      }
      select ="select cli.*, dir.id as idDir, dir.calleprincipal, clr.cliOrden as orden, (select COALESCE(count(cpe.id),0.0) from cpedido cpe where cpe.sincronizado = 0 and cpe.cliente = cli.id ) as cantPe, COALESCE((select sum(saldo) from ddocumento where idcli = cli.id),0) as saldodeuda  from cliente cli, cli_ruta clr, direccion dir where dir.idcliente = cli.id and clr.idCli = cli.id and clr.direccionCliente = dir.id "+extra; 
      console.log(select);
      
	    return this.database.executeSql(select,[]).then(data => {
        let parametros=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            let cant = data.rows.item(i).cantPe;
            let color:string = 'transparent';
            if(cant>0){
              color = '#A9F5F2';
            }
            parametros.push(
              {
                id: data.rows.item(i).id,
                nombre: data.rows.item(i).nombre,
                telefono:data.rows.item(i).telefono,
                identificacion:data.rows.item(i).identificacion,
                listaPrecios:data.rows.item(i).listapre,
                politica:data.rows.item(i).pol,
                email:data.rows.item(i).email,
                idDir: data.rows.item(i).idDir,
                dir: data.rows.item(i).calleprincipal,
                diasplazo:data.rows.item(i).diasplazo,
                descuento : data.rows.item(i).descuento,
                orden:data.rows.item(i).orden,
                cantPe:cant,
                color:color,
                saldodeuda:data.rows.item(i).saldodeuda
              }
            );
          }
        }
        return parametros;
      }, err =>{
        console.log('Error: ',err);
        return [];
      });
    }
    obtenerClientePorSecuencia(zona,orden){
      var select ="";
      select ="select cli.*, dir.id as idDir, dir.calleprincipal, clr.cliOrden as orden, (select COALESCE(count(cpe.id),0.0) from cpedido cpe where cpe.sincronizado = 0 and cpe.cliente = cli.id ) as cantPe from cliente cli, cli_ruta clr, direccion dir where clr.cliOrden > "+orden+" and dir.idcliente = cli.id and clr.idCli = cli.id and clr.zona = "+zona+" order by clr.cliOrden asc limit 1"; 
	    return new Promise((resolve, reject) => {this.database.executeSql(select,[]).then(data => {
          let cliente = {}
          if(data.rows.length >0){
            let cant = data.rows.item(0).cantPe;
            let color:string = 'white';
            if(cant>0){
              color = '#A9F5F2';
            }
                cliente = {
                  id: data.rows.item(0).id,
                  nombre: data.rows.item(0).nombre,
                  telefono:data.rows.item(0).telefono,
                  identificacion:data.rows.item(0).identificacion,
                  listaPrecios:data.rows.item(0).listapre,
                  politica:data.rows.item(0).pol,
                  email:data.rows.item(0).email,
                  idDir: data.rows.item(0).idDir,
                  dir: data.rows.item(0).calleprincipal,
                  diasplazo:data.rows.item(0).diasplazo,
                  descuento : data.rows.item(0).descuento,
                  orden:data.rows.item(0).orden,
                  cantPe:cant,
                  color:color
                }
                resolve(cliente); 
          }else{
            cliente = {
              id:null
            }
            resolve(cliente); 
          }
        }, err =>{
          console.log('Error: ',err);
          reject(err);
        })
      });
    }
    obtenerClientePorId(id){
      var select ="";
      select ="select cli.*, dir.id as idDir, dir.calleprincipal, 0 as orden, (select COALESCE(count(cpe.id),0.0) from cpedido cpe where cpe.sincronizado = 0 and cpe.cliente = cli.id ) as cantPe from cliente cli,  direccion dir where cli.id = "+id+" and dir.idcliente = cli.id"; 
	    return new Promise((resolve, reject) => {this.database.executeSql(select,[]).then(data => {
          let cliente = {}
          if(data.rows.length >0){
            let cant = data.rows.item(0).cantPe;
            let color:string = 'white';
            if(cant>0){
              color = '#A9F5F2';
            }
                cliente = {
                  id: data.rows.item(0).id,
                  nombre: data.rows.item(0).nombre,
                  telefono:data.rows.item(0).telefono,
                  identificacion:data.rows.item(0).identificacion,
                  listaPrecios:data.rows.item(0).listapre,
                  politica:data.rows.item(0).pol,
                  email:data.rows.item(0).email,
                  idDir: data.rows.item(0).idDir,
                  dir: data.rows.item(0).calleprincipal,
                  diasplazo:data.rows.item(0).diasplazo,
                  descuento : data.rows.item(0).descuento,
                  orden:data.rows.item(0).orden,
                  cantPe:cant,
                  color:color
                }
                resolve(cliente); 
          }else{
            cliente = {
              id:null
            }
            resolve(cliente); 
          }
        }, err =>{
          console.log('Error: ',err);
          reject(err);
        })
      });
    }
    /* >>>>>>>>>>>>>>>>>>>>>>>>>> DLISTA PRE <<<<<<<<<<<<<<<<<<<<<<<<<<*/
     getDlistaPre(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servDlistapre/recuperarDlistapre";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
    borrarDlistaPre(){
	    return this.database.executeSql("DELETE FROM dlistapre",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarDlistaPre(dlistaPre){
	    return new Promise((resolve,reject) =>{this.database.executeSql("INSERT INTO dlistapre (id,producto,precio,fechaact,tipo,iddlp) VALUES (?,?,?,?,?,?)",[dlistaPre.listapre,dlistaPre.producto,dlistaPre.precio,dlistaPre.fechaact, dlistaPre.tipo,dlistaPre.iddlp]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    actualizarDlistaPre(img){
	    return new Promise((resolve,reject) =>{this.database.executeSql("update dlistapre  set producto =?,id=?,precio=?,fechaact=?,tipo=? where producto = ? and id =  ?",[
        img.producto,
        img.listapre,
        img.precio,
        img.fechaact,
        img.tipo,
        img.producto,
        img.listapre
        
      ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }

    eliminarDlistaPre(img){
	    return new Promise((resolve,reject)=>{this.database.executeSql("delete from dlistapre where iddlp = ?",[
        img.iddlp
      ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    obtenerDlistaPre(){
	    return this.database.executeSql("SELECT id as listapre, producto, precio, fechaact, tipo, iddlp FROM dlistapre",[]).then(data => {
        let parametros=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            parametros.push(
              data.rows.item(i)
            );
          }
        }
        return parametros;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerIdDlistaPre(){
	    return this.database.executeSql("SELECT distinct id FROM dlistapre limit 1",[]).then(data => {
        let parametros={};
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
            parametros = {
              id :data.rows.item(0).id
            }
        }
        return parametros;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerPrecio(listapre, producto){
	    return this.database.executeSql("SELECT precio FROM dlistapre where id = ? and producto = ?",[listapre,producto]).then(data => {
        let precio = 0.0;
        if(data.rows.length >0){
          precio = data.rows.item(0).precio;
        }
        return precio;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }

    /* >>>>>>>>>>>>>>>>> PRODUCTOS TEMPORALES <<<<<<<<<<<<<<<<<<<<*/

    borrarProductostmp(){
	    return this.database.executeSql("DELETE FROM producto_tmp",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    obtenerCantidadProductosTmp(){
	    return this.database.executeSql("SELECT count(distinct id) as conteo FROM producto_tmp ",[]).then(data => {
       let datos = 0;
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          
          datos = data.rows.item(0).conteo;
        }
        return datos;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    existeEnTmp(idPro){
      return this.database.executeSql("SELECT id  FROM producto_tmp where id = ?",[idPro]).then(data => {
        let datos = 0;
         //console.log('data parametros: ',data)
         if(data.rows.length >0){
           
           datos = 1;
         }
         return datos;
       }, err =>{
         console.log('Error: ',err);
         return 0;
       })
    }
    obtenerTotalProductosTmp(){
	    return this.database.executeSql("SELECT sum(total) as conteo FROM producto_tmp",[]).then(data => {
       let datos = 0;
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          
          datos = data.rows.item(0).conteo;
        }
        return datos;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerProductosTmp(lpr,par){
      var fA = new Date();
      var anio = fA.getFullYear();
      return this.database.executeSql("SELECT distinct pro.*, round(COALESCE(lpr.precio,0.0),2) as precio, COALESCE(tmp.cantidad,0.0) as cantidad, tmp.total totalPre, tmp.precio precioPre, tmp.preventa, COALESCE(s.saldoInicial,0) as saldofinal "+
      "FROM producto pro left join saldoinv s on s.producto = pro.id and s.periodo = "+anio+", producto_tmp tmp, dlistapre lpr where lpr.id = "+lpr+" and lpr.producto = pro.id and tmp.id = pro.id",[]).then(data => {
        let productos=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          
          for(var i=0; i<data.rows.length;i++){
            let color:string = 'transparent';
            let nu = false;
            let precio = 0.0;
            if(data.rows.item(i).nuevo ===1)
              nu = true;
            if(data.rows.item(i).cantidad>0){
              color = '#CFFABA';
            }
            if(data.rows.item(i).impuesto === 1){
              precio = data.rows.item(i).precioPre / (1 + (Number(par.valor)/100));
            }
            productos.push(
              {
                id: data.rows.item(i).id,
                nombre: data.rows.item(i).nombre,
                umedida:data.rows.item(i).umedida,
                stock:data.rows.item(i).stock,
                promocion:data.rows.item(i).promocion,
                idTipo:data.rows.item(i).idTipo,
                impuesto: data.rows.item(i).impuesto,
                codigo: data.rows.item(i).codigo,
                precio:data.rows.item(i).precio,
                precioIva:data.rows.item(i).precioPre,
                ext:"",
                imagen:"",
                nuevo:nu,
                cantidad:data.rows.item(i).cantidad,
                color:color,
                total:data.rows.item(i).total,
                saldo:data.rows.item(i).saldofinal
              }
            );
          }
        }
        return productos;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    insertarProductotmp(pro){
      console.log('Va a insertar producto temporal -> ',pro);
      
      return new Promise((resolve,reject) =>{this.database.executeSql("INSERT INTO producto_tmp (id,cantidad,total,precio,preventa) VALUES (?,?,?,?,?)",
      [
        pro.id,
        pro.cantidad,
        pro.total,
        pro.precio,
        pro.preventa
      ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    actualizarProductotmp(img){
      console.log('Que va a actualizar ',img);
      
	    return new Promise((resolve,reject) =>{this.database.executeSql("update producto_tmp  set cantidad =?, total = ?,precio=?,preventa=? where id=? ",[
        img.cantidad,
        img.total,
        img.precio,
        img.preventa,
        img.id
        
      ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }

    eliminarProductotmp(img){
	    return new Promise((resolve,reject)=>{this.database.executeSql("delete from producto_tmp where id = ?",[
        img.id
      ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }

    eliminarTodoProductotmp(){
	    return new Promise((resolve,reject)=>{this.database.executeSql("delete from producto_tmp",[
      ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    /* >>>>>>>>>>>>>>>>>>>>>>>>>> PRODUCTOS <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getProductos(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servProductos/recuperarProductos";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarProductos(){
	    return this.database.executeSql("DELETE FROM producto",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    exiteIdProducto(id){
      return new Promise ((resolve,reject)=>{
        this.database.executeSql("select * from producto where id = ?",[id]).then(res=>{
          if(res.rows.length>0)
             resolve(true);
          else
             resolve(false)
        }).catch(err=>{
            reject(err.message);
        }) 
      });
      
    }
    exiteIdFactor(id){
      return new Promise ((resolve,reject)=>{
        this.database.executeSql("select * from factor where id = ?",[id]).then(res=>{
          if(res.rows.length>0)
             resolve(true);
          else
             resolve(false)
        }).catch(err=>{
            reject(err.message);
        }) 
      });
      
    }
    exiteIdImagen(id){
      return new Promise ((resolve,reject)=>{
        this.database.executeSql("select * from imagen_producto where id = ?",[id]).then(res=>{
          if(res.rows.length>0)
             resolve(true);
          else
             resolve(false)
        }).catch(err=>{
            reject(err.message);
        }) 
      });
      
    }
    exiteIdDlistapre(pro,id){
      return new Promise ((resolve,reject)=>{
        this.database.executeSql("select * from dlistapre where producto = ? and id = ?",[pro,id]).then(res=>{
          if(res.rows.length>0)
             resolve(true);
          else
             resolve(false)
        }).catch(err=>{
            reject(err.message);
        }) 
      });
      
    }
    exiteIdProductoModelo(id){
      return new Promise ((resolve,reject)=>{
        this.database.executeSql("select * from producto_modelo where id = ?",[id]).then(res=>{
          if(res.rows.length>0)
             resolve(true);
          else
             resolve(false)
        }).catch(err=>{
            reject(err.message);
        }) 
      });
      
    }
    insertarProducto(producto){
      return new Promise ((resolve,reject) => {this.database.executeSql("INSERT INTO producto (id,nombre,umedida,stock,promocion,idTipo,impuesto,codigo,fechaact,tipo,marca,clasificacion1,nuevo,fichatecnica,promo,promoDescripcion,empaque,urlimg,llegado) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          [ producto.id,
            producto.nombre,
            producto.unidadmedida,
            producto.stock,
            producto.promocion,
            producto.idTipo, 
            producto.impuesto,
            producto.codigo,
            producto.fechaact,
            producto.tipo,
            producto.marca,
            producto.clasificacion1,
            producto.nuevo,
            producto.fichatecnica,
            producto.promo,
            producto.promodesc,
            producto.empaque,
            producto.fechaDisponibilidad,
            producto.lleado
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    actualizarProducto(producto){
      return new Promise ((resolve,reject) => {this.database.executeSql("update producto set nombre = ?, umedida = ?, stock = ?, promocion = ?, idTipo = ?, impuesto = ?, codigo = ?, fechaact = ?, tipo =?, marca = ?, clasificacion1 = ?, nuevo = ?,fichatecnica=?,promoDescripcion=?,promo=?,empaque=?,urlimg=?,llegado = ? where id = ?",
          [ 
            producto.nombre,
            producto.unidadmedida,
            producto.stock,
            producto.promocion,
            producto.idTipo, 
            producto.impuesto,
            producto.codigo,
            producto.fechaact,
            producto.tipo,
            producto.marca,
            producto.clasificacion1,
            producto.nuevo,
            producto.fichatecnica,
            producto.promodesc,
            producto.promo,
            producto.empaque,
            producto.fechaDisponibilidad,
            producto.llegado,
            producto.id
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    eliminarProducto(img){
	    return new Promise((resolve,reject)=>{this.database.executeSql("delete from producto where id = ?",[
        img.id
      ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
     obtenerProductoPorCodigo(codigo){
	    return this.database.executeSql("SELECT * FROM producto where codigo = ? ",[codigo]).then(data => {
        let producto = {};
        if(data.rows.length >0){
           producto = {
                id: data.rows.item(0).id,
                nombre: data.rows.item(0).nombre,
                umedida:data.rows.item(0).umedida,
                stock:data.rows.item(0).stock,
                promocion:data.rows.item(0).promocion,
                idTipo:data.rows.item(0).idTipo,
                impuesto: data.rows.item(0).impuesto,
                codigo: data.rows.item(0).codigo,
                precio:0.0,
                precioIva:0.0,
                nuevo:data.rows.item(0).nuevo
          }
        }
        else{
            producto = {
              id:null
            }
        }
        return producto;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerProductos(nombre){
	    return this.database.executeSql("SELECT * FROM producto where upper(nombre) like '%"+nombre.toUpperCase()+"%' order by codigo, nombre",[]).then(data => {
        let productos=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            productos.push(
              data.rows.item(i)
            );
          }
        }
        return productos;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerProductosSinc(){
	    return this.database.executeSql("SELECT id, nombre, umedida as unidadmedida, stock, promocion, idTipo, impuesto, urlimg, codigo, fechaact, tipo FROM producto ",[]).then(data => {
        let productos=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            productos.push(
              data.rows.item(i)
            );
          }
        }
        return productos;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerUnaImagen(id){
      return new Promise ((resolve,reject) => {
        this.database.executeSql("SELECT img, imagen, extension from imagen_producto where producto = ? order by orden asc limit 1",[id]).then(data => {
        let res=null;
        if(data.rows.length >0){
          res = data.rows.item(0);
          resolve(res);
        }else{
          resolve(res);
        }
        }, err =>{
          reject(err);
        })
      });
    }
    obtenerProductos2(nombre,lpr,parIva){
      var fA = new Date();
      var anio = fA.getFullYear();
      return this.database.executeSql("SELECT distinct pro.*, CASE WHEN round(COALESCE(lpr.precio,0.0),2) = 0 THEN round(pre.precioPreventa,2) ELSE round(COALESCE(lpr.precio,0.0),2) end as precio, "+
      "COALESCE(tmp.cantidad,0.0) as cantidad, COALESCE(s.saldoInicial,0) as stock, tmp.preventa, tmp.precio precioPre, COALESCE(tmp.total,0) totalPre, pro.stock as cantminima, pro.llegado "+
      "FROM producto pro left join preventa pre on pre.producto = pro.id left join producto_tmp tmp on tmp.id = pro.id "+
      "left join saldoinv s on s.producto = pro.id and s.periodo = "+anio+", "+
      "dlistapre lpr where lpr.id = "+
      lpr +
      " and lpr.producto = pro.id and "+
      "upper(pro.nombre) like '%"+nombre.toUpperCase()+"%' order by pro.nombre",[]).then(data => {
        let productos=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            let color:string = 'transparent';
            let nu = false;
            let ti = false;
            let ll = false;
            let pro = false;
            let desc = "Sin promoción";
            if(data.rows.item(i).promoDescripcion !==null && data.rows.item(i).promoDescripcion !== ""){
              desc = data.rows.item(i).promoDescripcion;
            }
            if(data.rows.item(i).promo ===1)
              pro = true;
            if(data.rows.item(i).nuevo ===1)
            nu = true;
            if(data.rows.item(i).llegado ===1)
            ll = true;
            
            if(data.rows.item(i).cantidad>0){
              color = '#CFFABA';
              ti = true;
            }
            
            let precioIva = 0.00;
            let precioIva2 = 0.00;
            if(data.rows.item(i).impuesto === 1){
              precioIva2 = data.rows.item(i).precio * (1 + (Number(parIva.valor)/100));
            }else{
              precioIva2 =data.rows.item(i).precio;
            } 
            precioIva2 =  Math.round(precioIva*100)/100;
            if(data.rows.item(i).preventa === "-1" || data.rows.item(i).preventa === null){
              if(data.rows.item(i).impuesto === 1){
                precioIva = data.rows.item(i).precio * (1 + (Number(parIva.valor)/100));
              }else{
                precioIva =data.rows.item(i).precio;
              } 
              precioIva =  Math.round(precioIva*100)/100;
            }else{
              if(color!=="transparent")
                color ='#7DFFF9';
              precioIva = Math.round(data.rows.item(i).precioPre*100)/100;
            }

            let idpro = data.rows.item(i).id;
            productos.push(
              {
                id: data.rows.item(i).id,
                nombre: data.rows.item(i).nombre,
                umedida:data.rows.item(i).umedida,
                stock:data.rows.item(i).stock,
                promocion:data.rows.item(i).promocion,
                idTipo:data.rows.item(i).idTipo,
                impuesto: data.rows.item(i).impuesto,
                codigo: data.rows.item(i).codigo,
                precio:data.rows.item(i).precio,
                precioIva:precioIva,
                ext:"",
                imagen:"",
                nuevo:nu,
                cantidad:data.rows.item(i).cantidad,
                color:color,
                total:data.rows.item(i).totalPre,
                ti:ti,
                fichatecnica:data.rows.item(i).fichatecnica,
                precioIvaF:precioIva2,
                preventa:data.rows.item(i).preventa,
                promo:pro,
                promoDescripcion:desc,
                empaque:data.rows.item(i).empaque,
                cantminima: data.rows.item(i).cantminima,
                fechaDispon: data.rows.item(i).urlimg,
                llegado :ll
              }
            );


          }
        }
        return productos;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerProductosPorCodigo2(nombre, cla, marca, importacion, lpr, nuevo, modelo,soloPedidos, parIva,promo,llegado){
      var fA = new Date();
      var anio = fA.getFullYear();
      
      var cadenaExtra = "";
      var select = "";
       if(cla!==-1){
        cadenaExtra+=" and pro.clasificacion1 = "+cla;
      }
      if(marca !== -1){
        cadenaExtra+=" and pro.marca = "+marca;
      }
      if(llegado === true){
        cadenaExtra+=" and pro.llegado = 1";
      }
      if(nuevo === true){
        cadenaExtra+=" and pro.nuevo = 1";
      }
      if(soloPedidos === true){
        cadenaExtra+=" and tmp.id is not null";
      }
      if(promo === true){
        cadenaExtra+=" and pro.promo = 1 ";
      }
      if(modelo===-1){
        if(importacion==="-1" || importacion === -1){
          select = "SELECT distinct pro.id,pro.nombre,pro.umedida,pro.promocion,pro.idTipo,pro.impuesto, pro.codigo,pro.fichatecnica,pro.empaque, CASE WHEN round(COALESCE(lpr.precio,0.0),2) = 0 THEN round(pre.precioPreventa,2) ELSE round(COALESCE(lpr.precio,0.0),2) end as precio, COALESCE(tmp.cantidad,0.0) as cantidad, COALESCE(s.saldoInicial, 0) as stock, tmp.preventa, tmp.precio precioPre, COALESCE(tmp.total,0) totalPre, pro.stock as cantminima, pro.promo, pro.nuevo,pro.urlimg ,pro.llegado FROM producto pro left join preventa pre on pre.producto = pro.id left join producto_tmp tmp on tmp.id = pro.id left join saldoinv s on s.producto = pro.id and s.periodo = "+anio+", dlistapre lpr where lpr.id = "+lpr+" and lpr.producto = pro.id and (upper(pro.codigo) like '%"+nombre.toUpperCase()+"%' or upper(pro.nombre) like '%"+nombre.toUpperCase()+"%') "+cadenaExtra+" order by pro.nombre";
        }
        else{
          select = "SELECT distinct pro.id,pro.nombre,pro.umedida,pro.promocion,pro.idTipo,pro.impuesto, pro.codigo,pro.fichatecnica,pro.empaque, round(COALESCE(lpr.precio,0.0),2) as precio, COALESCE(tmp.cantidad,0.0) as cantidad, COALESCE(s.saldoInicial, 0) as stock, pre.cantidad preStock, pre.precioPreventa, tmp.preventa, tmp.precio precioPre, COALESCE(tmp.total,0) totalPre, pro.stock as cantminima, pro.promo, pro.nuevo,pro.urlimg,pro.llegado FROM producto pro left join producto_tmp tmp on tmp.id = pro.id left join saldoinv s on s.producto = pro.id and s.periodo = "+anio+", preventa pre, dlistapre lpr "+ 
                  "where lpr.id = "+lpr+" and lpr.producto = pro.id and pre.fechaDispon = '"+importacion+"'  and pre.producto = pro.id and (upper(pro.codigo) like '%"+nombre.toUpperCase()+"%' or upper(pro.nombre) like '%"+nombre.toUpperCase()+"%') "+cadenaExtra+" order by pro.nombre";
        }
     }else{
        if(importacion==="-1" || importacion === -1){
          select = "SELECT distinct pro.id,pro.nombre,pro.umedida,pro.promocion,pro.idTipo,pro.impuesto, pro.codigo,pro.fichatecnica,pro.empaque, CASE WHEN round(COALESCE(lpr.precio,0.0),2) = 0 THEN round(pre.precioPreventa,2) ELSE round(COALESCE(lpr.precio,0.0),2) end as precio, COALESCE(tmp.cantidad,0.0) as cantidad, COALESCE(s.saldoInicial, 0) as stock, tmp.preventa, tmp.precio precioPre, COALESCE(tmp.total,0) totalPre, pro.stock as cantminima, pro.promo, pro.nuevo,pro.urlimg,pro.llegado FROM producto pro left join preventa pre on pre.producto = pro.id left join producto_tmp tmp on tmp.id = pro.id left join saldoinv s on s.producto = pro.id and s.periodo = "+anio+", dlistapre lpr,producto_modelo pm where pm.producto = pro.id and pm.modelo = "+modelo+" and lpr.id = "+lpr+" and lpr.producto = pro.id and (upper(pro.codigo) like '%"+nombre.toUpperCase()+"%' or upper(pro.nombre) like '%"+nombre.toUpperCase()+"%') "+cadenaExtra+" order by pro.nombre";
        }
        else{
          select = "SELECT distinct distinct pro.id,pro.nombre,pro.umedida,pro.promocion,pro.idTipo,pro.impuesto, pro.codigo,pro.fichatecnica,pro.empaque, round(COALESCE(lpr.precio,0.0),2) as precio, COALESCE(tmp.cantidad,0.0) as cantidad, COALESCE(s.saldoInicial, 0) as stock, tmp.preventa, tmp.precio precioPre, COALESCE(tmp.total,0) totalPre, pro.stock as cantminima, pro.promo, pro.nuevo,pro.urlimg,pro.llegado FROM producto pro left join producto_tmp tmp on tmp.id = pro.id left join saldoinv s on s.producto = pro.id and s.periodo = "+anio+", preventa pre, dlistapre lpr, producto_modelo pm "+ 
                  "where pm.producto = pro.id and pm.id = "+modelo+" and lpr.id = "+lpr+" and lpr.producto = pro.id and cor.fechaDispon = '"+importacion+"' and  pre.producto = pro.id and (upper(pro.codigo) like '%"+nombre.toUpperCase()+"%' or upper(pro.nombre) like '%"+nombre.toUpperCase()+"%') "+cadenaExtra+" order by pro.nombre";
        }
     }
      console.log(select);
      
	    return this.database.executeSql(select,[]).then(data => {
        let productos=[];
        //console.log('data parametros: ',data)

        if(data.rows.length >0){
          console.log(' Tam ',data.rows.length);
          
          for(var i=0; i<data.rows.length;i++){
            let nu = false;
            let ll = false;
            let desc = "Sin promoción";
            if(data.rows.item(i).promoDescripcion !==null && data.rows.item(i).promoDescripcion !== ""){
              desc = data.rows.item(i).promoDescripcion;
            }
            let pro = false;
            if(data.rows.item(i).promo === 1)
              pro = true;
            if(data.rows.item(i).llegado === 1)
              ll = true;
            let color:string = 'transparent';
            let ti = false;
            if(data.rows.item(i).nuevo ===1)
              nu = true;
            if(data.rows.item(i).cantidad>0){
              color = '#CFFABA';
              ti = true;
            }
            let precioIva = 0.00;
            let precioIva2 = 0.00;
            if(data.rows.item(i).impuesto === 1){
              precioIva2 = data.rows.item(i).precio * (1 + (Number(parIva.valor)/100));
            }else{
              precioIva2 =data.rows.item(i).precio;
            } 
            let stock = 0.0;
            let precio =data.rows.item(i).precio;
            if(data.rows.item(i).preventa === "-1" || data.rows.item(i).preventa === null){
              if(importacion!=="-1"){
                precio = data.rows.item(i).precioPreventa;
                if(data.rows.item(i).impuesto === 1){
                  precioIva = data.rows.item(i).precioPreventa * (1 + (Number(parIva.valor)/100));
                }else{
                  precioIva =data.rows.item(i).precioPreventa;
                } 
                precioIva =  Math.round(precioIva*100)/100;
                stock = data.rows.item(i).preStock;
              }else{
                if(data.rows.item(i).impuesto === 1){
                  precioIva = data.rows.item(i).precio * (1 + (Number(parIva.valor)/100));
                }else{
                  precioIva =data.rows.item(i).precio;
                } 
                precioIva =  Math.round(precioIva*100)/100;
                stock = data.rows.item(i).stock;
              }
            }else{
              if(color!=="transparent")
                color ='#7DFFF9';
              precioIva = Math.round(data.rows.item(i).precioPre*100)/100;
            }
          
                productos.push(
                  {
                    id: data.rows.item(i).id,
                    nombre: data.rows.item(i).nombre,
                    umedida:data.rows.item(i).umedida,
                    stock:stock,
                    promocion:data.rows.item(i).promocion,
                    idTipo:data.rows.item(i).idTipo,
                    impuesto: data.rows.item(i).impuesto,
                    codigo: data.rows.item(i).codigo,
                    precio:precio,
                    precioIva:precioIva,
                    ext:"",
                    imagen:"",
                    nuevo:nu,
                    cantidad:data.rows.item(i).cantidad,
                    color:color,
                    total:data.rows.item(i).totalPre,
                    ti:ti,
                    fichatecnica:data.rows.item(i).fichatecnica,
                    precioIvaF:precioIva2,
                    preventa:data.rows.item(i).preventa,
                    promo:pro,
                    promoDescripcion:desc,
                    empaque:data.rows.item(i).empaque,
                    cantminima:data.rows.item(i).cantminima,
                    fechaDispon:data.rows.item(i).urlimg,
                    llegado:ll
                  }
                );
              

            
          }
        }
        return productos;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    /* >>>>>>>>>>>>>>>>>>>>>>>>>> Unidad de Medida <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getUmedida(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servUmedida/recuperarUnidad";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarUmedida(){
	    return this.database.executeSql("DELETE FROM umedida",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    borrarImagenes(){
	    return this.database.executeSql("DELETE FROM imagen_producto",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarUmedida(umedida){
      return new Promise ((resolve,reject)=>{this.database.executeSql("INSERT INTO umedida (id,nombre) VALUES (?,?)",
          [ umedida.id,
            umedida.nombre
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    obtenerUnidades(){
	    return this.database.executeSql("SELECT * FROM umedida order by nombre ",[]).then(data => {
        let unidades=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            unidades.push(
              {
                id: data.rows.item(i).id,
                nombre: data.rows.item(i).nombre
              }
            );
          }
        }
        return unidades;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
     obtenerUnidad(idUnidad){
	    return this.database.executeSql("SELECT * FROM umedida where id = ? ",[idUnidad]).then(data => {
        let unidades={}
        if(data.rows.length >0){
            unidades=
              {
                id: data.rows.item(0).id,
                nombre: data.rows.item(0).nombre
              }
        }else{
           unidades=
              {
                id: -1,
                nombre: ""
              }
        }
        return unidades;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    /* >>>>>>>>>>>>>>>>>>>>>>>>>> Factor <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getFactores(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servFactor/recuperarFactor";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarFactores(){
	    return this.database.executeSql("DELETE FROM factor",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarFactor(factor){
      return new Promise((resolve, reject)=>{this.database.executeSql("INSERT INTO factor (umedida,producto,factor,id,fechaact,tipo) VALUES (?,?,?,?,?,?)",
          [ factor.idUnidad,
            factor.idProducto,
            factor.factor,
            factor.id,
            factor.fechaact,
            factor.tipo
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    actualizarFactor(img){
	    return new Promise((resolve,reject) =>{this.database.executeSql("update factor  set umedida = ?, producto =?, factor = ?, fechaact  = ?, tipo = ? where id = ?",[
        img.idUnidad,
        img.idProducto,
        img.factor,
        img.fechaact,
        img.tipo,
        img.id
      ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    eliminarFactor(img){
	    return new Promise((resolve,reject)=>{this.database.executeSql("delete from factor where id = ?",[
        img.id
      ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    obtenerFactores(idProd){
	    return this.database.executeSql("SELECT fac.factor, uni.id, uni.nombre FROM factor fac, umedida uni where uni.id = fac.umedida and producto = ? ",[idProd]).then(data => {
        let unidades=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            unidades.push(
              {
                id_unidad: data.rows.item(i).id,
                nombre_unidad: data.rows.item(i).nombre,
                factor:data.rows.item(i).factor
              }
            );
          }
        }
        return unidades;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerTodosFactores(){
	    return this.database.executeSql("SELECT id, umedida as idUnidad, producto as idProducto, factor, fechaact, tipo FROM factor fac",[]).then(data => {
        let unidades=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            unidades.push(
              data.rows.item(i)
            );
          }
        }
        return unidades;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
     obtenerFactorPorUnidad(idUnidad, idProducto){
	    return this.database.executeSql("SELECT factor from factor where producto = ? and umedida = ?",[idProducto,idUnidad]).then(data => {
        let factor = {};
        if(data.rows.length >0){
           factor = {
                factor : data.rows.item(0).factor
          }
        }
        return factor;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    /* >>>>>>>>>>>>>>>>>>>>>>>>>> Politica <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getPolitica(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servPolitica/recuperarPoliticas";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarPoliticas(){
	    return this.database.executeSql("DELETE FROM politica",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarPolitica(politica){
      return new Promise ((resolve,reject)=>{this.database.executeSql("INSERT INTO politica (id,nombre) VALUES (?,?)",
          [ politica.id,
            politica.nombre
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    obtenerPoliticas(){
	    return this.database.executeSql("SELECT * FROM politica",[]).then(data => {
        let politicas=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            politicas.push(
              {
                id: data.rows.item(i).id,
                nombre: data.rows.item(i).nombre
              }
            );
          }
        }
        return politicas;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
     /* >>>>>>>>>>>>>>>>>>>>>>>>>> TipoProducto <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getTipoProducto(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servTipoProducto/recuperarTipoProducto";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarTipoProducto(){
	    return this.database.executeSql("DELETE FROM tipoproducto",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarTipoProducto(tpr){
      return new Promise ((resolve,reject)=>{this.database.executeSql("INSERT INTO tipoproducto (id,nombre) VALUES (?,?)",
          [ tpr.id,
            tpr.nombre
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }

    /* >>>>>>>>>>>>>>>>>>>>>>>>>> Bodega <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getBodegas(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servBodega/recuperarBodegas";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarBodegas(){
	    return this.database.executeSql("DELETE FROM bodega",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarBodega(bodega){
      return this.database.executeSql("INSERT INTO bodega (id,nombre,codigo, promocion) VALUES (?,?,?,?)",
          [ bodega.id,
            bodega.nombre,
            bodega.codigo,
            bodega.promocion
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    }).catch(e => console.log('Error al insertar bodega===> ',e));
    }
     obtenerBodega(){
      return this.database.executeSql("SELECT * FROM bodega",[]).then(data => {
        let bodegas=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            bodegas.push(
              data.rows.item(i));
          }
        }
        return bodegas;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    
    obtenerBodegaPorId(idUnidad){
	    return this.database.executeSql("SELECT * FROM bodega where id = ? ",[idUnidad]).then(data => {
        let unidades={}
        if(data.rows.length >0){
            unidades=
              {
                id: data.rows.item(0).id,
                nombre: data.rows.item(0).nombre,
                codigo: data.rows.item(0).codigo,
                promocion: data.rows.item(0).promocion
              }
        }else{
           unidades=
              {
                id: -1,
                nombre: "",
                codigo:"",
                promocion: 0
              }
        }
        return unidades;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }

    /* >>>>>>>>>>>>>>>>>>>>>>>>>> Canal <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getCanales(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servCanal/recuperarCanal";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarCanales(){
	    return this.database.executeSql("DELETE FROM canal",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarCanal(bodega){
      return new Promise ((resolve,reject)=>{this.database.executeSql("INSERT INTO canal (id,nombre) VALUES (?,?)",
          [ bodega.id,
            bodega.nombre
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
     obtenerCanales(){
      return this.database.executeSql("SELECT * FROM canal",[]).then(data => {
        let bodegas=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            bodegas.push(
              {
                id: data.rows.item(i).id,
                nombre: data.rows.item(i).nombre
              });
          }
        }
        return bodegas;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }


    /* >>>>>>>>>>>>>>>>>>>>>>>>>> Direcciones <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getDirecciones(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servCliente/obtenerDireccionesM";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarDirecciones(){
	    return this.database.executeSql("DELETE FROM direccion",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarDireccion(dir){
      return new Promise ((resolve,reject)=> {this.database.executeSql("INSERT INTO direccion (id,idcliente,calleprincipal) VALUES (?,?,?)",
          [ dir.id,
            dir.idCliente,
            dir.calleprincipal
          ]).then(res =>{
	      this.storage.set('database_filled',true);
        resolve(res);
	    }).catch(e => reject(e))});
    }

    /* >>>>>>>>>>>>>>>>>>>>>>>>>> Marca <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getMarcas(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servMarca/recuperarMarcas";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarMarcas(){
	    return this.database.executeSql("DELETE FROM marca",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
      });      
    }
    insertarMarca(marca){
      return new Promise ((resolve,reject)=> {this.database.executeSql("INSERT INTO marca (id,nombre) VALUES (?,?)",
          [ marca.id,
            marca.nombre
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    obtenerMarcas(cla){
      var sel = "";
      if(cla===-1){
        sel = "select id, NOMBRE as nombre from marca order by NOMBRE";
      }else{
        sel = "select distinct mar.id, mar.NOMBRE as nombre from marca mar, producto pro where pro.marca = mar.id and pro.clasificacion1 = "+cla+" order by mar.NOMBRE"
      }
	    return this.database.executeSql(sel,[]).then(data => {
        let zonas=[];
        //console.log('data parametros: ',data)
        zonas.push({id:-1,nombre:"TODOS (MARCAS)"});
        if(data.rows.length >0){

          for(var i=0; i<data.rows.length;i++){
            zonas.push(
              data.rows.item(i)
            );
          }
        }
        return zonas;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }

/* >>>>>>>>>>>>>>>>>>>>>>>>>> Modelo <<<<<<<<<<<<<<<<<<<<<<<<<<*/
getModelos(parametros, uac) {
  return new Promise((resolve,reject)=> {
    var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servModelo/recuperarModelos";
    this.http.post(url,uac)
    .subscribe(
      data => {
      resolve(data.json());
    }, 
      err=> {
        console.log('Error-> ',err);
        reject(err)
      });
  });
}
getProductoModelos(parametros, uac) {
  return new Promise((resolve,reject)=> {
    var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servModelo/recuperarProductosModelo";
    this.http.post(url,uac)
    .subscribe(
      data => {
      resolve(data.json());
    }, 
      err=> {
        console.log('Error-> ',err);
        reject(err)
      });
  });
}

insertarProductoModelo(marca){
  return new Promise ((resolve,reject)=> {this.database.executeSql("INSERT INTO producto_modelo (id,modelo,producto,fechaact,tipo) VALUES (?,?,?,?,?)",
      [ marca.id,
        marca.modelo,
        marca.producto,
        marca.fechaact,
        marca.tipo
      ]).then(res =>{
    this.storage.set('database_filled',true);
    resolve(res);
  }).catch(e => reject(e))});
}

actualizarProductoModelo(marca){
  return new Promise ((resolve,reject)=> {this.database.executeSql("update producto_modelo set modelo = ?, producto =?, fechaact =?, tipo = ? where id = ?",
      [ 
        marca.modelo,
        marca.producto,
        marca.fechaact,
        marca.tipo,
        marca.id
      ]).then(res =>{
    this.storage.set('database_filled',true);
    resolve(res);
  }).catch(e => reject(e))});
}
eliminarProductoModelo(marca){
  return new Promise ((resolve,reject)=> {this.database.executeSql("delete from producto_modelo where id = ?",
      [ marca.id
      ]).then(res =>{
    this.storage.set('database_filled',true);
    resolve(res);
  }).catch(e => reject(e))});
}
 borrarModelos(){
  return this.database.executeSql("DELETE FROM modelo",[]).then(res =>{
    this.storage.set('database_filled',true);
    return res;
  });      
}
insertarModelo(marca){
  return new Promise ((resolve,reject)=> {this.database.executeSql("INSERT INTO modelo (id,nombre,img,imagen,extension) VALUES (?,?,?,?,?)",
      [ marca.id,
        marca.nombre,
        marca.img,
        marca.imagen,
        marca.extension
      ]).then(res =>{
    this.storage.set('database_filled',true);
    resolve(res);
  }).catch(e => reject(e))});
}
obtenerModelos(cla,mar){
  var sel = "";
  var cadExt="";
  if(cla===-1){
    sel = "select id, nombre  from modelo order by 2";
  }else{
    if(mar===-1){
      sel = "select distinct mar.id, mar.nombre from modelo mar, producto_modelo pro, producto p where pro.modelo = mar.id and p.id = pro.producto and p.clasificacion1 = "+cla+" order by mar.nombre"
    }else{
      sel = "select distinct mar.id, mar.nombre from modelo mar, "+
      "producto_modelo pro, producto p where pro.modelo = mar.id and p.id = pro.producto and "+
      "p.clasificacion1 = "+cla+" and p.marca = "+mar+" order by mar.nombre"
      
    }
  }
  console.log('select modelos -> ',sel);
  
  return this.database.executeSql(sel,[]).then(data => {
    let zonas=[];
    //console.log('data parametros: ',data)
    zonas.push({id:-1,nombre:"TODOS"});
    if(data.rows.length >0){

      for(var i=0; i<data.rows.length;i++){
        zonas.push(
          data.rows.item(i)
        );
      }
    }
    return zonas;
  }, err =>{
    console.log('Error: ',err);
    return [];
  })
}
obtenerModelosProducto(pro){ 
  return this.database.executeSql("select mod.* from modelo mod, producto_modelo pro where pro.modelo = mod.id and pro.producto = "+pro,[]).then(data => {
    let zonas=[];
    if(data.rows.length >0){
      for(var i=0; i<data.rows.length;i++){
        zonas.push(
          data.rows.item(i)
        );
      }
    }
    return zonas;
  }, err =>{
    console.log('Error: ',err);
    return [];
  })
}
obtenerProductosModelos(){

  return this.database.executeSql("select * from producto_modelo",[]).then(data => {
    let zonas=[];
    if(data.rows.length >0){
      for(var i=0; i<data.rows.length;i++){
        zonas.push(
          data.rows.item(i)
        );
      }
    }
    return zonas;
  }, err =>{
    console.log('Error: ',err);
    return [];
  })
}
     /* >>>>>>>>>>>>>>>>>>>>>>>>>> Clasificacion <<<<<<<<<<<<<<<<<<<<<<<<<<*/
     getClasificaciones(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servClasificacion1/recuperarClasificaciones";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarClasificaciones(){
	    return this.database.executeSql("DELETE FROM clasificacion1",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarClasificacion(marca){
      return new Promise ((resolve,reject)=> {this.database.executeSql("INSERT INTO clasificacion1 (id,nombre) VALUES (?,?)",
          [ marca.id,
            marca.nombre
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    obtenerClasificaciones(){
      
	    return this.database.executeSql("select id, NOMBRE as nombre from clasificacion1 order by nombre ",[]).then(data => {
        let zonas=[];
        //console.log('data parametros: ',data)
        zonas.push({id:-1,nombre:"TODOS (LÍNEA)"});
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            zonas.push(
              data.rows.item(i)
            );
          }
        }
        return zonas;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    /* >>>>>>>>>>>>>>>>>>>>>>>>>> Zona <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getZonas(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servZona/recuperarZona";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarZonas(){
	    return this.database.executeSql("DELETE FROM zona",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarZona(zona){
      return new Promise ((resolve,reject)=> {this.database.executeSql("INSERT INTO zona (id,nombre,codigo,orden) VALUES (?,?,?,?)",
          [ zona.id,
            zona.nombre,
            zona.codigo,
            zona.orden
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }

    obtenerZonas(){
	    return this.database.executeSql("SELECT * FROM zona order by orden",[]).then(data => {
        let zonas=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          zonas.push({id:-1,nombre:"TODAS",codigo:"-1",orden:-1});
          for(var i=0; i<data.rows.length;i++){
            zonas.push(
              {
                id: data.rows.item(i).id,
                nombre: data.rows.item(i).nombre,
                codigo:data.rows.item(i).codigo,
                orden:data.rows.item(i).orden
              }
            );
          }
        }
        return zonas;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }

    /* >>>>>>>>>>>>>>>>>>>>>>>>>> Preventas <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getTablaPreventa(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servPreventa/recuperarPreventas";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarTablaPreventa(){
	    return this.database.executeSql("DELETE FROM preventa",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarTablaPreventa(prev){
      return new Promise ((resolve,reject)=> {this.database.executeSql("INSERT INTO preventa (id,producto,cantidad,fechaDispon,numOrden,precioPreventa,corid) VALUES (?,?,?,?,?,?,?)",
          [ prev.id,
            prev.producto,
            prev.cantidad,
            prev.fechaDispon,
            prev.numOrden,
            prev.precioPreventa,
            prev.cordid
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    obtenerTablasPreventasPorProducto(idProducto){
      return this.database.executeSql("SELECT * FROM preventa where producto = ?",[idProducto]).then(data => {
        let dpe=[];
        //console.log('data parametros: ',data)
        dpe.push({nombre:'PREDETERMINADA',id:-1});
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            let iiid = data.rows.item(i);
            iiid.nombre = "Fecha Disp: "+data.rows.item(i).fechaDispon+" - Ord: "+data.rows.item(i).numOrden;
            dpe.push(iiid);
          }
        }
        return dpe;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
  }
  obtenerTablasPreventas(){
    return this.database.executeSql("SELECT distinct fechaDispon FROM preventa",[]).then(data => {
      let dpe=[];
      //console.log('data parametros: ',data)
      dpe.push({nombre:'PREDETERMINADA',id:"-1"});
      if(data.rows.length >0){
        for(var i=0; i<data.rows.length;i++){
          let iiid = data.rows.item(i);
          iiid.nombre = data.rows.item(i).fechaDispon;
          dpe.push(iiid);
        }
      }
      return dpe;
    }, err =>{
      console.log('Error: ',err);
      return [];
    })
}
    
     /* >>>>>>>>>>>>>>>>>>>>>>>>>> Cliente Movil Nuevo <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    insertarClienteNuevo(cn){
      return this.database.executeSql("INSERT INTO cliente_movil_nuevo (id,cedula,apellidos,nombres,direccion,telefono,mail,canal,politica,fecNac,nomComercial, idZona) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
          [ cn.id,
            cn.identificacion,
            cn.apellidos,
            cn.nombres,
            cn.direccion,
            cn.telefono,
            cn.mail,
            cn.canal,
            cn.politica,
            cn.fechaNacimiento,
            cn.nombreComercial,
            cn.zona
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    }).catch(e => console.log('Error al insertar novedad===> ',e));
    }
     darFormatoFecha(fecha){
       if(fecha!==null){
         var datestring = ("0" + fecha.getDate()).slice(-2) + "-" + ("0"+(fecha.getMonth()+1)).slice(-2) + "-" +fecha.getFullYear()+" "+("0" + fecha.getHours()).slice(-2)+":"+("0" + fecha.getMinutes()).slice(-2) +":"+("0" + fecha.getSeconds()).slice(-2) ;
      return datestring;
       }else{
         return "";
       }
    }
    darFormatoFechaSinHoras(fecha){
      if(fecha!==null){
        var datestring = ("0" + fecha.getDate()).slice(-2) + "-" + ("0"+(fecha.getMonth()+1)).slice(-2) + "-" +fecha.getFullYear();
     return datestring;
      }else{
        return "";
      }
   }
    obtenerIdCliente(){
       return this.database.executeSql("SELECT COALESCE(min(id),0) as cant FROM cliente_movil_nuevo ",[]).then(data => {
        let res = -1;
        if(data.rows.length >0){
          res = data.rows.item(0).cant - 1;
        }
        return res;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
     obtenerClienteNuevoPorIdentificacion(identificacion){
	    return this.database.executeSql("SELECT * FROM cliente_movil_nuevo where cedula = ? ",[identificacion]).then(data => {
        let unidades={}
        if(data.rows.length >0){
          let cn = data.rows.item(0);
            unidades=
              {
                id: cn.id,
            identificacion: cn.cedula,
            apellidos: cn.apellidos,
            nombres: cn.nombres,
            direccion: cn.direccion,
            telefono: cn.telefono,
            mail: cn.mail,
            canal: cn.canal,
            politica: cn.politica,
            fechaNacimiento: cn.fecNac,
            nombreComercial: cn.nomComercial,
            zona: cn.idZona
              }
        }else{
           unidades=
              {
                id: null,
              }
        }
        return unidades;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerClienteNuevoPorId(id){
	    return this.database.executeSql("SELECT * ,(select distinct id from dlistapre limit 1) listaPre FROM cliente_movil_nuevo where id = ? ",[id]).then(data => {
        let unidades={}
        if(data.rows.length >0){
          let cn = data.rows.item(0);
            unidades=
              {
                id: cn.id,
                identificacion: cn.cedula,
                apellidos: cn.apellidos,
                nombres: cn.nombres,
                direccion: cn.direccion,
                telefono: cn.telefono,
                mail: cn.mail,
                canal: cn.canal,
                politica: cn.politica,
                fechaNacimiento: cn.fecNac,
                nombreComercial: cn.nomComercial,
                zona: cn.idZona,
                listaPre : cn.listaPre
              }
        }else{
           unidades=
              {
                id: null,
              }
        }
        return unidades;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
     /* >>>>>>>>>>>>>>>>>>>>>>>>>> DpedidoInfo <<<<<<<<<<<<<<<<<<<<<<<<<<*/
  
     getDPedidoInfo(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servCliente/recuperarnpedidos";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
    borrarDPedidoInfo(){
	    return this.database.executeSql("DELETE FROM dpedidoinfo",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarDPedidoInfo(dpe){
      return new Promise((resolve,reject)=>{this.database.executeSql("INSERT INTO dpedidoinfo (id,idPedido,cliente,fecha,producto,precio,cantidad,subtotal,iva,total) VALUES (?,?,?,?,?,?,?,?,?,?)",
          [ 
            dpe.id,
            dpe.idPedido,
            dpe.cliente,
            dpe.fecha,
            dpe.producto,
            dpe.precio,
            dpe.cantidad,
            dpe.subtotal,
            dpe.iva,
            dpe.total
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }
    obtenerDpedidosInfo(idCliente){
      return this.database.executeSql("SELECT * FROM dpedidoinfo where cliente = ?",[idCliente]).then(data => {
        let dpe=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            dpe.push(
              {
                id : data.rows.item(i).id,
                idPedido : data.rows.item(i).idPedido,
                cliente: data.rows.item(i).cliente,
                fecha: data.rows.item(i).fecha,
                producto: data.rows.item(i).producto,
                precio: data.rows.item(i).precio,
                cantidad: data.rows.item(i).cantidad,
                subtotal: data.rows.item(i).subtotal,
                iva: data.rows.item(i).iva,
                total: data.rows.item(i).total
              })
          }
        }
        return dpe;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
  }
    /* >>>>>>>>>>>>>>>>>>>>>>>>>> Novedades <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getNovedades(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servNovedad/recuperarNovedad";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarNovedad(){
	    return this.database.executeSql("DELETE FROM novedad",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarNovedad(nov){
      return new Promise ((resolve,reject)=>{this.database.executeSql("INSERT INTO novedad (id,codigo,nombre,requerido) VALUES (?,?,?,?)",
          [ nov.id,
            nov.codigo,
            nov.nombre,
            nov.requerido
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	     resolve(res);
	    }).catch(e => reject(e))});
    }
    obtenerNovedades(){
	    return this.database.executeSql("SELECT * FROM novedad order by requerido desc",[]).then(data => {
        let novedades=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            novedades.push(
              {
                id: data.rows.item(i).id,
                nombre: data.rows.item(i).nombre,
                codigo: data.rows.item(i).codigo,
                requerido : data.rows.item(i).requerido
              }
            );
          }
        }
        return novedades;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerNovedad(idUnidad){
	    return this.database.executeSql("SELECT * FROM novedad where id = ? ",[idUnidad]).then(data => {
        let unidades={}
        if(data.rows.length >0){
            unidades=
              {
                id: data.rows.item(0).id,
                nombre: data.rows.item(0).nombre,
                codigo: data.rows.item(0).codigo,
                requerido:data.rows.item(0).requerido
              }
        }else{
           unidades=
              {
                id: -1,
                nombre: "",
                codigo:"",
                requerido:1
              }
        }
        return unidades;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }

     /* >>>>>>>>>>>>>>>>>>>>>>>>>> Cpedido <<<<<<<<<<<<<<<<<<<<<<<<<<*/

     sincronizarPedidos(parametros, pedidos) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servCpedido/insertarLote";
        this.http.post(url,pedidos)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
    sincronizarRecibos(parametros, recibos) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servRecibos/insertarLote";
        this.http.post(url,recibos)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
      borrarCpedidos(){
	    return this.database.executeSql("DELETE FROM cpedido",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
      });
      }
      borrarDetalles(){
        return this.database.executeSql("DELETE FROM dpedido",[]).then(res =>{
          this.storage.set('database_filled',true);
          return res;
        });
      }
      borrarCpedidoPorId(id){
	    return this.database.executeSql("DELETE FROM cpedido where id = ?",[id]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
      });
      }
      borrarCpedidoPorEstado(estado){
        return this.database.executeSql("DELETE FROM cpedido where sincronizado = ?",[estado]).then(res =>{
          this.storage.set('database_filled',true);
          return res;
        });
        }
      borrarDpedidoPorEstado(estado){
          return this.database.executeSql("DELETE FROM dpedido where cpedido in  (select id from cpedido where sincronizado = ?)",[estado]).then(res =>{
            this.storage.set('database_filled',true);
            return res;
          });
        }
      borrarDpedidosPorCpedido(id){
        return this.database.executeSql("DELETE FROM dpedido where cpedido = ?",[id]).then(res =>{
          this.storage.set('database_filled',true);
          return res;
        });
      }
       obtenerIdUltimo(){
        return new Promise ((resolve,reject) => {
          this.database.executeSql("SELECT COALESCE(max(id),0) cant FROM cpedido",[]).then(data => {
          let res = 1;
          if(data.rows.length >0){
            res = data.rows.item(0).cant + 1;
            resolve(res);
          }else{
            resolve(res);
          }
          }, err =>{
            reject(err);
          })
        });
      }
      obtenerCantidadPedidos(sincro){
        return new Promise ((resolve,reject) => {
          this.database.executeSql("SELECT count(id) cant FROM cpedido where sincronizado = ?",[sincro]).then(data => {
          let res = 0;
          if(data.rows.length >0){
            res = data.rows.item(0).cant;
            resolve(res);
          }else{
            resolve(res);
          }
          }, err =>{
            reject(err);
          })
        });
      }
      obtenerPedido(idPedido){
        return new Promise ((resolve,reject) => {
          this.database.executeSql("SELECT cpe.id,cli.identificacion,cli.nombre,cpe.fecha,round(cpe.subtotal,2) as subtotal, round(cpe.total,2) as total, round(cpe.descuento,2) as descuento ,round(cpe.iva,2) as iva, cpe.observaciones, cpe.subtotal-cpe.descuento as subNeto "+
          "  FROM cpedido cpe, cliente cli where cpe.cliente = cli.id and cpe.id = ?",[idPedido]).then(data => {
          let res = null;
          if(data.rows.length >0){
            res = data.rows.item(0);
            resolve(res);
          }else{
            resolve(res);
          }
          }, err =>{
            reject(err);
          })
        });
      }
       obtenerCantidadRecibos(sincro){
        return new Promise ((resolve,reject) => {
          this.database.executeSql("SELECT count(id) cant FROM crecibo where sincronizado = ?",[sincro]).then(data => {
          let res = 0;
          if(data.rows.length >0){
            res = data.rows.item(0).cant;
            resolve(res);
          }else{
            resolve(res);
          }
          }, err =>{
            reject(err);
          })
        });
      }
      insertarCpedido(cpe){
        console.log('Que voy a insertar ',cpe);
        
      return new Promise ((resolve,reject) => {this.database.executeSql("INSERT INTO cpedido (id,cliente,descuento,diasplazo,fecha,estado,sincronizado,total,observaciones,direccion,politica,coordx,coordy,idNovedad,subEmpId,obsequio,subtotal,iva,idzona) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          [
            cpe.id,
            cpe.idCliente,
            cpe.descuento,
            cpe.diasPlazo,
            cpe.fecha,
            cpe.estado,
            cpe.sincronizado,
            cpe.total,
            cpe.observaciones,
            cpe.direccion,
            cpe.politica,
            cpe.coord_x,
            cpe.coord_y,
            cpe.novedad,
            cpe.subEmpleado,
            cpe.obsequio,
            cpe.subtotal,
            cpe.iva,
            cpe.zon
          ]).then(
            res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
      }).catch(e => {
        reject(e);
      }
          )});
    }
    modificarCpedido(cpe){
      return this.database.executeSql("UPDATE cpedido SET obsequio=?, sincronizado = ?, descuento =?, observaciones=?, diasplazo =?,estado = ?, idNovedad=?, total = ?, direccion = ?, politica = ?, coordx = ?, coordy = ?, subtotal =?,iva=? WHERE id=?",
      [ 
        cpe.obsequio,
        cpe.sincronizado,
        cpe.descuento,
        cpe.observaciones,
        cpe.diasPlazo,
        cpe.estado,
        cpe.novedad,
        cpe.total,
        cpe.direccion,
        cpe.politica,
        cpe.coord_x,
        cpe.coord_y,
        cpe.subtotal,
        cpe.iva,
        cpe.id
      ]).then(res =>{ 
        this.storage.set('database_filled',true);
        return res;
      }).catch(e => console.log(e));
    }

    actualizarSincro(id, sincro){
      return this.database.executeSql("UPDATE cpedido SET sincronizado = ? WHERE id = ?",
      [ 
        sincro,
        id
      ]).then(res =>{ 
        this.storage.set('database_filled',true);
        return res;
      }).catch(e => console.log(e));
    }
    actualizarSincroCre(id, sincro){
      return this.database.executeSql("UPDATE crecibo SET sincronizado = ? WHERE id = ?",
      [ 
        sincro,
        id
      ]).then(res =>{ 
        this.storage.set('database_filled',true);
        return res;
      }).catch(e => console.log(e));
    }
    actualizarDdo(id, idMovil){
      return this.database.executeSql("UPDATE ddocumento SET id = ? WHERE idMovil = ?",
      [ 
        id,
        idMovil
      ]).then(res =>{ 
        this.storage.set('database_filled',true);
        return res;
      }).catch(e => console.log(e));
    }
    actualizarCancela(id, idMovil){
      console.log('Actualiza a --> '+id+' de ->');
      
      return this.database.executeSql("UPDATE dcancelacion SET documento = ? WHERE documento = (select id from ddocumento where idMovil = ?)",
      [ 
        id,
        idMovil
      ]).then(res =>{ 
        this.storage.set('database_filled',true);
        return res;
      }).catch(e => console.log(e));
    }
    actualizarCancelaM(id, idMovil){
      console.log('Actualiza a --> '+id+' de ->',idMovil);
      
      return this.database.executeSql("UPDATE dcancelacion SET documento = ? WHERE documento = ?",
      [ 
        id,
        idMovil
      ]).then(res =>{ 
        this.storage.set('database_filled',true);
        return res;
      }).catch(e => console.log(e));
    }
    borrarReciboPorPedido(id){
	    return this.database.executeSql("DELETE FROM crecibo where id =  ?",[id]).then(res =>{
        this.storage.set('database_filled',true);
	      return res;
	    });
    }
     borrarDetallesReciboPorPedido(id){
	    return this.database.executeSql("DELETE FROM drecibo where crecibo = ?",[id]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    borrarCancelacionesPorPedido(id){
	    return this.database.executeSql("DELETE FROM dcancelacion where documento = ?",[id]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarDpedido(dpe){
      return  new Promise ( (resolve,reject)=>{
          this.database.executeSql("INSERT INTO dpedido (cpedido,producto,cantidad,promocion,descuento,precio,umedida,total,bodega,cordcom,preventa,observaciones) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            [
              dpe.cpedido,
              dpe.idProducto,
              dpe.cantidad,
              dpe.promocion,
              dpe.descuento,
              dpe.precio,
              dpe.unidad,
              dpe.subtotal,
              dpe.bodega,
              dpe.cordcom,
              dpe.preventa,
              dpe.observaciones
            ]).then( res =>{
              this.storage.set('database_filled',true);
              resolve(1);
        }).catch(e => reject(e))
      });
    }
    obtenerDetallesPedido(idPedido, porcimpuesto){
      return new Promise( (resolve, reject) =>{
          this.database.executeSql("SELECT dpe.*, pro.nombre as nombreProducto, pro.impuesto, (SELECT uni.nombre FROM factor fac, umedida uni where uni.id = fac.umedida and fac.producto = pro.id) as uniNombre, "+
        " bod.nombre bodegaNombre "+
        " FROM dpedido dpe, producto pro, bodega bod where bod.id = dpe.bodega and pro.id = dpe.producto and cpedido = ?",[idPedido]).then(data => {
          let dpe=[];
          //console.log('data parametros: ',data)
          if(data.rows.length >0){
            let total = 0.0;
            for(let i=0; i<data.rows.length;i++){
              let det = data.rows.item(i);
              let pr = 0.0;
              let iva = 0.0;
              let prec = 0.0;
              if(det.impuesto === 1){
                iva = (det.cantidad*det.precio)*(porcimpuesto/100);
                pr = (det.cantidad*det.precio)*(1+porcimpuesto/100);
              }
              console.log('Detalle que va a poner ',det);
              dpe.push({
                idProducto : det.producto,
                cantidad: det.cantidad,
                descuento:det.descuento,
                nombreProducto:det.nombreProducto,
                precio:det.precio,
                promocion :0.0,
                cpedido:det.cpedido,
                unidad:det.umedida,
                bodega:det.bodega,
                total:(det.cantidad * det.precio)+iva,
                subtotal : det.cantidad * det.precio,
                iva:iva,
                nombreUnidad: det.uniNombre,
                nombreBodega: det.bodegaNombre,
                observaciones:det.observaciones
              });
              prec = (det.precio)*(1+porcimpuesto/100);    
              this.insertarProductotmp({id:det.producto,cantidad:det.cantidad,total:pr,preventa:det.preventa,precio:prec}).then(res=>{
                if(i === (data.rows.length-1)){
                  resolve(dpe);
                }
              });        
             }
          } 
        }, err =>{
          console.log('Error: ',err);
          reject(err);
        })
      });
    }
    obtenerDetallesPedido2(idPedido, porcimpuesto){
      return new Promise( (resolve, reject) =>{
          this.database.executeSql("SELECT dpe.*, pro.nombre as nombreProducto, pro.impuesto, (SELECT uni.nombre FROM factor fac, umedida uni where uni.id = fac.umedida and fac.producto = pro.id) as uniNombre, "+
        " bod.nombre bodegaNombre, pro.codigo "+
        " FROM dpedido dpe, producto pro, bodega bod where bod.id = dpe.bodega and pro.id = dpe.producto and cpedido = ?",[idPedido]).then(data => {
          let dpe=[];
          console.log('data parametros: ',data)
          if(data.rows.length >0){
            let total = 0.0;
            for(let i=0; i<data.rows.length;i++){
              let det = data.rows.item(i);
              let iva = 0.0;
              if(det.impuesto === 1){
                iva = (det.cantidad*det.precio)*(porcimpuesto/100);
              }
              dpe.push({
                idProducto : det.producto,
                cantidad: det.cantidad,
                descuento:det.descuento,
                nombreProducto:det.nombreProducto,
                precio:det.precio,
                promocion :0.0,
                cpedido:det.cpedido,
                unidad:det.umedida,
                bodega:det.bodega,
                total:(det.cantidad * det.precio)+iva,
                subtotal : det.cantidad * det.precio,
                iva:iva,
                nombreUnidad: det.uniNombre,
                nombreBodega: det.bodegaNombre,
                observaciones:det.observaciones,
                codigo:det.codigo
              });
              if(i ==(data.rows.length-1) ){
                resolve(dpe);
              }
            }
            
          }
         
        }, err =>{
          console.log('Error: ',err);
          reject(err);
        })
      });
    }
    obtenerDetallesPedidoNormal(idPedido){
      return this.database.executeSql("SELECT * FROM dpedido where cpedido = ?",[idPedido]).then(data => {
        let dpe=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            let detalle = data.rows.item(i);
            dpe.push(detalle);
          }
        }
        return dpe;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerDetallesRecibo(idPedido){
      return this.database.executeSql("SELECT crecibo as idrecibo, tipopago as idtpa, valor as valortotal, emisor, beneficiario, cliente as idcliente, nrocheque, nrocuenta, banco as idbanco, debcre, nrodocumento, concepto, fecha as fecha, retautorizacion, fechacaducidad,retnumcomproba,fechafactura,retnumfactura  FROM drecibo where crecibo = ?",[idPedido]).then(data => {
        let dpe=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            let detalle = data.rows.item(i);
            dpe.push(detalle);
          }
        }
        return dpe;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerDcancelaRecibo(idPedido){
      return this.database.executeSql("SELECT id, documento as iddocumento, recibo as idrecibo, valor, debcre from dcancelacion where recibo = ?",[idPedido]).then(data => {
        let dpe=[];
        //console.log('data parametros: ',data)

        
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            let detalle = data.rows.item(i);
            dpe.push(detalle);
          }
        }
        return dpe;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerIdDocumentoPedido(idPedido){
      console.log('Id pedido-> ',idPedido);
      
      return this.database.executeSql("SELECT id, transacc from ddocumento where idMovil = ? ",[idPedido]).then(data => {
        let id= null;
        console.log('Datos-> ',data.rows);
        
        if(data.rows.length >0){
          console.log('Entra acá? ',data.rows);
          
          id = data.rows.item(0).id;
        }
        return id;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerDcancelaPedido(idPedido){
      console.log('Id pedido-> ',idPedido);
      
      return this.database.executeSql("SELECT id, documento as iddocumento, recibo as idrecibo, valor, debcre from dcancelacion where documento = ?",[idPedido]).then(data => {
        let dpe=[];
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            let detalle = data.rows.item(i);
            dpe.push(detalle);
          }
        }
        return dpe;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerPedidos(sincronizado){
      return this.database.executeSql("SELECT cpe.*, " +
         " CASE WHEN cpe.cliente < 0 THEN (select COALESCE(nombres,'')||' '||COALESCE(apellidos,'')||' '||cedula from cliente_movil_nuevo where id = cpe.cliente) "+
         " ELSE (select COALESCE(nombre,'')||' '||COALESCE(identificacion,'') from cliente where id = cpe.cliente) "+
         " END as nombreCliente, cpe.idzona "
       + " FROM cpedido cpe where cpe.sincronizado = ? order by id desc ",[sincronizado]).then(data => {
        let dpe=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            let iii = data.rows.item(i);
            iii.imei = this.device.uuid;
            dpe.push(iii);
          }
        }
        return dpe;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerPedidosTotal(sincronizado){
      return this.database.executeSql("SELECT sum(cpe.total) as total "
       + " FROM cpedido cpe where cpe.sincronizado = ? ",[sincronizado]).then(data => {
        let res = 0.0;
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          res = data.rows.item(0).total;
        }
        return res;
      }, err =>{
        return 0.00;
      })
    }
    obtenerPedidosFecha(sincronizado,fechaInicio,fechaFin){
      let fI = fechaInicio.substring(0,4)+fechaInicio.substring(5,7)+fechaInicio.substring(8,10);
      let fF = fechaFin.substring(0,4)+fechaFin.substring(5,7)+fechaFin.substring(8,10);
      return this.database.executeSql("SELECT cpe.*, " +
         " CASE WHEN cpe.cliente < 0 THEN (select COALESCE(nombres,'')||' '||COALESCE(apellidos,'')||' '||cedula from cliente_movil_nuevo where id = cpe.cliente) "+
         " ELSE (select COALESCE(nombre,'')||' '||COALESCE(identificacion,'') from cliente where id = cpe.cliente) "+
         " END as nombreCliente, cpe.idzona, substr(cpe.fecha,7,4)||substr(cpe.fecha,4,2)||substr(cpe.fecha,1,2) as fis"
       + " FROM cpedido cpe where cpe.sincronizado = ? and substr(cpe.fecha,7,4)||substr(cpe.fecha,4,2)||substr(cpe.fecha,1,2) BETWEEN '"+fI
       +"' and '"+fF+"' order by id desc ",[sincronizado]).then(data => {
        let dpe=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          
          
          for(var i=0; i<data.rows.length;i++){
            let iii = data.rows.item(i);
            iii.imei = this.device.uuid;
            dpe.push(iii);
          }
        }
        return dpe;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    
    obtenerTodosPedidos(){
      return this.database.executeSql("SELECT * FROM cpedido cpe order by id desc",[]).then(data => {
        let dpe=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(let i=0; i<data.rows.length;i++){
            dpe.push(data.rows.item(i).id+";"+data.rows.item(i).cliente+";"+data.rows.item(i).descuento+";"+
            data.rows.item(i).diasplazo+";"+data.rows.item(i).fecha+";"+data.rows.item(i).estado+";"+
            data.rows.item(i).sincronizado+";"+data.rows.item(i).total+";"+data.rows.item(i).observaciones+";"+
            data.rows.item(i).direccion+";"+data.rows.item(i).politica+";"+data.rows.item(i).coordx+";"+
            data.rows.item(i).coordy+";"+data.rows.item(i).idNovedad+";"+data.rows.item(i).optimo+";"+
            data.rows.item(i).sumEmpId+";"+data.rows.item(i).obsequio+";"+data.rows.item(i).subtotal+";"+
            data.rows.item(i).iva+";"+data.rows.item(i).idzona);
          }
        }
        return dpe;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerTodosDetalles(){
      return this.database.executeSql("SELECT * FROM dpedido cpe order by cpedido desc",[]).then(data => {
        let dpe=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(let i=0; i<data.rows.length;i++){
            dpe.push(data.rows.item(i).id+";"+data.rows.item(i).cpedido+";"+data.rows.item(i).producto+";"+
            data.rows.item(i).cantidad+";"+data.rows.item(i).promocion+";"+data.rows.item(i).descuento+";"+
            data.rows.item(i).precio+";"+data.rows.item(i).umedida+";"+data.rows.item(i).total+";"+
            data.rows.item(i).bodega+";"+data.rows.item(i).cordcom+";"+data.rows.item(i).preventa+";"+
            data.rows.item(i).observaciones);
          }
        }
        return dpe;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerDdocumentos(){
      return this.database.executeSql("SELECT * from ddocumento where idMovil is not null",[]).then(data => {
        let dpe=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            dpe.push(data.rows.item(i));
          }
        }
        return dpe;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerDdocumentoPorIdMovil(id){
      return this.database.executeSql("SELECT * from ddocumento where idMovil = "+id,[]).then(data => {
        let dpe=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            dpe.push(data.rows.item(i));
          }
        }
        return dpe;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerDdocumentosPorCliente(id){
      return this.database.executeSql("SELECT * from ddocumento where idcli = ? and round(saldo,2) > 0 order by fechaven asc",[id]).then(data => {
        let dpe=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            let rr = data.rows.item(i);
            let acancelar = 0.0;
            rr.todo = false;
            rr.acancelar = acancelar;
            dpe.push(rr);
          }
        }
        return dpe;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
    obtenerCantidadPedidosCliente(idCliente){
       return this.database.executeSql("SELECT COALESCE(count(id),0.0) as cant FROM cpedido cpe where cpe.sincronizado = 0 and cliente = ?",[idCliente]).then(data => {
        let res = 0.0;
        if(data.rows.length >0){
          res = data.rows.item(0).cant;
        }
        return res;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }

    obtenerResumenComercial(){
      return this.database.executeSql("SELECT pro.nombre as nombreProducto, sum(dpe.cantidad)  as cantidad, sum(dpe.total) as total from cpedido cpe, dpedido dpe, producto pro where cpe.sincronizado = 1 and cpe.id = dpe.cpedido and dpe.producto = pro.id group by pro.nombre order by pro.nombre ",[]).then(data => {
        let parametros=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            parametros.push(data.rows.item(i));
          }
        }
        return parametros;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
  }
  /*>>>>>>>>>>>>>>>>>>>>> Crecibos <<<<<<<<<<<<<<<<< */
  obtenerIdUltimoRecibo(){
        return new Promise ((resolve,reject) => {
          this.database.executeSql("SELECT COALESCE(max(id),0) cant FROM crecibo",[]).then(data => {
          let res = 1;
          if(data.rows.length >0){
            res = data.rows.item(0).cant + 1;
            resolve(res);
          }else{
            resolve(res);
          }
          }, err =>{
            reject(err);
          })
        });
      }
borrarDetallesPorRecibo(id){
	    return this.database.executeSql("DELETE FROM drecibo where recibo = ?",[id]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
}
    borrarReciboPorId(id){
	    return this.database.executeSql("DELETE FROM crecibo where id = ?",[id]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
}

    borrarCancelacionesPorRecibo(id){
	    return this.database.executeSql("DELETE FROM dcancelacion where recibo = ?",[id]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
}
  insertarCrecibo(cpe){
      return new Promise ((resolve,reject) => {this.database.executeSql("INSERT INTO crecibo (id, fecha, concepto,  cliente , empleado, total, coordx, coordy,estado, sincronizado) VALUES (?,?,?,?,?,?,?,?,?,?)",
          [
            cpe.idRecibo,
            cpe.fecha,
            cpe.concepto,
            cpe.idcliente,
            cpe.idempleado,
            cpe.total,
            cpe.coordx,
            cpe.coordy,
            cpe.estado,
            cpe.sincronizado
          ]).then(
            res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
      }).catch(e => {
        reject(e);
      }
          )});
    }
    insertarDrecibo(cpe){
      return new Promise ((resolve,reject) => {this.database.executeSql("INSERT INTO drecibo ( crecibo, tipopago, valor, emisor, beneficiario, cliente, nrocheque, nrocuenta, banco, debcre, nrodocumento, concepto, fecha, retautorizacion, fechacaducidad, retnumcomproba, fechafactura , retnumfactura) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          [
            cpe.idrecibo,
            cpe.idtpa,
            cpe.valortotal,
            cpe.emisor,
            cpe.beneficiario,
            cpe.idcliente,
            cpe.nrocheque,
            cpe.nrocuenta,
            cpe.idbanco,
            cpe.debcre,
            cpe.nrodocumento,
            cpe.concepto,
            cpe.fecha,
            cpe.retautorizacion,
            cpe.fechacaducidad,
            cpe.retnumcomproba,
            cpe.fechafactura,
            cpe.retnumfactura
            
          ]).then(
            res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
      }).catch(e => {
        reject(e);
      }
          )});
    }
    insertarDcancelacion(cpe){
      console.log('Cancelacion-> ',cpe);

        return this.database.executeSql("INSERT INTO dcancelacion (documento, recibo, valor, debcre) VALUES (?,?,?,?)",
        [
            cpe.iddocumento,
            cpe.idrecibo,
            cpe.valor,
            cpe.debcre
        ]).then(res =>{
            //console.log('Actualiza el parametro ',parametro);
            this.storage.set('database_filled',true);
            return res;
        }).catch(e => console.log(e));
    }
    
    actualizarSaldoDdo(ddo){

        return this.database.executeSql("UPDATE ddocumento SET saldo=? WHERE id=?",[ddo.saldo,ddo.id]).then(res =>{
            //console.log('Actualiza el parametro ',parametro);
            this.storage.set('database_filled',true);
            return res;
        }).catch(e => console.log(e));
  }
      actualizarSaldoDdoSuma(ddo){

        return this.database.executeSql("UPDATE ddocumento SET saldo=saldo+? WHERE id=?",[ddo.saldo,ddo.id]).then(res =>{
            //console.log('Actualiza el parametro ',parametro);
            this.storage.set('database_filled',true);
            return res;
        }).catch(e => console.log(e));
  }
  obtenerTotalesPorTpa(){
      return new Promise ( (resolve, reject) => {this.database.executeSql("select tpa.nombre, sum(dre.valor) as valor "+
                                      "from crecibo cre, drecibo dre, tipopago tpa "+
                                      "where cre.sincronizado = 0 and "+
                                      "cre.id = dre.crecibo and "+
                                      "tpa.id = dre.tipopago group by 1 order by 1 asc ",[]).then(data => {
        let dpe=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            data.rows.item(0).color ="white";
            dpe.push(data.rows.item(i));
          }
        }
        resolve(dpe);
      }, err =>{
        reject(err);
      })});
    }
    obtenerSaldoPendiente(){
      return new Promise ( (resolve, reject) => {this.database.executeSql("select sum(saldo) valor from ddocumento ",[]).then(data => {
        let res = 0.0;
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
            res = data.rows.item(0).valor;
        }
        resolve(res);
      }, err =>{
        reject(err);
      })});
    }
    obtenerRecibos(){
      return new Promise ( (resolve, reject) => {this.database.executeSql("select * from crecibo where sincronizado = 0 order by id desc ",[]).then(data => {
        let dpe=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            dpe.push(data.rows.item(i));
          }
        }
        resolve(dpe);
      }, err =>{
        reject(err);
      })});
    }
    obtenerRecibosSincro(sincro){
      return new Promise ( (resolve, reject) => {this.database.executeSql("SELECT cre.*, " +
         " CASE WHEN cre.cliente < 0 THEN (select COALESCE(nombres,'')||' '||COALESCE(apellidos,'')||' '||cedula from cliente_movil_nuevo where id = cre.cliente) "+
         " ELSE (select COALESCE(nombre,'')||' '||COALESCE(identificacion,'') from cliente where id = cre.cliente) "+
         " END as nombreCliente"
       + " FROM crecibo cre where cre.sincronizado = ? order by id desc",[sincro]).then(data => {
        let dpe=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            dpe.push(data.rows.item(i));
          }
        }
        resolve(dpe);
      }, err =>{
        reject(err);
      })});
    }
    /* >>>>>>>>>>>>>>>>>>>>>>>>>> Emisor <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getEmisores(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servEmisor/recuperarEmisores";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarEmisor(){
	    return this.database.executeSql("DELETE FROM emisor",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarEmisor(emisor){
      return new Promise ((resolve,reject)=> {this.database.executeSql("INSERT INTO emisor (id,nombre) VALUES (?,?)",
          [ emisor.id,
            emisor.nombre
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	     resolve(res)
	    }).catch(e => reject(e))});
    }   
    obtenerEmisores(){
      return this.database.executeSql("SELECT * FROM emisor",[]).then(data => {
        let parametros=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            parametros.push(data.rows.item(i));
          }
        }
        return parametros;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
  }
    /* >>>>>>>>>>>>>>>>>>>>>>>>>> Bancos <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getBancos(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servBanco/recuperarBancos";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarBanco(){
	    return this.database.executeSql("DELETE FROM banco",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarBanco(emisor){
      return new Promise ((resolve,reject)=>{this.database.executeSql("INSERT INTO banco (_id,_nombre) VALUES (?,?)",
          [ emisor.id,
            emisor.nombre
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    } 
  obtenerBancos(){
      return this.database.executeSql("SELECT * FROM banco",[]).then(data => {
        let parametros=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            parametros.push(data.rows.item(i));
          }
        }
        return parametros;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
  }
    /* >>>>>>>>>>>>>>>>>>>>>>>>>> Bancos <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getTipoPagos(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servTipoPago/recuperarTipoPagos";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarTiposPagos(){
	    return this.database.executeSql("DELETE FROM tipopago",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarTipoPago(tpa){
      return new Promise ((resolve,reject) => {this.database.executeSql("INSERT INTO tipopago (id,nombre,contabiliza,pidedetalle,transaccion,retfuente,tiporet) VALUES (?,?,?,?,?,?,?)",
          [ tpa.id,
            tpa.nombre,
            tpa.contabiliza,
            tpa.pidedetalle,
            tpa.transaccion,
            tpa.retfuente,
            tpa.tiporet
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    }   
    obtenerTiposPago(){
      return this.database.executeSql("SELECT * FROM tipopago",[]).then(data => {
        let parametros=[];
        //console.log('data parametros: ',data)
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            parametros.push(data.rows.item(i));
          }
        }
        return parametros;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
  }
     /* >>>>>>>>>>>>>>>>>>>>>>>>>> Ddocumentos <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getDocumentos(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servDocumentoPedido/recuperarDocumentosPedidos";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarDocumentos(){
	    return this.database.executeSql("DELETE FROM ddocumento",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarDocumento(ddo){
      return new Promise ((resolve,reject) => {this.database.executeSql("INSERT INTO ddocumento (id,transacc, numpago,monto, fechaven,idcli,cancelado,saldo,fechaemi,doctran) VALUES (?,?,?,?,?,?,?,?,?,?)",
          [ ddo.id,
            ddo.transacc,
            ddo.numpago,
            ddo.monto,
            ddo.fechaven,
            ddo.idcli,
            ddo.cancelado,
            ddo.saldo,
            ddo.fechaemi,
            ddo.doctran
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    } 
    insertarDocumentoMovil(ddo){
      console.log('Inserta el ddo-> ',ddo);
      
      return this.database.executeSql("INSERT INTO ddocumento (id,transacc, numpago,monto, fechaven,idcli,cancelado,saldo,fechaemi,doctran, idMovil) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
          [ ddo.id,
            ddo.transacc,
            ddo.numpago,
            ddo.monto,
            ddo.fechaven,
            ddo.idcli,
            ddo.cancelado,
            ddo.saldo,
            ddo.fechaemi,
            ddo.doctran,
            ddo.idmovil
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    }).catch(e => console.log('Error al insertar banco===> ',e));
    }     
    borrarDocumentoPorIdMovil(id){
	    return this.database.executeSql("DELETE FROM ddocumento where idMovil = ?",[id]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    obtenerIdUltimoDocumento(){
        return new Promise ((resolve,reject) => {
          this.database.executeSql("SELECT COALESCE(min(id),0) cant FROM ddocumento",[]).then(data => {
          let res = -1;
          if(data.rows.length >0){
            res = data.rows.item(0).cant -1 ;
            resolve(res);
          }else{
            resolve(res);
          }
          }, err =>{
            reject(err);
          })
        });
      }

      /* >>>>>>>>>>>>>>>>>>>>>>>>>> Cordcom <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getPreventa(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servOrden/recuperarOrdenes";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
    borrarPreventaDetalles(){
	    return this.database.executeSql("DELETE FROM dordcom",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
     borrarPreventa(){
	    return this.database.executeSql("DELETE FROM cordcom",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarPreventa(pre){
      console.log('Va a insertar ',pre);
      
      return new Promise ((resolve,reject) => {this.database.executeSql("INSERT INTO cordcom (id,fecha_aprobacion, fecha_disponibilidad,numero) VALUES (?,?,?,?)",
          [ pre.id,
            pre.fechaAprobacion,
            pre.fechaDisponibilidad,
            pre.numero
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    } 
    insertarDetallePreventa(pre){
      return new Promise ((resolve,reject) => {this.database.executeSql("INSERT INTO dordcom (id, cordcom , producto, bodega, unidad,cantidad) VALUES (?,?,?,?,?,?)",
          [ pre.id,
            pre.cordcom,
            pre.producto,
            pre.bodega,
            pre.unidad,
            pre.cantidad
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      resolve(res);
	    }).catch(e => reject(e))});
    } 
    obtenerpreventasProductoFecha(pr,producto){
      return this.database.executeSql("SELECT * FROM preventa where fechaDispon = ? and producto = ? limit 1",[pr,producto]).then(data => {
        let parametros=[];
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
           
            parametros.push(data.rows.item(i));
          }
        }
        return parametros;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
  }
    obtenerpreventas(){
      return this.database.executeSql("SELECT * FROM cordcom",[]).then(data => {
        let parametros=[];
        parametros.push({nombre:'PREDETERMINADA',id:-1});
        if(data.rows.length >0){
          for(var i=0; i<data.rows.length;i++){
            let de = {
              nombre: 'Fecha Disp: '+data.rows.item(i).fecha_disponibilidad+' ; Orden: '+data.rows.item(i).numero,
              id: data.rows.item(i).id
            }
            parametros.push(de);
          }
        }
        return parametros;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
  }
  obtenerpreventasPorProducto(producto){
    return this.database.executeSql("SELECT cor.* FROM cordcom cor, dordcom dor where cor.id = dor.cordcom and dor.producto = ?",[producto]).then(data => {
      let parametros=[];
      parametros.push({nombre:'PREDETERMINADA',id:-1});
      if(data.rows.length >0){
        for(var i=0; i<data.rows.length;i++){
          console.log('Data ',data.rows.item(i));
          
          let de = {
            nombre: 'Fecha Disp: '+data.rows.item(i).fecha_disponibilidad+' ; Orden: '+data.rows.item(i).numero,
            id: data.rows.item(i).id
          }
          parametros.push(de);
        }
      }
      return parametros;
    }, err =>{
      console.log('Error: ',err);
      return [];
    })
}
  obtenerSaldoPreventa(producto, cordcom){
      return this.database.executeSql("SELECT COALESCE(sum(cantidad),0.0) as cant FROM cordcom cor, dordcom dor  where cor.id = dor.cordcom and cor.id = ? and dor.producto = ? ",[cordcom,producto]).then(data => {
      let res = 0.0;
      if(data.rows.length >0){
        res = data.rows.item(0).cant;
      }
      return res;
    }, err =>{
      console.log('Error: ',err);
      return [];
    })
  }
  obtenerSaldoTablaPreventa(producto, cordcom){
    return this.database.executeSql("SELECT COALESCE(sum(cantidad),0.0) as cant FROM preventa where id = ? and producto = ? ",[cordcom,producto]).then(data => {
    let res = 0.0;
    if(data.rows.length >0){
      res = data.rows.item(0).cant;
    }
    return res;
  }, err =>{
    console.log('Error: ',err);
    return [];
  })
}
obtenerPrecioTablaPreventa(producto, cordcom){
  return this.database.executeSql("SELECT COALESCE(sum(precioPreventa),0.0) as cant FROM preventa where id = ? and producto = ? ",[cordcom,producto]).then(data => {
  let res = 0.0;
  if(data.rows.length >0){
    res = data.rows.item(0).cant;
  }
  return res;
}, err =>{
  console.log('Error: ',err);
  return [];
})
}

     /* >>>>>>>>>>>>>>>>>>>>>>>>>> Saldoinv <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getSaldoinv(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servSaldo/recuperarSaldos";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarSaldos(){
	    return this.database.executeSql("DELETE FROM saldoinv",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarSaldoInv(sal){
      return this.database.executeSql("INSERT INTO saldoinv (id,periodo,producto,empleado,subempleado,saldoInicial,salDeb1,salCre1,salDeb2,salCre2,salDeb3,salCre3,salDeb4,salCre4,salDeb5,salCre5,salDeb6,salCre6,salDeb7,salCre7,salDeb8,salCre8,salDeb9,salCre9,salDeb10,salCre10,salDeb11,salCre11,salDeb12,salCre12) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          [ 
            sal.id,
            sal.periodo,
            sal.producto,
            sal.empleado,
            sal.subempleado,
            sal.saldoInicial,
            sal.saldoDeb1,
            sal.saldoCre1,
            sal.saldoDeb2,
            sal.saldoCre2,
            sal.saldoDeb3,
            sal.saldoCre3,
            sal.saldoDeb4,
            sal.saldoCre4,
            sal.saldoDeb5,
            sal.saldoCre5,
            sal.saldoDeb6,
            sal.saldoCre6,
            sal.saldoDeb7,
            sal.saldoCre7,
            sal.saldoDeb8,
            sal.saldoCre8,
            sal.saldoDeb9,
            sal.saldoCre9,
            sal.saldoDeb10,
            sal.saldoCre10,
            sal.saldoDeb11,
            sal.saldoCre11,
            sal.saldoDeb12,
            sal.saldoCre12
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    }).catch(e => console.log('Error al insertar saldoinv===> ',e));
    } 

    obtenerCantidadProducto(producto){
       return this.database.executeSql("SELECT COALESCE(sum(dpe.cantidad),0.0) as cant FROM cpedido cpe, dpedido dpe  where cpe.sincronizado = 0 and dpe.cpedido = cpe.id and dpe.producto = ?",[producto]).then(data => {
        let res = 0.0;
        if(data.rows.length >0){
          res = data.rows.item(0).cant;
        }
        return res;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
    }
     obtenerSaldo(producto, anio, mes, idEmpleado){
      return this.database.executeSql("SELECT * FROM saldoinv where producto = ? and periodo = ? ",[producto,anio]).then(data => {
        let res = 0.0;
        if(data.rows.length >0){
          var it = data.rows.item(0);
          res = it.saldoInicial;
          if(mes >=1){
            res+=(it.salDeb1-it.salCre1);
          }
          if(mes >=2){
            res+=(it.salDeb2-it.salCre2);
          }
          if(mes >=3){
            res+=(it.salDeb3-it.salCre3);
          }
          if(mes >=4){
            res+=(it.salDeb4-it.salCre4);
          }
          if(mes >=5){
            res+=(it.salDeb5-it.salCre5);
          }
          if(mes >=6){
            res+=(it.salDeb6-it.salCre6);
          }
          if(mes >=7){
            res+=(it.salDeb7-it.salCre7);
          }
          if(mes >=8){
            res+=(it.salDeb8-it.salCre8);
          }
          if(mes >=9){
            res+=(it.salDeb9-it.salCre9);
          }
          if(mes >=10){
            res+=(it.salDeb10-it.salCre10);
          }
          if(mes >=11){
            res+=(it.salDeb11-it.salCre11);
          }
          if(mes >=12){
            res+=(it.salDeb12-it.salCre12);
          }
        }
        return res;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
     }
     obtenerSaldo2(producto, anio, mes){
      return this.database.executeSql("SELECT sum(saldoInicial) FROM saldoinv where producto = ? and periodo = ? ",[producto,anio]).then(data => {
        let res = 0.0;
        if(data.rows.length >0){
          var it = data.rows.item(0);
          res = it.saldoInicial;
        }
        return res;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
     }
     obtenerSaldoBodega(producto, anio, mes, bodega){
      return this.database.executeSql("SELECT sum(saldoInicial) FROM saldoinv where producto = ? and periodo = ? and empleado = ? ",[producto,anio,bodega]).then(data => {
        let res = 0.0;
        if(data.rows.length >0){
          var it = data.rows.item(0);
          res = it.saldoInicial;
        }
        return res;
      }, err =>{
        console.log('Error: ',err);
        return [];
      })
     }
     /* >>>>>>>>>>>>>>>>>>>>>>>>>> Bancos <<<<<<<<<<<<<<<<<<<<<<<<<<*/
    getRutas(parametros, uac) {
      return new Promise((resolve,reject)=> {
        var url='http://'+parametros[0].valor+":"+parametros[1].valor+"/dinamoMovil/ws/servCliruta/recuperarRutas";
        this.http.post(url,uac)
        .subscribe(
          data => {
          resolve(data.json());
        }, 
          err=> {
            console.log('Error-> ',err);
            reject(err)
          });
      });
    }
     borrarRutas(){
	    return this.database.executeSql("DELETE FROM cli_ruta",[]).then(res =>{
	      this.storage.set('database_filled',true);
	      return res;
	    });
    }
    insertarRuta(clr){
      return new Promise ((resolve,reject)=>{this.database.executeSql("INSERT INTO cli_ruta (id,idCli,zona,direccionCliente,cliSemana,cliDia,cliOrden,cliTipo,cliOptimo,cliEsDia) VALUES (?,?,?,?,?,?,?,?,?,?)",
          [ clr.id,
            clr.idCli,
            clr.zona,
            clr.direccionCliente,
            clr.cliSemana,
            clr.cliDia,
            clr.cliOrden,
            clr.cliTipo,
            clr.cliOptimo,
            clr.cliEsDia
          ]).then(res =>{
	      this.storage.set('database_filled',true);
	     resolve(res);
	    }).catch(e => reject(e))});
    }   
}
