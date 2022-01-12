sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/UploadCollectionParameter"
], function (Controller,MessageBox,UploadCollectionParameter) {
	"use strict";

	function onInit(){		
        
	}
	
    function onBeforeRendering(){
        this._wizard = this.byId("CreateEmployeeWizard");
		var oFirstStep = this._wizard.getSteps()[0];        
		this._wizard.discardProgress(oFirstStep);
		this._wizard.goToStep(oFirstStep); //al inicio
		oFirstStep.setValidated(false); 

        this._empleadosModel = new sap.ui.model.json.JSONModel([]);
        this.getView().setModel(this._empleadosModel, "empleadosModel");           
        this._vistaCrearEmpleado = this.getView().byId("CrearEmpleado");
	}
	
	function goDataEmpleado(oEvent){   	
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
		
		let empleadoModel = this._vistaCrearEmpleado.getModel("empleadosModel");
        empleadoModel.setData({
			_type : tipoEmpleado,
			Type : Type,
			_Salary : Salary,
            _ValorMinimo : ValorMinimo,
            _ValorMaximo : ValorMaximo
		});
		
		//Si esta todo bien pasamos al paso 2
		if(this._wizard.getCurrentStep() === tipoEmpleadoStep.getId()){
			this._wizard.nextStep();
		}else{		
			this._wizard.goToStep(datosEmpleadoStep);
		}
	}
	
	//Función para validar el dni
	function validateDNI(oEvent){
		//Se comprueba si es dni o cif. En caso de dni, se comprueba su valor. Para ello se comprueba que el tipo no sea "autonomo"
		if(this._empleadosModel.getProperty("_type") !== "autonomo"){
			var dni = oEvent.getParameter("value");
			var number;
			var letter;
			var letterList;
			var regularExp = /^\d{8}[a-zA-Z]$/;
			//Se comprueba que el formato es válido
			if(regularExp.test (dni) === true){
				//Número
				 number = dni.substr(0,dni.length-1);
				 //Letra
				 letter = dni.substr(dni.length-1,1);
				 number = number % 23;
				 letterList="TRWAGMYFPDXBNJZSQVHLCKET";
				 letterList=letterList.substring(number,number+1);
			if (letterList !== letter.toUpperCase()) {
				this._empleadosModel.setProperty("/_DniState","Error");
			 }else{
				this._empleadosModel.setProperty("/_DniState","None");
				this.validacionEmpleado();
			 }
			}else{
				this._empleadosModel.setProperty("/_DniState","Error");
			}
		}
	}
	
	function validacionEmpleado(oEvent,callback) {
		var object = this._empleadosModel.getData();
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
	}
	
	//Función al dar al botón verificar
	function wizardCompletedHandler(oEvent){
		//Se comprueba que no haya error
		this.validacionEmpleado(oEvent,function(isValid){
			if(isValid){
				//Se navega a la página review
				var wizardNavContainer = this.byId("wizardNavContainer");
				wizardNavContainer.to(this.byId("ReviewPage"));
				//Se obtiene los archivos subidos
				var uploadCollection = this.byId("UploadCollection");
				var files = uploadCollection.getItems();
				var numFiles = uploadCollection.getItems().length;
				this._empleadosModel.setProperty("/_numFiles",numFiles);
				if (numFiles > 0) {
					var arrayFiles = [];
					for(var i in files){
						arrayFiles.push({DocName:files[i].getFileName(),MimeType:files[i].getMimeType()});	
					}
					this._empleadosModel.setProperty("/_files",arrayFiles);
				}else{
					this._empleadosModel.setProperty("/_files",[]);
				}
			}else{
				this._wizard.goToStep(this.byId("datosEmpleadoStep"));
			}
		}.bind(this));
	}
	
	//Función generica para editar un step
	function _editStep(step){
		var wizardNavContainer = this.byId("wizardNavContainer");
		//Se añade un función al evento afterNavigate, ya que se necesita 
		//que la función se ejecute una vez ya se haya navegado a la vista principal
		var fnAfterNavigate = function () {
				this._wizard.goToStep(this.byId(step));
				//Se quita la función para que no vuelva a ejecutar al volver a nevagar
				wizardNavContainer.detachAfterNavigate(fnAfterNavigate);
			}.bind(this);

		wizardNavContainer.attachAfterNavigate(fnAfterNavigate);
		wizardNavContainer.back();
	}
	
	//Función al darle al botón editar de la sección "Tipo de empleado"
	function editStepOne(){
		_editStep.bind(this)("tipoEmpleadoStep");
	}
	
	//Función al darle al botón editar de la sección "Datos de empleado"
	function editStepTwo(){
		_editStep.bind(this)("datosEmpleadoStep");
	}
	
	//Función al darle al botón editar de la sección "Información adicional"
	function editStepThree(){
		_editStep.bind(this)("datosOpcionales");
	}
	
	//Función para guardar el nuevo empleado
	function onSaveEmployee(){
		var json = this.getView().getModel().getData();
		var body = {};
		//Se obtienen aquellos campos que no empicen por "_", ya que son los que vamos a enviar
		for(var i in json){
			if(i.indexOf("_") !== 0){
				body[i] = json[i];
			}
		}
        body.SapId = this.getOwnerComponent().SapId;
		body.UserToSalary = [{
			Ammount : parseFloat(json._Salary).toString(),
			Comments : json.Comments,
			Waers : "EUR"
		}];
		this.getView().setBusy(true);
		this.getView().getModel("odataModel").create("/Users",body,{
			success : function(data){
				this.getView().setBusy(false);
				//Se almacena el nuevo usuario
				this.newUser = data.EmployeeId;
				sap.m.MessageBox.information(this.oView.getModel("i18n").getResourceBundle().getText("empleadoNuevo") + ": " + this.newUser,{
					onClose : function(){
						//Se vuelve al wizard, para que al vovler a entrar a la aplicacion aparezca ahi
						var wizardNavContainer = this.byId("wizardNavContainer");
						wizardNavContainer.back();
						//Regresamos al menú principal
			    		//Se obtiene el conjuntos de routers del programa
						var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
						//Se navega hacia el router "menu"
						oRouter.navTo("menu",{},true);
					}.bind(this)
				});
				//Se llama a la función "upload" del uploadCollection
				this.onStartUpload();
			}.bind(this),
			error : function(){
				this.getView().setBusy(false);
			}.bind(this)
		});
	}
	
	//Función al cancelar la creación
	function onCancel(){
		//Se muestra un mensaje de confirmación
		sap.m.MessageBox.confirm(this.oView.getModel("i18n").getResourceBundle().getText("preguntaCancelar"),{
			onClose : function(oAction){
		    	if(oAction === "OK"){
		    		//Regresamos al menú principal
		    		//Se obtiene el conjuntos de routers del programa
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					//Se navega hacia el router "menu"
					oRouter.navTo("menu",{},true);
		    	}
			}.bind(this)
		});
		
	}
	
	//Función que se ejecuta al cargar un fichero en el uploadCollection
	//Se agrega el parametro de cabecera x-csrf-token con el valor del token del modelo
	//Es necesario para validarse contra sap
	function onChange (oEvent) {
	   var oUploadCollection = oEvent.getSource();
	   // Header Token
	   var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
	    name: "x-csrf-token",
	    value: this.getView().getModel("odataModel").getSecurityToken()
	   });
	   oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
	 }
	
	//Función que se ejecuta por cada fichero que se va a subir a sap
	//Se debe agregar el parametro de cabecera "slug" con el valor "id de sap del alumno",id del nuevo usuario y nombre del fichero, separados por ;
	 function onBeforeUploadStart (oEvent) {
	   var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: this.getOwnerComponent().SapId+";"+this.newUser+";"+oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
	  }
	  
	  function onStartUpload (ioNum) {
	   var that = this;
	   var oUploadCollection = that.byId("UploadCollection");
	   oUploadCollection.upload();
	  }
	
	let crearEmpleadoController = Controller.extend("rrhh.rrhh.controller.CrearEmpleado", {});
    crearEmpleadoController.prototype.onInit = onInit;
	crearEmpleadoController.prototype.onBeforeRendering = onBeforeRendering;
	crearEmpleadoController.prototype.goDataEmpleado = goDataEmpleado;
	crearEmpleadoController.prototype.validateDNI = validateDNI;
	crearEmpleadoController.prototype.validacionEmpleado = validacionEmpleado;
	crearEmpleadoController.prototype.wizardCompletedHandler = wizardCompletedHandler;
	crearEmpleadoController.prototype.editStepOne = editStepOne;
	crearEmpleadoController.prototype.editStepTwo = editStepTwo;
	crearEmpleadoController.prototype.editStepThree = editStepThree;
	crearEmpleadoController.prototype.onSaveEmployee = onSaveEmployee;
	crearEmpleadoController.prototype.onCancel = onCancel;
	crearEmpleadoController.prototype.onChange = onChange;
	crearEmpleadoController.prototype.onBeforeUploadStart = onBeforeUploadStart;
	crearEmpleadoController.prototype.onStartUpload = onStartUpload;

});