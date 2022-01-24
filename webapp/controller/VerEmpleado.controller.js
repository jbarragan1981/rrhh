// @ts-nocheck

sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], 
/**
 * 
 * @param {sap.ui.core.mvc.Controller} Controller 
 * @param {sap.ui.core.routing.History} History 
 * @param {sap.ui.model.Filter} Filter 
 * @param {sap.ui.model.FilterOperator} FilterOperator 
 */
function (Controller,History,Filter,FilterOperator) {
	"use strict";
	
	function onInit(){
		this._splitAppEmployee = this.byId("splitAppEmployee");
        this._SapId = this.getOwnerComponent().SapId;
	}
	
	//Función al pulsar "<" para regresar al menú
	function onPressBack(){
			// vamos al menu
			let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("MenuApp", {}, true);
	}
	
	//Search field empleados
	function onSearchEmployee(oEvent){		
        let filters = [];
        let sQuery = oEvent.getSource().getValue();        
    
        var filter = new Filter({
            filters: [
               /* new Filter({
                    path:'SapId',
                    operator:'EQ',
                    value1:this.getOwnerComponent().SapId
                }),*/
                new Filter({
                    path: 'FirstName',
                    operator: FilterOperator.Contains,
                    value1: sQuery
                })
            ],
            and: true
        })
        filters.push(filter);
    
        var oList = this.byId("listEmpleados");
        var oBinding = oList.getBinding("items");
        oBinding.filter(filters, "Application");        
	}
	
	//Función al seleccionar un empleado
	function onSelectEmployee(oEvent){
		this._splitAppEmployee.to(this.createId("detailEmployee"));
		let context = oEvent.getParameter("listItem").getBindingContext("oDataEmpleados");
		this.employeeId = context.getProperty("EmployeeId");
		let detailEmployee = this.byId("detailEmployee");
		detailEmployee.bindElement("oDataEmpleados>/Users(EmployeeId='"+ this.employeeId +"',SapId='"+this.getOwnerComponent().SapId+"')");
		
	}
	
	//Función para eliminar el empleado seleccionado
	function onDeleteEmployee(oEvent){
		sap.m.MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("seguroDeEliminar"),{
			title : this.getView().getModel("i18n").getResourceBundle().getText("confirm"),
			onClose : function(oAction){
			    	if(oAction === "OK"){
						this.getView().getModel("oDataEmpleados").remove("/Users(EmployeeId='" + this.employeeId + "',SapId='"+this.getOwnerComponent().SapId+"')",{
							success : function(data){
								sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("seHaEliminadoUsuario"));
								this._splitAppEmployee.to(this.createId("detailSelectEmployee"));
							}.bind(this),
							error : function(e){
								sap.base.Log.info(e);
							}.bind(this)
						});
			    	}
			}.bind(this)
		});
	}
	
	//Función para ascender a un empleado
	function onRiseEmployee(oEvent){
		if(!this.riseDialog){            
			this.riseDialog = sap.ui.xmlfragment("rrhh/rrhh/fragments/AscenderEmpleado", this);
			this.getView().addDependent(this.riseDialog);
		}
		this.riseDialog.setModel(new sap.ui.model.json.JSONModel({}),"newRise");
		this.riseDialog.open();
	}
	
	//Función para cerrar el dialogo
	function onCloseRiseDialog(){
		this.riseDialog.close();
	}
	
	//Función para crear un nuevo ascenso
	function addRise(oEvent){
		//Se obtiene el modelo newRise
		let newRise = this.riseDialog.getModel("newRise");
		//Se obtiene los datos
		let odata = newRise.getData();
		//Se prepara la informacion para enviar a sap y se agrega el campo sapId con el id del alumno y el id del empleado
		let body = {
			Amount : odata.Amount,
			CreationDate : odata.CreationDate,
			Comments : odata.Comments,
			SapId : this.getOwnerComponent().SapId,
			EmployeeId : this.employeeId
		};
		this.getView().setBusy(true);
		this.getView().getModel("oDataEmpleados").create("/Salaries",body,{
			success : function(){
				this.getView().setBusy(false);
				sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoCorrectamente"));
				this.onCloseRiseDialog();
			}.bind(this),
			error : function(){
                this.getView().setBusy(false);
                sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoErroneo"));
			}.bind(this)
		});
		
    }
    
	function onChange (oEvent) {
	   let oUploadCollection = oEvent.getSource();	
	   let oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
	    name: "x-csrf-token",
	    value: this.getView().getModel("oDataEmpleados").getSecurityToken()
	   });
	   oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
	 }
	
	 function onBeforeUploadStart (oEvent) {
	   let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: this.getOwnerComponent().SapId+";"+this.employeeId+";"+oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
      }
    
      function onUploadComplete (oEvent) {
        let oUploadCollection = oEvent.getSource();
        oUploadCollection.getBinding("items").refresh();
    }

    function onFileDeleted(oEvent){
        let oUploadCollection = oEvent.getSource();
        let sPath = oEvent.getParameter("item").getBindingContext("oDataEmpleados").getPath();
        this.getView().getModel("oDataEmpleados").remove(sPath, {
            success: function(){
                oUploadCollection.getBinding("items").refresh();
            },
            error: function(){

            }
        });
    }

    function downloadFile(oEvent){
        let sPath = oEvent.getSource().getBindingContext("oDataEmpleados").getPath();
        window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV"+sPath+"/$value");
    }

	return Controller.extend("rrhh.rrhh.controller.ShowEmployee", {
		onInit: onInit,
		onPressBack : onPressBack,
		onSearchEmployee : onSearchEmployee,
		onSelectEmployee : onSelectEmployee,
		onDeleteEmployee : onDeleteEmployee,
		onRiseEmployee : onRiseEmployee,
		onCloseRiseDialog : onCloseRiseDialog,
        addRise : addRise,
        onChange : onChange,
        onBeforeUploadStart : onBeforeUploadStart,
        onUploadComplete : onUploadComplete,
        onFileDeleted : onFileDeleted,
        downloadFile : downloadFile
	});
});