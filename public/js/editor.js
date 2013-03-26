jQuery(document).ready(function($) {

    var SAVE_DELAY = 1000; // time to wait since the last change in order to save to the server

    // sample data
    var structure = {
        general : {
            name  : "Otto C von Wachter",
            email : "vonwao@gmail.com",
            image : 'http://m.c.lnkd.licdn.com/media/p/1/000/193/1d1/0173a49.jpg'
        },
        widgets : [
            {type : 'rich-text-widget', label : "About me"},
            {type : 'collection-widget', label : "My video"}
        ]
    };


    var app = angular.module("app", []);

    app.value("ui.config", {
        sortable : {
            axis                 : "y",
            handle               : "h3",
            placeholder          : "ui-state-highlight",
            forceHelperSize      : true,
            forcePlaceholderSize : true,
            scroll               : true,
            delay                : 100
        }
    });

    app.factory("serverService", ["$http", function($http) {
        return {
            getUserStructure  : function(cb) {
                $http.get("/getUserStructure").success(function(data, status, headers, config) {
                    cb(data);
                }).error(function(data, status, headers, config) {
                        cb(data);
                    });
            },
            saveUserStructure : function(structure, cb) {
                $http.post("/saveUserStructure", structure).success(function(data, status, headers, config) {
                    cb();
                }).error(function(data, status, headers, config) {
                        cb(data);
                    });
            }
        }
    }]);

    app.controller("StructureCtrl", ["$scope", "serverService", function($scope, serverService) {

        // TODO: use this to load the initial structure rather than using the sample structure
//        serverService.getUserStructure(function(err, data) {
//            if(data) {
//                $scope.$apply(function() {
//                    $scope.structure = data;
//                })
//            }
//        });

        $scope.structure = structure;
        $scope.removeWidgetByIdx = function(widgetIdx) {
            $scope.structure.widgets.splice(widgetIdx, 1);
        };
        $scope.save = function() {

            var json = angular.toJson($scope.structure);
            alert("saving: " + json);

            // TODO: Call the service to save the structure
//                serverService.saveUserStructure($scope.structure, function(err) {
//                    if(err)
//                        alert("Error saving to server")
//                });
        };
        $scope.toggleGeneralEditMode = function() {
            $scope.generalMode = $scope.generalMode === 'edit' ? 'view' : 'edit';
        };

        $scope.addWidget = function(widgetData) {
            $scope.editModeWidget = widgetData;
            $scope.structure.widgets.push(widgetData);
        };


//        var timer;
//        $scope.$watch(function() {
//
//            if(timer)
//                window.clearTimeout(timer);
//
//            timer = window.setTimeout(function() {
//                timer = null;
//
//                var json = angular.toJson($scope.structure);
//                console.log("Saving to the server");
//                console.log(json);
//
//                // TODO: Call the service to save the structure
////                serverService.saveUserStructure($scope.structure, function(err) {
////                    if(err)
////                        alert("Error saving to server")
////                });
//            }, SAVE_DELAY);
//        });
    }]);

    app.controller("GeneralStructureCtrl", ["$scope", "serverService", function($scope, serverService) {
        $scope.editGeneral = angular.copy(structure.general);
        $scope.toggleMode = function() {
            scope.mode = scope.mode === 'edit' ? 'view' : 'edit';
        };
        $scope.saveGeneral = function() {
            $.extend(true, structure.general, $scope.editGeneral);
            $scope.save();
            $scope.toggleGeneralEditMode();
        };
        $scope.revertGeneral = function() {
            $scope.editGeneral = angular.copy(structure.general);
            $scope.toggleGeneralEditMode();
        };
        $scope.isCleanGeneral = function() {
            return angular.equals(structure.general, $scope.editGeneral);
        };
    }]);

    app.directive("widget", function($compile) {
        return {
            templateUrl : "partials/widget.html",
            replace     : true,
            link        : function(scope, elm, $attrs) {

                var isClosed = function() {
                    return elm.hasClass('widget-close');
                };
                var open = function() {
                    if(!isClosed())
                        return;
                    contentNode.slideDown(null, function() {
                        elm.addClass('widget-open').removeClass('widget-close');
                    });
                };
                var close = function() {
                    if(isClosed())
                        return;
                    contentNode.slideUp(null, function() {
                        elm.addClass('widget-close').removeClass('widget-open');
                    });
                };

                function toggleExpando() {
                    if(isClosed())
                        open();
                    else
                        close();
                };

                scope.toggleMode = function() {
                    scope.mode = scope.mode === 'edit' ? 'view' : 'edit';
                    if(scope.mode === 'edit')
                        open();
//                    else
//                        close();
                };


                scope.editWidget = angular.copy(scope.widget);

                var str = '<div ' + scope.widget.type + '></div>';

                scope.revertWidget = function() {
                    scope.editWidget = angular.copy(scope.widget);
                    scope.toggleMode();
                };
                scope.saveWidget = function() {
                    $.extend(true, scope.widget, scope.editWidget);
                    scope.save();
                    scope.toggleMode();
                };
                scope.isCleanWidget = function() {
                    // compare scope.widget vs scope.editWidget
//                    alert("widget val: "+angular.toJson(scope.widget))
                    return angular.equals(scope.widget, scope.editWidget);
                };

                var node = $compile(str)(scope);
                var contentNode = elm.find('.widget-content');
                contentNode.append(node);


                elm.find('.widget-header').click(function() {
                    if(scope.mode === 'edit')
                        return;
                    toggleExpando();
                });

                if(scope.editModeWidget === scope.widget) {
                    scope.toggleMode();
                    scope.editModeWidget = null;
                    // TODO: May want to focus the first edit widget after expanding the pane
                }

            }
        };
    });
    app.directive("richTextWidget", function() {
        return {
            templateUrl : "partials/richTextWidget.html",
            link        : function(scope, elm, $attrs) {

            }
        };
    });
    app.directive("collectionWidget", function() {
        return {
            templateUrl : "partials/collectionWidget.html",
            link        : function(scope, elm, $attrs) {

            }
        };
    });
    app.directive("pallet", function() {
        return {
            templateUrl : "partials/pallet.html", //"<fieldset><legend>hi hi</legend>ok ok</fieldset>", // templateUri
            link        : function(scope, elm, $attrs) {
                window.setTimeout(function() {
                    elm.find(".pallet-node").draggable({
                        connectToSortable    : $('#editor'),
                        helper               : 'clone',
                        zIndex               : 9999,
                        appendTo             : $('body'),
                        cursor               : "move",
                        forceHelperSize      : true,
                        distance             : 5,
                        forcePlaceholderSize : true,
                        scroll               : true
                    });
                }, 40);
            }
        };
    });

    app.directive("editor", function() {
        return {
            templateUrl : "partials/editor.html", //"<fieldset><legend>hi hi</legend>ok ok</fieldset>", // templateUri
            replace     : true,
            link        : function(scope, elm, $attrs) {

            }
        };
    });

    app.directive('uiSortable', ['ui.config', function(uiConfig) {
        return {
            require : '?ngModel',
            link    : function(scope, element, attrs, ngModel) {
                var onReceive, onRemove, onStart, onUpdate, opts;

                opts = angular.extend({}, uiConfig.sortable, scope.$eval(attrs.uiSortable));

                if(ngModel) {

                    ngModel.$render = function() {
                        element.sortable("refresh");
                    };

                    onStart = function(e, ui) {
                        if(locked)
                            return;
                        // Save position of dragged item
                        ui.item.sortable = { index : ui.item.index() };
                    };

                    onUpdate = function(e, ui) {
                        if(locked)
                            return;
                        // For some reason the reference to ngModel in stop() is wrong
                        ui.item.sortable.resort = ngModel;
                    };

                    onReceive = function(e, ui) {
                        if(locked)
                            return;
                        ui.item.sortable.relocate = true;
                        // added item to array into correct position and set up flag
                        ngModel.$modelValue.splice(ui.item.index(), 0, ui.item.sortable.moved);
                    };

                    onRemove = function(e, ui) {
                        // copy data into item
                        if(ngModel.$modelValue.length === 1) {
                            ui.item.sortable.moved = ngModel.$modelValue.splice(0, 1)[0];
                        } else {
                            ui.item.sortable.moved = ngModel.$modelValue.splice(ui.item.sortable.index, 1)[0];
                        }
                    };

                    var locked = false;
                    onStop = function(e, ui) {

                        if(locked) {
                            locked = false;
                            return;
                        }

                        // digest all prepared changes
                        if(ui.item.sortable.resort && !ui.item.sortable.relocate) {

                            // Fetch saved and current position of dropped element
                            var end, start;
                            start = ui.item.sortable.index;
                            end = ui.item.index();

                            // Reorder array and apply change to scope
                            ui.item.sortable.resort.$modelValue.splice(end, 0, ui.item.sortable.resort.$modelValue.splice(start, 1)[0]);
                        }
                        if(ui.item.sortable.resort || ui.item.sortable.relocate) {
                            scope.$apply();
                        }
                    };

                    // If user provided 'start' callback compose it with onStart function
                    opts.start = (function(_start) {
                        return function(e, ui) {
                            onStart(e, ui);
                            if(typeof _start === "function")
                                _start(e, ui);
                        }
                    })(opts.start);

                    // If user provided 'start' callback compose it with onStart function
                    opts.stop = (function(_stop) {
                        return function(e, ui) {
                            onStop(e, ui);
                            if(typeof _stop === "function")
                                _stop(e, ui);
                        }
                    })(opts.stop);

                    // If user provided 'update' callback compose it with onUpdate function
                    opts.update = (function(_update) {
                        return function(e, ui) {
                            onUpdate(e, ui);
                            if(typeof _update === "function")
                                _update(e, ui);
                        }
                    })(opts.update);

                    // If user provided 'receive' callback compose it with onReceive function
                    opts.receive = (function(_receive) {
                        return function(e, ui) {
                            onReceive(e, ui);
                            if(typeof _receive === "function")
                                _receive(e, ui);
                        }
                    })(opts.receive);

                    // If user provided 'remove' callback compose it with onRemove function
                    opts.remove = (function(_remove) {
                        return function(e, ui) {
                            onRemove(e, ui);
                            if(typeof _remove === "function")
                                _remove(e, ui);
                        };
                    })(opts.remove);

                    opts.beforeStop = function(event, ui) {
                        if(ui.helper.hasClass('pallet-node')) {
                            var idx = ui.item.index();
                            var newObj = JSON.parse(ui.helper.attr('data-widget-data'));

                            ui.item.remove();
                            ui.helper.remove();

                            ngModel.$modelValue.splice(idx, 0, newObj);
                            scope.editModeWidget = newObj;
                            scope.$apply();

                            locked = true;
                        }
                    };
                }

                // Create sortable
                element.sortable(opts);
            }
        };
    }
    ]);

    app.directive('wysihtml5', ['ui.config', function(uiConfig) {
        uiConfig.wysihtml5 = uiConfig.wysihtml5 || {};
        return {
            require : 'ngModel',
            link    : function(scope, elm, attrs, ngModel) {

                var lock = false;

                // update the model
                var changeHandler = function() {
                    var val = elm.val();
                    if(ngModel.$viewValue !== val) {
                        lock = true;
                        try {
                            ngModel.$setViewValue(val);
                            if(!scope.$$phase)
                                scope.$apply();
                        } finally {
                            lock = false;
                        }
                    }
                };

                // update editor
                var update = function() {
                    if(!lock)
                        elm.val(scope[attrs.ngModel]);
                };

                var expression,
                    options = {
//                        toolbar     : "toolbar",
//                        stylesheets : "css/stylesheet.css",
//                        parserRules : wysihtml5ParserRules
//                        "font-styles" : true, //Font styling, e.g. h1, h2, etc. Default true
//                        "emphasis"    : true, //Italics, bold, etc. Default true
//                        "lists"       : true, //(Un)ordered lists, e.g. Bullets, Numbers. Default true
//                        "html"        : false, //Button which allows you to edit the generated HTML. Default false
//                        "link"        : true, //Button to insert a link. Default true
//                        "image"       : true, //Button to insert an image. Default true,
//                        "color"       : false, //Button to change color of font
                        "events" : {
                            "load"                  : function() {
                                update();
                                scope.$watch(attrs.ngModel, update);

                                // update the model
                                var changeHandler = function() {
                                    var val = elm.val();
                                    if(ngModel.$viewValue !== val) {
                                        lock = true;
                                        ngModel.$setViewValue(elm.val());
                                        if(!scope.$$phase)
                                            scope.$apply();
                                        lock = false;
                                    }
                                };
                                $(this.composer.element).keypress(changeHandler).keydown(changeHandler).keyup(changeHandler);
                            },
                            'change:composer'       : changeHandler,
                            'change:textarea'       : changeHandler,
                            'paste'                 : changeHandler,
                            'paste:composer'        : changeHandler,
                            'paste:textarea'        : changeHandler,
                            'newword:composer'      : changeHandler,
                            'change_view'           : changeHandler,
                            'undo:composer'         : changeHandler,
                            'redo:composer'         : changeHandler,
                            'aftercommand:composer' : changeHandler,
                            "change"                : changeHandler,
                            "blur"                  : changeHandler
                        }
                    };

                if(attrs.wysihtml5) {
                    expression = scope.$eval(attrs.wysihtml5);
                } else {
                    expression = {};
                }
                angular.extend(options, uiConfig.wysihtml5, expression);

                setTimeout(function() {
                    elm.wysihtml5(options)
                });
            }
        };
    }]);

    angular.bootstrap($('body'), ["app"]);

});