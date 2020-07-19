   /// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
   /// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
   
   import watchUtils = require("esri/core/watchUtils");
   import Handles = require("esri/core/Handles");
   import { declared, property, subclass } from "esri/core/accessorSupport/decorators";
   import MapView = require("esri/views/MapView");
   import SceneView = require("esri/views/SceneView");
   import Widget = require("esri/widgets/Widget");
   import { renderable, tsx } from "esri/widgets/support/widget";

   import { ICwMapHelper } from "./typings/cw-map-helper";
   
   const CSS = {
     widgetIcon: "esri-icon-checkbox-unchecked"
   };
   
   @subclass("esri.widgets.CWTemplate")
   class CWTemplate extends declared(Widget) {
     //--------------------------------------------------------------------------
     //
     //  Lifecycle
     //
     //--------------------------------------------------------------------------
   
     constructor() {
       super();
       this._onMapHelperChange = this._onMapHelperChange.bind(this);
     }

     postInitialize(): void {
       this._handles.add(watchUtils.init(this, "mapHelper", () => this._onMapHelperChange()));
     }

     render() {
       return <div>Hello World</div>;
     }

     destroy(): void {
      this._handles.destroy();
      this._handles = null;
     }
	 
	 //--------------------------------------------------------------------------
     //
     //  Variables
     //
     //--------------------------------------------------------------------------
   
     private _handles: Handles = new Handles();
   
     //--------------------------------------------------------------------------
     //
     //  Properties
     //
     //--------------------------------------------------------------------------

     @property()
     basePath: string = null;
	 
	   @property()
     iconClass = CSS.widgetIcon;
     
     @property()
     @renderable()
     mapHelper: ICwMapHelper = null;
     
     @property()
     @renderable()
     layout: { [layout: string]: { strings: { [key: string]: string } } } = null;

     @property()
     view: MapView | SceneView = null;
   
     //--------------------------------------------------------------------------
     //
     //  Private Methods
     //
     //--------------------------------------------------------------------------

	 private _getCustomString(layout: string, key: string): string {
       return this.layout && this.layout[layout] && this.layout[layout].strings && this.layout[layout].strings[key] ? this.layout[layout].strings[key] : key;
     }
	 
     private _onMapHelperChange() {
        if (this.mapHelper) {
            this.view = this.mapHelper.map.getMapView();
        }
     }
   }
   
   export = CWTemplate;