sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "rrhh/rrhh/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("rrhh.rrhh.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
            },

            SapId: "johannabarragan149@gmail.com",

            RutaAppFirmarPedidos: 'https://54437e09trial-dev-logali-approuter.cfapps.us10.hana.ondemand.com/logaligroupemployees/index.html'
        });
    }
);