import { Directive, Input, ElementRef, Renderer, ViewChild } from '@angular/core';
import { Content } from 'ionic-angular';


/**
 * Generated class for the HideHeaderDirective directive.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/DirectiveMetadata-class.html
 * for more info on Angular Directives.
 */
@Directive({
  selector: '[hide-header]', // Attribute selector,
  host:{
    '(ionScroll)':'onContentScroll($event)'
  }
})
export class HideHeaderDirective {

  //@ViewChild(Content) content: Content;
  @Input("header") header:HTMLElement;
  @Input("btn") btn:HTMLElement;
  @Input() mostrarLista: boolean;
  @Input() numItem: number;
  //@Input("mycontent") content:HTMLElement;  
  headerHeight;
  scrollContent;
  oculta=false;
  constructor(public element: ElementRef, public renderer: Renderer) {

    
  }
  ngOnInit(){ 
    this.oculta=false;
    this.headerHeight = this.header.clientHeight;
    this.renderer.setElementStyle(this.header,'webkitTransition','top 700ms');
    //this.renderer.setElementStyle(this.btn,'webkitTransition','bottom 100ms');
    console.log('Alkgo ibiei ',this.element.nativeElement);
    
    this.scrollContent = this.element.nativeElement.getElementsByClassName("scroll-content")[0];
    this.renderer.setElementStyle(this.scrollContent,'webkitTransition',"margin-top 700ms");
  }
  onContentScroll(event){
    if(event!=null && event !=undefined){

      let cont = event.contentTop;
      let cc = event.contentHeight;
      let fin = cc+cont;
      if(this.mostrarLista){
        if(event.directionY === "down" ){
          if(event.deltaY >= 100 && this.numItem>6){
            this.renderer.setElementStyle(this.header,"top",("-"+cont+"px"));
            //this.renderer.setElementStyle(this.btn,"bottom",("-"+cont+"px"));
            this.renderer.setElementStyle(this.scrollContent,"margin-top","0px");
            this.oculta=true;
          }
        }else{
          if(event.deltaY <= -150){
            this.renderer.setElementStyle(this.header,"top","0");
            this.renderer.setElementStyle(this.scrollContent,"margin-top",(cont+"px"));
            this.oculta=false;
          }
        }
      }else{
        if(this.oculta){
          this.renderer.setElementStyle(this.header,"top","0");
          this.renderer.setElementStyle(this.scrollContent,"margin-top",(cont+"px"));
          this.oculta=false;
        }
      }
    }
  }
}
