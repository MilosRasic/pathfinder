/**
 *  Util
 */
define([
    'jquery',
    'app/init',
    'bootbox',
    'easyPieChart'
], function($, Init, bootbox) {

    "use strict";

    var config = {
        ajaxOverlayClass: 'pf-loading-overlay',
        ajaxOverlayWrapperClass: 'pf-loading-overlay-wrapper',

        formEditableFieldClass: 'pf-editable',                                  // Class for all xEditable fields

        // map module
        mapModuleId: 'pf-map-module',                                           // main map module

        // available map ions
        mapIcons: [
            {
                class: 'fa-desktop',
                label: 'desktop',
                unicode: '&#xf108;'
            },{
                class: 'fa-bookmark',
                label: 'bookmark',
                unicode: '&#xf02e;'
            },{
                class: 'fa-cube',
                label: 'cube',
                unicode: '&#xf1b2;'
            },{
                class: 'fa-plane',
                label: 'plane',
                unicode: '&#xf072;'
            },{
                class: 'fa-globe',
                label: 'globe',
                unicode: '&#xf0ac;'
            },{
                class: 'fa-rocket',
                label: 'rocket',
                unicode: '&#xf135;'
            },{
                class: 'fa-life-ring',
                label: 'life ring',
                unicode: '&#xf1cd;'
            }
        ]

    };

    var stopTimerCache = {};                                                    // cache for stopwatch timer

    /**
     * get date obj with current EVE Server Time. -> Server Time === UTC time
     * @returns {Date}
     */
    var getServerTime = function(){

        var localDate = new Date();

        var serverDate= new Date(
            localDate.getUTCFullYear(),
            localDate.getUTCMonth(),
            localDate.getUTCDate(),
            localDate.getUTCHours(),
            localDate.getUTCMinutes(),
            localDate.getUTCSeconds()
        );

        return serverDate;
    };

    /**
     * start time measurement by a unique string identifier
     * @param timerName
     */
    var timeStart = function(timerName){

        if( !(stopTimerCache.hasOwnProperty(timerName)) ){

            if(typeof performance === 'object'){
                stopTimerCache[timerName] = performance.now();
            }else{
                stopTimerCache[timerName] = new Date().getTime();
            }
        }else{
            console.log('nooo')
        }
    };

    /**
     * get time delta between timeStart() and timeStop() by a unique string identifier
     * @param timerName
     * @returns {number}
     */
    var timeStop = function(timerName){

        var duration = 0;

        if( stopTimerCache.hasOwnProperty(timerName) ){
            // check browser support for performance API
            var timeNow = 0;

            if(typeof performance === 'object'){
                timeNow = performance.now();
            }else{
                timeNow = new Date();
            }

            // format ms time duration
            duration = Number( (timeNow - stopTimerCache[timerName] ).toFixed(2) );

            // delete key
            delete( stopTimerCache[timerName]);
        }

        return duration;
    };


    /**
     * trigger main logging event with log information
     * @param message
     * @param options
     */
    var log = function(logKey, options){
        $(window).trigger('pf:log', [logKey, options]);
    };

    /**
     * displays a loading indicator on an element
     */
    $.fn.showLoadingAnimation = function(options){

        var iconSize = 'fa-lg';

        if(options){
            if(options.icon){
                if(options.icon.size){
                    iconSize = options.icon.size;
                }
            }

        }

        var overlay = $('<div>', {
            class: config.ajaxOverlayClass
        }).append(
            $('<div>', {
                class: [config.ajaxOverlayWrapperClass].join(' ')
            }).append(
                $('<i>', {
                    class: ['fa', iconSize, 'fa-circle-o-notch', 'fa-spin'].join(' ')
                })
            )
        );

        $(this).append(overlay);

        // fade in
        $(overlay).velocity({
            opacity: 0.6
        },{
            duration: 200
        });
    };

    /**
     * removes a loading indicator
     */
    $.fn.hideLoadingAnimation = function(){

        var overlay = $(this).find('.' + config.ajaxOverlayClass );

        $(overlay).velocity('reverse', {
            complete: function(){
                $(this).remove();
            }
        });
    };

    /**
     * get all form Values as object
     * this includes all xEditable fields
     * @returns {{}}
     */
    $.fn.getFormValues = function(){
        var form = $(this);

        var formData = {};

        $.each(form.serializeArray(), function(i, field) {
            formData[field.name] = field.value;
        });

        // get xEditable values
        var editableValues = form.find('.' + config.formEditableFieldClass).editable('getValue');

        // merge values
        formData = $.extend(formData, editableValues);

        return formData;
    };

    /**
     * checks weather a bootstrap form is valid or not
     * validation plugin does not provide a proper function for this
     * @returns {boolean}
     */
    $.fn.isValidForm = function(){
        var form = $(this);
        var valid = false;

        var errorElements =  form.find('.has-error');

        if(errorElements.length === 0){
            valid = true;
        }

        return valid;
    };


    /**
     * checks if an element is currently visible in viewport
     * @returns {boolean}
     */
    $.fn.isInViewport = function(){

        var element = $(this)[0];
        var top = element.offsetTop;
        var left = element.offsetLeft;
        var width = element.offsetWidth;
        var height = element.offsetHeight;


        while(element.offsetParent) {
            element = element.offsetParent;
            top += element.offsetTop;
            left += element.offsetLeft;
        }

        return (
            top < (window.pageYOffset + window.innerHeight) &&
                left < (window.pageXOffset + window.innerWidth) &&
                (top + height) > window.pageYOffset &&
                (left + width) > window.pageXOffset
            );
    };

    /**
     * add a temporary class elements for a certain time
     * @param className
     * @param duration
     * @returns {*}
     */
    $.fn.addTemporaryClass = function(className, duration){

        var elements = this;
        setTimeout(function() {
            elements.removeClass(className);
        }, duration);

        return this.each(function() {
            $(this).addClass(className);
        });
    };

    /**
     * trigger a notification (on screen or desktop)
     * @param customConfig
     * @param desktop
     */
    var showNotify = function(customConfig, desktop){

        requirejs(['app/notification'], function(Notification) {
            Notification.showNotify(customConfig, desktop);
        });
    };

    /**
     * get log entry info
     * @param logType
     * @param option
     * @returns {string}
     */
    var getLogInfo = function(logType, option){
        var logInfo = '';

        if(Init.classes.logTypes.hasOwnProperty(logType)){
            logInfo = Init.classes.logTypes[logType][option];
        }

        return logInfo;
    };

    /**
     * Returns true if the user hit Esc or navigated away from the
     * current page before an AJAX call was done. (The response
     * headers will be null or empty, depending on the browser.)
     *
     * NOTE: this function is only meaningful when called from
     * inside an AJAX "error" callback!
     * @param jqXHR XMLHttpRequest instance
     * @returns {boolean}
     */
    var isXHRAborted = function(jqXHR){
        return !jqXHR.getAllResponseHeaders();
    };

    // ==================================================================================================
    // ==================================================================================================
    // ==================================================================================================

    /**
     * init the map-update-counter as "easy-pie-chart"
     */
    $.fn.initMapUpdateCounter = function(){

        var counterChart = $(this);

        counterChart.easyPieChart({
            barColor: function(percent){

                var color = '#568a89';
                if(percent <= 30){
                    color = '#d9534f';
                }else if(percent <= 50){
                    color = '#f0ad4e';
                }

                return color;

            },
            trackColor: '#2b2b2b',
            size: 30,
            scaleColor: false,
            lineWidth: 2,
            animate: 1000
        });

    };

    /**
     * get the map module object or create a new module
     * @returns {*|HTMLElement}
     */
    var getMapModule = function(){

        var mapModule = $('#' + config.mapModuleId);
        if(mapModule.length === 0){
            mapModule = $('<div>', {
                id: config.mapModuleId
            });
        }

        return mapModule;
    };

    /**
     * get all available map icons
     * @returns {*}
     */
    var getMapIcons = function(){

        return config.mapIcons;
    };

    /**
     * get all available map Types
     * @returns {Array}
     */
    var getMapTypes = function(){

        var mapTypes = [];

        $.each(Init.mapTypes, function(prop, data){

            // skip "default" type -> just for 'add' icon
            if(data.label.length > 0){
                var tempData = data;
                tempData.name = prop;

                mapTypes.push(tempData);
            }
        });

        return mapTypes;
    };

    /**
     * get map info
     * @param mapType
     * @param option
     * @returns {string}
     */
    var getInfoForMap = function(mapType, option){

        var mapInfo = '';

        if(Init.mapTypes.hasOwnProperty(mapType)){
            mapInfo = Init.mapTypes[mapType][option];
        }

        return mapInfo;
    };

    /**
     * get all available scopes for a map
     * @returns {Array}
     */
    var getMapScopes = function(){

        var scopes = [];
        $.each(Init.mapScopes, function(prop, data){
            var tempData = data;
            tempData.name = prop;
            scopes.push(tempData);
        });

        return scopes;
    };

    /**
     * get some scope info for a given info string
     * @param info
     * @param option
     * @returns {string}
     */
    var getScopeInfoForMap = function(info, option){

        var scopeInfo = '';

        if(Init.mapScopes.hasOwnProperty(info)){
            scopeInfo = Init.mapScopes[info][option];
        }

        return scopeInfo;
    };

    /**
     * get some scope info for a given info string
     * @param info
     * @param option
     * @returns {string}
     */
    var getScopeInfoForConnection = function(info, option){

        var scopeInfo = '';

        if(Init.connectionScopes.hasOwnProperty(info)){
            scopeInfo = Init.connectionScopes[info][option];
        }

        return scopeInfo;
    };


    /**
     * get system type information
     * @returns {Array}
     */
    var getSystemTypeInfo = function(systemTypeId, option){

        var systemTypeInfo = '';

        $.each(Init.systemType, function(prop, data){

            if(systemTypeId === data.id){
                systemTypeInfo = data[option];
                return;
            }
        });

        return systemTypeInfo;
    };

    /**
     * get some system info for a given info string (e.g. rally class)
     * @param info
     * @param option
     * @returns {string}
     */
    var getInfoForSystem = function(info, option){

        var systemInfo = '';

        if(Init.classes.systemInfo.hasOwnProperty(info)){
            systemInfo = Init.classes.systemInfo[info][option];
        }


        return systemInfo;
    };

    /**
     * get some info for a given effect string
     * @param effect
     * @param option
     * @returns {string}
     */
    var getEffectInfoForSystem = function(effect, option){

        var effectInfo = '';

        if( Init.classes.systemEffects.hasOwnProperty(effect) ){
            effectInfo = Init.classes.systemEffects[effect][option];
        }

        return effectInfo;
    };

    /**
     * get system effect data by system security and system class
     * @param secureity
     * @param effect
     * @returns {boolean}
     */
    var getSystemEffectData = function(securety, effect){

        var areaId = getAreaIdBySecurity(securety);

        var data = false;

        if(
            Init.systemEffects &&
            Init.systemEffects.wh[effect] &&
            Init.systemEffects.wh[effect][areaId]
        ){
            data = Init.systemEffects.wh[effect][areaId];
        }

        return data;
    };

    var getSystemEffectTable = function(data){

        var table = '';

        if(data.length > 0){

            table += '<table>';

            for(var i = 0; i < data.length; i++){
                table += '<tr>';
                table += '<td>';
                table += data[i].effect;
                table += '</td>';
                table += '<td class="text-right">';
                table += data[i].value;
                table += '</td>';
                table += '</tr>';
            }

            table += '</table>';
        }


        return table;
    };

    /**
     * get a css class for the security level of a system
     * @param sec
     * @returns {string}
     */
    var getSecurityClassForSystem = function(sec){
        var secClass = '';

        if( Init.classes.systemSecurity.hasOwnProperty(sec) ){
            secClass = Init.classes.systemSecurity[sec]['class'];
        }

        return secClass;
    };

    /**
     * get a css class for the trueSec level of a system
     * @param sec
     * @returns {string}
     */
    var getTrueSecClassForSystem = function(trueSec){
        var trueSecClass = '';

        trueSec = parseFloat(trueSec);

        // check for valid decimal number
        if(
            !isNaN( trueSec ) &&
            isFinite( trueSec )
        ){
            if(trueSec < 0){
                trueSec = 0;
            }

            trueSec = trueSec.toFixed(1).toString();

            if( Init.classes.trueSec.hasOwnProperty(trueSec) ){
                trueSecClass = Init.classes.trueSec[trueSec]['class'];
            }
        }

        return trueSecClass;
    };

    /**
     * get status info
     * @param status
     * @param option
     * @returns {string}
     */
    var getStatusInfoForSystem = function(status, option){

        var statusInfo = '';

        if( Init.systemStatus.hasOwnProperty(status) ){
            // search by status string
            statusInfo = Init.systemStatus[status][option];
        }else{
            // saarch by statusID
            $.each(Init.systemStatus, function(prop, data){

                if(status === data.id){
                    statusInfo = data[option];
                    return;
                }
            });
        }

        return statusInfo;
    };

    /**
     * get Connection Info by option
     * @param connectionTyp
     * @param option
     * @returns {string}
     */
    var getConnectionInfo = function(connectionTyp, option){

        var connectionInfo = '';
        if(Init.connectionTypes.hasOwnProperty(connectionTyp)){
            connectionInfo = Init.connectionTypes[connectionTyp][option];
        }

        return connectionInfo;
    };


    var getSignatureGroupInfo = function(option){

        var groupInfo = {};

        for (var prop in Init.signatureGroups) {
            if(Init.signatureGroups.hasOwnProperty(prop)){
                prop = parseInt(prop);
                groupInfo[prop] = Init.signatureGroups[prop][option];
            }
        }

        return groupInfo;
    };

    /**
     * get Signature names out of global
     * @param systemType
     * @param areaId
     * @param sigGroupId
     * @returns {{}}
     */
    var getAllSignatureNames = function(systemType, areaId, sigGroupId){

        var signatureNames = {};

        if(
            Init.signatureTypes[systemType] &&
            Init.signatureTypes[systemType][areaId] &&
            Init.signatureTypes[systemType][areaId][sigGroupId]
        ){
            signatureNames =  Init.signatureTypes[systemType][areaId][sigGroupId];
        }

        return signatureNames;
    };

    /**
     * get the typeID of a signature name
     * @param systemData
     * @param sigGroupId
     * @param name
     * @returns {number}
     */
    var getSignatureTypeIdByName = function(systemData, sigGroupId, name){

        var signatureTypeId = 0;

        name = name.toLowerCase();

        var systemConfig = systemData.config;

        var areaId = getAreaIdBySecurity(systemConfig.security);

        var signatureNames = getAllSignatureNames(systemConfig.type, areaId, sigGroupId );

        for(var prop in signatureNames) {

            if(
                signatureNames.hasOwnProperty(prop) &&
                signatureNames[prop].toLowerCase() === name
            ){
                signatureTypeId = parseInt( prop );
                break;
            }
        }

        return signatureTypeId;
    };

    /**
     * get Area ID by security string
     * k-space not implemented jet
     * @param security
     * @returns {*}
     */
    var getAreaIdBySecurity = function(security){

        var areaId = null;

        switch(security){
            case 'C1':
                areaId = 1;
                break;
            case 'C2':
                areaId = 2;
                break;
            case 'C3':
                areaId = 3;
                break;
            case 'C4':
                areaId = 4;
                break;
            case 'C5':
                areaId = 5;
                break;
            case 'C6':
                areaId = 6;
                break;
        }

        return areaId;
    };

    /**
     * shut the software down e.g. on error
     * @param reason
     */
    var emergencyShutdown = function(reason){

        // close all open dialogs
        bootbox.hideAll();

        var content = $('<div>');

        content.append(
            $('<h2>', {
                text: 'Sorry! Under normal circumstances that should not happen.'
             })
        );

        content.append(
            $('<p>', {
                text: reason
            })
        );

        var systemDialog = bootbox.dialog({
            title: '<span class="txt-color txt-color-red"><i class="fa fa-fw fa-bolt"></i>Emergency shutdown</span>',
            message: content,
            buttons: {
                danger: {
                    label: 'restart',
                    className: 'btn-danger',
                    callback: function () {
                        location.reload();
                    }
                }
            }
        });

        $(document).setProgramStatus('offline');
        showNotify({title: 'Emergency shutdown', text: reason, type: 'error'}, false);

        // remove map
        getMapModule().velocity('fadeOut', {
            duration: 250,
            complete: function(){
                $(this).remove();
            }
        });

    };

    return {
        getServerTime: getServerTime,
        timeStart: timeStart,
        timeStop: timeStop,
        log: log,
        showNotify: showNotify,
        getLogInfo: getLogInfo,
        isXHRAborted: isXHRAborted,
        getMapModule: getMapModule,
        getMapIcons: getMapIcons,
        getMapTypes: getMapTypes,
        getInfoForMap: getInfoForMap,
        getMapScopes: getMapScopes,
        getScopeInfoForMap: getScopeInfoForMap,
        getScopeInfoForConnection: getScopeInfoForConnection,
        getSystemTypeInfo: getSystemTypeInfo,
        getInfoForSystem: getInfoForSystem,
        getEffectInfoForSystem: getEffectInfoForSystem,
        getSystemEffectData: getSystemEffectData,
        getSystemEffectTable: getSystemEffectTable,
        getSecurityClassForSystem: getSecurityClassForSystem,
        getTrueSecClassForSystem: getTrueSecClassForSystem,
        getStatusInfoForSystem: getStatusInfoForSystem,
        getConnectionInfo: getConnectionInfo,
        getSignatureGroupInfo: getSignatureGroupInfo,
        getAllSignatureNames: getAllSignatureNames,
        getSignatureTypeIdByName: getSignatureTypeIdByName,
        getAreaIdBySecurity: getAreaIdBySecurity,
        emergencyShutdown: emergencyShutdown
    };
});