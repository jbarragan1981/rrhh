sap.ui.define([
	"sap/ui/core/mvc/Controller"
], 
/**
 * 
 */
    function (Controller) {
	"use strict";
	
	function onInit(){
		
	}
	
	function onAfterRendering(){
	
	}
		
	function crearEmpleado(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("CrearEmpleado",{},false);
	}
	
	//Función al pulsar sobre el Tile "Ver empleados". Hace un routing a la vista "showEmployee"
	function verEmpleado(){
			//Se obtiene el conjuntos de routers del programa
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//Se navega hacia el router "CreateEmployee"
			oRouter.navTo("VerEmpleado",{},false);
	}

    function firmarPedidos() {
        const RutaAppFirmarPedidos = this.getOwnerComponent().RutaAppFirmarPedidos;
        window.open(RutaAppFirmarPedidos, '_blank');
    };

    var menuApp = Controller.extend("rrhh.rrhh.controller.MenuApp", {});
    menuApp.prototype.onInit = onInit;
    menuApp.prototype.onAfterRendering = onAfterRendering;
    menuApp.prototype.crearEmpleado = crearEmpleado;
    menuApp.prototype.verEmpleado = verEmpleado;
    menuApp.prototype.firmarPedidos = firmarPedidos

});