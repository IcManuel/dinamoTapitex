import { Component } from '@angular/core';
import { App,Platform} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { ListaClientesPage } from '../pages/lista-clientes/lista-clientes';
import { Device } from '@ionic-native/device';
import { Storage } from '@ionic/storage';
import { HomePage } from '../pages/home/home';
import { MenuPage } from '../pages/menu/menu';
import { Keyboard } from '@ionic-native/keyboard';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;

  constructor(private androidFullScreen: AndroidFullScreen, appCtrl:App, platform: Platform, 
              statusBar: StatusBar, splashScreen: SplashScreen, private device: Device, 
              public storage:Storage, public keybo: Keyboard) {
    platform.ready().then(() => {
      if (platform.is('android')) {
        keybo.disableScroll(true);
      }
      this.storage.get("usuario").then(res=>{
        if(res!==null && res !== undefined){
          this.rootPage = MenuPage;
        }else{
          this.rootPage = HomePage;
        }
      }).catch(rrr =>{
        console.log('Error ',rrr.message);
        
      })
      this.androidFullScreen.isImmersiveModeSupported().then(() => 
      {
        this.androidFullScreen.immersiveMode();
      }).catch(
        (error: any) => console.log(error)
      );
      platform.registerBackButtonAction(()=>{
        if(appCtrl.getRootNav().canGoBack()){
            
        }else{
          platform.exitApp();
        }
      });
      statusBar.styleDefault();
      splashScreen.hide();
     
      
    });
  }
  presBack(){

  }
}

