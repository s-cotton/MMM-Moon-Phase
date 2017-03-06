/* global Log, Module, moment, config */
/* Magic Mirror
 * Module: MMM-Sonarr-Calendar
 *
 * By Stephen Cotton
 * MIT Licensed.
 */

//var Module, Log, moment, config, Log, moment, document;

Module.register("MMM-Moon-Phase", {

     // Default module config.
    defaults: {
        timezone: -5,
        hourOfDay: 0,
        shadowColor: "#000",
        moonColor: "#FFF",

        debug: true,

        updateInterval: 1000 * 60 * 60 * 12
    },

    components: {
        views: {}
    },

    mainView: null,

    updater: null,
    lastUpdate: 0,

    suspend: function(){
        this.stopUpdateTimer();
    },
    resume: function(){
        this.startUpdateTimer();
    },

    // Subclass start method.
    start: function () {
        Log.info("Starting module: " + this.name);
        if (this.config.debug) Log.info(this.name + " config: ", this.config);

        var self = this;
        
        this.setupViews();

        self.getMoonData();

        this.startUpdateTimer();

    },

    startUpdateTimer: function(){
        var self = this;
        if( moment().valueOf() - this.lastUpdate > this.config.updateInterval ){
            this.getMoonData();
        }
        this.updater = setInterval(function(){
            self.getMoonData();
        }, this.config.updateInterval );
    },

    stopUpdateTimer: function(){
        clearInterval(this.updater);
    },

    setupViews: function(){
        var self = this;
        this.components.views.moonView = Backbone.View.extend({
            tagName: "div",
            className: "moon-view",
            template: MMMMoonPhase.Templates.moonView,

            phase: 0,

            setPhase: function(phase){
                this.phase = phase
            },

            render: function(){
                this.$el.html( this.template() );
                return this;
            }
        });        
    },

    getScripts: function() {
        return [
            'https://code.jquery.com/jquery-2.2.3.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone-min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.6/handlebars.runtime.min.js',
            this.file('bower_components/js-planet-phase/planet_phase.js'),
            this.file('templates.js')
        ];
    },

    getStyles: function() {
        return [
            this.file('css/main.css')
        ];
    },

    moon_phase: function(){

        var today = moment();
        var year  = parseInt(today.format('YYYY'));
        var month = parseInt(today.format('M'));
        var day   = parseInt(today.format('D'));

        var c, e, jd, b;
        c = e = jd = b = 0.0;
        
        if (month < 3){
            year--;
            month += 12;
        }

        month = month + 1;

        c  = 365.25 * year;
        e  = 30.6 * month;
        jd = c + e + day - 694039.09;   //jd is total days elapsed
        jd = jd / 29.5305882;           //divide by the moon cycle
        b  = parseInt(jd);              //int(jd) -> b, take integer part of jd
        jd = jd - b;                    //subtract integer part to leave fractional part of original jd
        b  = Math.round(jd * 8);        //scale fraction from 0-8 and round

        if (b >= 8 ) b = 0; //0 and 8 are the same so turn 8 into 0
        
        switch (b){
            case 0: return 0;     break; // New Moon
            case 1: return 0.125; break; // Waxing Crescent Moon
            case 2: return 0.25;  break; // Quarter Moon
            case 3: return 0.375; break; // Waxing Gibbous Moon
            case 4: return 0.5;   break; // Full Moon
            case 5: return 0.625; break; // Waning Gibbous Moon
            case 6: return 0.75;  break; // Last Quarter Moon
            case 7: return 0.875; break; // Waning Crescent Moon
            default: return -1;   break; // Error
        }
    },


    getMoonData: function(){
        if (this.config.debug) Log.info('Moon Phases :: Refreshing Data');
        this.refreshMoonData( this.moon_phase() );
    },

    refreshMoonData: function(){
        var self = this;
        this.updateDom();
    },

    
    // Override dom generator.
    getDom: function () {
        var wrapper, self;
        self = this;

        //var updatesCollection = new this.components.collections.updates( this.models );
        var moonView = new this.components.views.moonView();
        setTimeout(function(){
            drawPlanetPhase( document.getElementById('moon-phase-image'), self.moon_phase(), true, {
                shadowColor: self.shadowColor,
                lightColour: self.moonColor,
                diameter: 50,
                earthshit: 0,
                blur: 0
            });
        },1000);
        return '';// moonView.render().el;

    },
});