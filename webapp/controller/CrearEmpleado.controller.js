
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/UploadCollectionParameter"
], function (Controller,MessageBox,UploadCollectionParameter) {
	"use strict";
    return Controller.extend("rrhh.rrhh.controller.CrearEmpleado", {
        onBeforeRendering: function() {
            this._wizard = this.byId("CreateEmployeeWizard");
            var oFirstStep = this._wizard.getSteps()[0];        
            this._wizard.discardProgress(oFirstStep);
            this._wizard.goToStep(oFirstStep); //al inicio
            oFirstStep.setValidated(false);      

            this._vistaCrearEmpleado = this.getView();
            var empleadosModel = new sap.ui.model.json.JSONModel([]);
            this._vistaCrearEmpleado.setModel(empleadosModel, "empleadosModel");      
        },
        goDataEmpleado: function (oEvent) {    	
            let datosEmpleadoStep = this.byId("datosEmpleadoStep");
            let tipoEmpleadoStep = this.byId("tipoEmpleadoStep");		
            let button = oEvent.getSource();
            let tipoEmpleado = button.data("tipoEmpleado");
                    
            // Interno: 24000
            // Autonomo: 400
            // Gerente: 70000
            let Salary,Type,ValorMinimo,ValorMaximo;
            switch(tipoEmpleado){
                case "interno":
                    Salary = 24000;
                    ValorMinimo=12000;
                    ValorMaximo=80000;
                    Type = "0";
                    break;
                case "autonomo":
                    Salary = 400;
                    ValorMinimo=100;
                    ValorMaximo=2000;
                    Type = "1";
                    break;
                case "gerente":
                    Salary = 70000;
                    ValorMinimo=50000;
                    ValorMaximo=200000;
                    Type = "2";
                    break;
                default:
                    break;
            }

            this.empleadosModel = this._vistaCrearEmpleado.getModel("empleadosModel");
            this._vistaCrearEmpleado.getModel("empleadosModel").setData({
                _type : tipoEmpleado,
                Type : Type,
                _Salary : Salary,
                FirstName: "Ingresa el nombre ",
                _ValorMinimo : ValorMinimo,
                _ValorMaximo : ValorMaximo
            });
            

            //Si esta todo bien pasamos al paso 2
            if(this._wizard.getCurrentStep() === tipoEmpleadoStep.getId()){
                this._wizard.nextStep();
            }else{		
                this._wizard.goToStep(datosEmpleadoStep);
            }
        },
        validateDNI: function(oEvent){
            //Se comprueba si es dni o cif. En caso de dni, se comprueba su valor. Para ello se comprueba que el tipo no sea "autonomo"
            if(this.empleadosModel.getProperty("_type") !== "autonomo"){
                var dni = oEvent.getParameter("value");
                var number;
                var letter;
                var letterList;
                var regularExp = /^\d{8}[a-zA-Z]$/;
                //Se comprueba que el formato es v??lido
                if(regularExp.test (dni) === true){
                    //N??mero
                    number = dni.substr(0,dni.length-1);
                    //Letra
                    letter = dni.substr(dni.length-1,1);
                    number = number % 23;
                    letterList="TRWAGMYFPDXBNJZSQVHLCKET";
                    letterList=letterList.substring(number,number+1);
                if (letterList !== letter.toUpperCase()) {
                    this.empleadosModel.setProperty("/_DniState","Error");
                }else{
                    this.empleadosModel.setProperty("/_DniState","None");
                    this.validacionEmpleado();
                }
                }else{
                    this.empleadosModel.setProperty("/_DniState","Error");
                }
            }
        },        
        validacionEmpleado: function(oEvent,callback) {
            var object = this.empleadosModel.getData();
            var isValid = true;
            if(!object.FirstName){
                object._FirstNameState = "Error";
                isValid = false;
            }else{
                object._FirstNameState = "None";
            }
            
            if(!object.LastName){
                object._LastNameState = "Error";
                isValid = false;
            }else{
                object._LastNameState = "None";
            }
            
            if(!object.CreationDate){
                object._CreationDateState = "Error";
                isValid = false;
            }else{
                object._CreationDateState = "None";
            }
            if(!object.Dni){
                object._DniState = "Error";
                isValid = false;
            }else{
                object._DniState = "None";
            }

            if(isValid) {
                this._wizard.validateStep(this.byId("datosEmpleadoStep"));
            } else {
                this._wizard.invalidateStep(this.byId("datosEmpleadoStep"));
            }
            //Si hay callback se devuelve el valor isValid
            if(callback){
                callback(isValid);
            }
        },        
        wizardCompletedHandler: function(oEvent){
            //Se comprueba que no haya error
            this.validacionEmpleado(oEvent,function(isValid){
                if(isValid){
                    //Se navega a la p??gina review
                    var wizardNavContainer = this.byId("wizardNavContainer");
                    wizardNavContainer.to(this.byId("ResumenDatos"));
                    //Se obtiene los archivos subidos
                    var uploadCollection = this.byId("UploadCollection");
                    var files = uploadCollection.getItems();
                    var numFiles = uploadCollection.getItems().length;
                    this._vistaCrearEmpleado.getModel("empleadosModel").setProperty("/_numFiles",numFiles);
                    if (numFiles > 0) {
                        var arrayFiles = [];
                        for(var i in files){
                            arrayFiles.push({DocName:files[i].getFileName(),MimeType:files[i].getMimeType()});	
                        }
                        this._vistaCrearEmpleado.getModel("empleadosModel").setProperty("/_files",arrayFiles);
                    }else{
                        this._vistaCrearEmpleado.getModel("empleadosModel").setProperty("/_files",[]);
                    }
                }else{
                    this._wizard.goToStep(this.byId("datosEmpleadoStep"));
                }
            }.bind(this));
        },                
        editStep: function(step){            
            let wizardNavContainer = this.byId("wizardNavContainer");
            let fnAfterNavigate = function () {
                this._wizard.goToStep(this.byId(step));
                wizardNavContainer.detachAfterNavigate(fnAfterNavigate);
            }.bind(this);

            wizardNavContainer.attachAfterNavigate(fnAfterNavigate);
            wizardNavContainer.back();
        },        
        onSaveEmployee: function(){
            var jsonDatosEmpleado = this._vistaCrearEmpleado.getModel("empleadosModel").getData();
            var body = {};
            var body = {
                SapId: this.getOwnerComponent().SapId,
                Type: jsonDatosEmpleado.Type.toString(),
                FirstName: jsonDatosEmpleado.FirstName,
                LastName: jsonDatosEmpleado.LastName,
                Dni: jsonDatosEmpleado.Dni,
                CreationDate: jsonDatosEmpleado.CreationDate,
                Comments: jsonDatosEmpleado.Comments,
                UserToSalary: [
                    {
                        Amount: parseFloat(jsonDatosEmpleado._Salary).toString(),
                        Comments: jsonDatosEmpleado.Comments,
                        Waers: "EUR"
                    }
                ]
            }

            this.getView().setBusy(true);
            this.getView().getModel("oDataEmpleados").create("/Users",body,{
                success : function(data){
                    this.getView().setBusy(false);
                    //Se almacena el nuevo usuario
                    this.newUser = data.EmployeeId;
                    sap.m.MessageBox.information(this.oView.getModel("i18n").getResourceBundle().getText("empleadoNuevo") + ": " + this.newUser,{
                        onClose : function(){                            
                            var wizardNavContainer = this.byId("wizardNavContainer");
                            wizardNavContainer.back();
                            
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);                            
                            oRouter.navTo("MenuApp",{},true);
                        }.bind(this)
                    });
                    //Se llama a la funci??n "upload" del uploadCollection
                    this.onStartUpload();
                }.bind(this),
                error : function(){
                    this.getView().setBusy(false);
                }.bind(this)
            });
        },
        onCancel: function(){
            //Se muestra un mensaje de confirmaci??n
            sap.m.MessageBox.confirm(this.oView.getModel("i18n").getResourceBundle().getText("preguntaCancelar"),{
                onClose : function(oAction){
                    if(oAction === "OK"){
                        //Regresamos al men?? principal
                        //Se obtiene el conjuntos de routers del programa
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                        //Se navega hacia el router "menu"
                        oRouter.navTo("menu",{},true);
                    }
                }.bind(this)
            });            
        },
        
        //Funci??n que se ejecuta al cargar un fichero en el uploadCollection
        //Se pone el token csrf-token
        onChange: function(oEvent) {
        var oUploadCollection = oEvent.getSource();
        // Header Token
        var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
            name: "x-csrf-token",
            value: this.getView().getModel("oDataEmpleados").getSecurityToken()
        });
        oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
        },
        
        //Funci??n que se ejecuta por cada fichero que se va a subir a sap
        //Se debe agregar el parametro de cabecera "slug" con el valor "id de sap del alumno",id del nuevo usuario y nombre del fichero, separados por ;
        onBeforeUploadStart: function(oEvent) {
        var oCustomerHeaderSlug = new UploadCollectionParameter({
                    name: "slug",
                    value: this.getOwnerComponent().SapId+";"+this.newUser+";"+oEvent.getParameter("fileName")
                });
                oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        },        
        onStartUpload: function(ioNum) {
            var that = this;
            var oUploadCollection = that.byId("UploadCollection");
            oUploadCollection.upload();
        }
	});
});