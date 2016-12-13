"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var angular = require("angular");
var angular_ui_router_1 = require("angular-ui-router");
var core_1 = require("@angular/core");
var static_1 = require("@angular/upgrade/static");
var ui_router_ng2_1 = require("ui-router-ng2");
/**
 * Create a ng1 module for the ng1 half of the hybrid application to depend on.
 *
 * Example:
 * var myApp = angular.module('myApp', ['ui.router.upgrade']);
 */
exports.upgradeModule = angular.module('ui.router.upgrade', ['ui.router']);
/**
 * UIViewNgUpgrade is a component bridge from ng1 ui-view to ng2 ui-view
 *
 * When a ui-router for ng1 is registering a state it checks if a view's
 * `component:` is an ng2 Component class. If so, it creates a special ng1 template
 * which references this component, i.e., <ui-view-ng-upgrade></ui-view-ng-upgrade>
 *
 * See that code by searching ng1-to-ng2 source for: "$stateProvider.decorator"
 *
 * ---
 *
 * ng1-to-ng2 component bridge process:
 *
 * 1)
 * When an ng1 template creates a ui-view which is targeted by a ng2 Component,
 *
 * ```
 * <a ui-sref="foo">Go to foo</a>
 * <div ui-view> <!-- ui-view created in ng1 template -->
 * </div> <!-- targeted with { component: Ng2RoutedComponent } -->
 * ```
 *
 * the state decorator spits out a custom template.  That template loads this
 * ng2 Component adapter as a downgraded-to-ng1 directive.
 *
 * ```
 * <a ui-sref="foo">Go to foo</a>
 * <div ui-view> <!-- decorated template references the downgraded component -->
 *   <ui-view-ng-upgrade> <!-- downgraded adapter component -->
 *   </ui-view-ng-upgrade>
 * </div>
 * ```
 *
 * This downgraded ng2 Component then creates a child UIView (ng2 component)
 *
 * ```
 * <a ui-sref="foo">Go to foo</a>
 * <div ui-view> <!-- custom template references the downgraded component -->
 *   <ui-view-ng-upgrade> <!-- ng2 component adapter downgraded to ng1-->
 *     <ui-view> <!-- pure ng2 ui-view -->
*      </ui-view>
 *   </ui-view-ng-upgrade>
 * </div>
 * ```
 *
 * which in turn is filled with the routed ng2 component.
 *
 * ```
 * <a ui-sref="foo">Go to foo</a>
 * <div ui-view> <!-- ng1 ui-view -->
 *   <ui-view-ng-upgrade> <!-- ng2 component adapter (downgraded to ng1)-->
 *     <ui-view> <!-- pure ng2 ui-view -->
 *       <ng2-routed-component> <!-- ng2 component hosted in ng2 ui-view -->
 *         <h1>ng2 routed component contents</h1>
 *       </ng2-routed-component>
 *     </ui-view>
 *   </ui-view-ng-upgrade>
 * </div>
 * ```
 *
 * This adapter exposes exposes the parent view context (ParentUIViewInject)
 * as an ng2 DI Provider, which the nested ng2 UIView requires.
 *
 * It gets the ParentUIViewContext information (from the parent ng1 ui-view) by walking
 * up the DOM and grabbing the .data('$uiView') which the ng1 ui-view directive exposes.
 */
var UIViewNgUpgrade = (function () {
    function UIViewNgUpgrade(ref, parent, registry // access the root state
    ) {
        // From the ui-view-ng-upgrade component's element ref, walk up the DOM two elements...
        // There will first be an ng1 ui-view which hosts this element, and then that ui-view's parent element.
        // That (parent) element has access to the proper "parent viewcontext"
        // The ng2 ui-view component is inside this ui-view-ng-upgrade directive, which is inside the ng1 "host" ui-view.
        // Both ui-views share the same "view context" information (the view's fqn and created-by-state context information)
        var ng1elem = angular.element(ref.nativeElement).parent().parent();
        // Expose getters on PARENT_INJECT for context (creation state) and fqn (view address)
        // These will be used by further nested UIView
        Object.defineProperty(parent, "context", {
            get: function () {
                var data = ng1elem['inheritedData']('$uiView');
                return (data && data.$cfg) ? data.$cfg.viewDecl.$context : registry.root();
            },
            enumerable: true
        });
        Object.defineProperty(parent, "fqn", {
            get: function () {
                var data = ng1elem['inheritedData']('$uiView');
                return (data && data.$uiView) ? data.$uiView.fqn : null;
            },
            enumerable: true
        });
    }
    return UIViewNgUpgrade;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], UIViewNgUpgrade.prototype, "name", void 0);
UIViewNgUpgrade = __decorate([
    core_1.Component({
        selector: 'ui-view-ng-upgrade',
        template: "<ui-view [name]=\"name\"></ui-view>",
        // provide a blank object as PARENT_INJECT.
        // The component will add property getters when it is constructed.
        viewProviders: [{ provide: ui_router_ng2_1.UIView.PARENT_INJECT, useValue: {} }],
    }),
    __param(1, core_1.Inject(ui_router_ng2_1.UIView.PARENT_INJECT)),
    __metadata("design:paramtypes", [core_1.ElementRef, Object, ui_router_ng2_1.StateRegistry // access the root state
    ])
], UIViewNgUpgrade);
exports.UIViewNgUpgrade = UIViewNgUpgrade;
/**********************************
 * Ng2 @NgModule and bootstrap code
 **********************************/
// Register the ng1 DI '$uiRouter' object as an ng2 Provider.
function uiRouterUpgradeFactory(router, injector) {
    var modules = injector.get(ui_router_ng2_1.UIROUTER_MODULE_TOKEN, []);
    modules.forEach(function (module) { return ui_router_ng2_1.applyModuleConfig(router, injector, module); });
    return router;
}
/**
 * This NgModule should be added to the root module of the hybrid app.
 */
var Ng1ToNg2Module = (function () {
    function Ng1ToNg2Module() {
    }
    return Ng1ToNg2Module;
}());
Ng1ToNg2Module = __decorate([
    core_1.NgModule({
        imports: [ui_router_ng2_1.UIRouterModule, static_1.UpgradeModule],
        declarations: [UIViewNgUpgrade],
        providers: [
            { provide: '$uiRouter', useFactory: function (i) { return i.get('$uiRouter'); }, deps: ['$injector'] },
            // ui-router-ng2 code will use the ng1 $uiRouter instance instead of creating its own.
            { provide: ui_router_ng2_1.UIRouter, useFactory: uiRouterUpgradeFactory, deps: ['$uiRouter', core_1.Injector] },
            { provide: ui_router_ng2_1.UIROUTER_ROOT_MODULE, useValue: {}, multi: true }
        ].concat(ui_router_ng2_1._UIROUTER_SERVICE_PROVIDERS, [
            {
                provide: ui_router_ng2_1.UIView.PARENT_INJECT,
                deps: [ui_router_ng2_1.StateRegistry],
                useFactory: function (r) {
                    return { fqn: null, context: r.root() };
                },
            },
        ]),
        entryComponents: [
            UIViewNgUpgrade
        ],
        exports: [UIViewNgUpgrade, ui_router_ng2_1.UIRouterModule]
    }),
    __metadata("design:paramtypes", [])
], Ng1ToNg2Module);
exports.Ng1ToNg2Module = Ng1ToNg2Module;
// Downgrade the UIViewNgUpgrade ng2 Component to an ng1 directive.
// The directive is used in a (generated) view template by the (host) ng1 ui-router,
// whenever it finds a view configured with a `component: <Ng2ComponentClass>`
exports.upgradeModule.directive("uiViewNgUpgrade", static_1.downgradeComponent({
    component: UIViewNgUpgrade,
    inputs: ['name']
}));
exports.upgradeModule.run(['$injector', function (ng1Injector) {
        var $uiRouter = ng1Injector.get('$uiRouter');
        new ui_router_ng2_1.UIRouterRx($uiRouter);
        // Expose a merged ng1/ng2 injector as a Resolvable (on the root state).
        // This mimics how ui-router-ng2 exposes the root ng2 Injector, but
        // it retrieves from ng1 injector first, then ng2 injector if the token isn't found.
        var mergedInjector = {
            get: function (token, ng2NotFoundValue) {
                var ng2Injector = ng1Injector.get('$$angularInjector');
                return (ng1Injector.has(token) && ng1Injector.get(token)) || ng2Injector.get(token, ng2NotFoundValue);
            }
        };
        var ng2InjectorResolvable = ui_router_ng2_1.Resolvable.fromData(ui_router_ng2_1.NATIVE_INJECTOR_TOKEN, mergedInjector);
        $uiRouter.stateRegistry.root().resolvables.push(ng2InjectorResolvable);
    }]);
/**
 * Adds a state decorator which modifies a state's view configuration as it's being registered.
 *
 * ---
 *
 * Define a stateProvider `views` builder decorator.
 * The decorator first applies the standard views builder function.
 * Then it finds any view components which are **actually** a Ng2 Component Class.
 * It overwrites that view's config with a ng1-to-ng2 hybrid config.
 *
 * In place of the template provider, it simply puts a <ui-view-ng-upgrade/> component
 * which that provides a ng1 -> ng2 boundary in the component tree.
 */
exports.upgradeModule.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.decorator('views', function (state, parentFn) {
            var views = parentFn(state);
            ui_router_ng2_1.forEach(views, function (viewDecl, viewName) {
                if (viewDecl.$type === 'ng1-to-ng2' || isNg2ComponentClass(viewDecl.component)) {
                    // Update the view config.
                    // Override default ng1 `component:` behavior (of defining a templateProvider)
                    // with a <ui-view-ng-upgrade> adapter directive template
                    viewDecl.$type = "ng1-to-ng2";
                    viewDecl.templateProvider = null;
                    viewDecl.template = "<ui-view-ng-upgrade name='" + viewDecl.$uiViewName + "'></ui-view-ng-upgrade>";
                }
            });
            return views;
        });
    }]);
// UI-Router ViewConfig factories take a view declaration object from a state.views: { foo: <ViewDeclaration> }
// and return a runtime config object (a ViewConfig)
exports.upgradeModule.run(['$view', function ($view) {
        // Register a ViewConfig factory for views of type `ng2`
        $view.viewConfigFactory('ng2', function (path, config) { return new ui_router_ng2_1.Ng2ViewConfig(path, config); });
        // Register a ViewConfig factory for views of type `ng1-to-ng2`.
        // Returns both an ng1 config and an ng2 config allowing either ng1 or ng2 ui-view components to be targeted.
        $view.viewConfigFactory('ng1-to-ng2', function (path, config) {
            var ng1ViewConfig = new angular_ui_router_1.Ng1ViewConfig(path, Object.assign({}, config, { $type: 'ng1' }));
            var ng2ViewConfig = new ui_router_ng2_1.Ng2ViewConfig(path, Object.assign({}, config, { $type: 'ng2' }));
            return [ng2ViewConfig, ng1ViewConfig];
        });
    }]);
/** Predicate fn that returns true if an object is a NG2 Component Class */
function isNg2ComponentClass(def) {
    if (typeof def !== 'function')
        return false;
    return Reflect['getMetadata']('annotations', def)
        .find(function (x) { return x instanceof core_1.Component; });
}
exports.isNg2ComponentClass = isNg2ComponentClass;
//# sourceMappingURL=ng1-to-ng2.js.map