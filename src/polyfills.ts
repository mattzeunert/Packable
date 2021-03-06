/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
 * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
 *
 * Learn more in https://angular.io/docs/ts/latest/guide/browser-support.html
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/** IE9, IE10 and IE11 requires all of the following polyfills. **/
// import 'core-js/es6/symbol';
// import 'core-js/es6/object';
// import 'core-js/es6/function';
// import 'core-js/es6/parse-int';
// import 'core-js/es6/parse-float';
// import 'core-js/es6/number';
// import 'core-js/es6/math';
// import 'core-js/es6/string';
// import 'core-js/es6/date';
// import 'core-js/es6/array';
// import 'core-js/es6/regexp';
// import 'core-js/es6/map';
// import 'core-js/es6/weak-map';
// import 'core-js/es6/set';

/** IE10 and IE11 requires the following for NgClass support on SVG elements */
// import 'classlist.js';  // Run `npm install --save classlist.js`.

/** IE10 and IE11 requires the following for the Reflect API. */
// import 'core-js/es6/reflect';


/** Evergreen browsers require these. **/
// Used for reflect-metadata in JIT. If you use AOT (and only Angular decorators), you can remove.
import 'core-js/es7/reflect';


/**
 * Required to support Web Animations `@angular/platform-browser/animations`.
 * Needed for: All but Chrome, Firefox and Opera. http://caniuse.com/#feat=web-animation
 **/
// import 'web-animations-js';  // Run `npm install --save web-animations-js`.

/**
 * By default, zone.js will patch all possible macroTask and DomEvents
 * user can disable parts of macroTask/DomEvents patch by setting following flags
 */

// (window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
// (window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
// (window as any).__zone_symbol__BLACK_LISTED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames

/*
* in IE/Edge developer tools, the addEventListener will also be wrapped by zone.js
* with the following flag, it will bypass `zone.js` patch for IE/Edge
*/
// (window as any).__Zone_enable_cross_context_check = true;

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js/dist/zone';  // Included with Angular CLI.



/***************************************************************************************************
 * APPLICATION IMPORTS
 */

declare global {
    interface Array<T> {
        /**
        * find an element in array by its id property
        */
        findId(id: string): T;
        /** 
         * find the index of an element in array by it's id property
        */
        idIndex(id: string): number;
        /**
         * This will mutate an Array (this), removing elements missing from the comparison Array, and adding ones that are missing from the original (this).
         * @param compare The array to compare with. 
         */
        compareAddRemove(compare: T[]): T[];
        /**
         * Returns a new array without undefined and null objects, and without empty arrays and string
         */
        clearUndefined(): any[];
        /**
         * Given a removeArray, the method removes any elemets with matching IDs and returns a new array
         * @param removeArray The array of items you wish to clear from the original array. (all must have ID property)
         */
        removeIds(removeArray:T[]):T[];
    }
}
type itemWithId = { id: string }

if (!Array.prototype.findId) {
    Array.prototype.findId = function <T extends itemWithId>(this: T[], id: string): T {
        return this.find(e => {
            if (e && 'id' in e) {
                return e.id === id
            } else {
                return false
            }
        })
    }
}

if (!Array.prototype.idIndex) {
    Array.prototype.idIndex = function <T extends itemWithId>(this: T[], id: string): number {
            return this.findIndex(e => {
                if (e && 'id' in e) {
                    return e.id === id
                } else {
                    return false
                }
            })
        
    }
}

if (!Array.prototype.compareAddRemove) {
    Array.prototype.compareAddRemove = function <T extends itemWithId>(this: T[], compare: T[]): T[] {
        compare.forEach(item => {
            if (!this.findId(item.id)) {
                this.unshift(item)
            }
        })
        this.slice().forEach((item) => {
            if (!compare.findId(item.id)) {
                const i = this.idIndex(item.id)
                this.splice(i, 1)
            }
        })
        return this
    }
}
if (!Array.prototype.clearUndefined) {
    Array.prototype.clearUndefined = function(this: any[]): any[] {
        let newarray = this.filter(el=>{
            return el != null && el != undefined && el != "" && el != []
        })
        return newarray
    }
}

if(!Array.prototype.removeIds){
    Array.prototype.removeIds = function <T extends itemWithId>(this:T[], removeArray:T[]):T[]{
        return this.clearUndefined().filter(item => {
            if(item !== undefined && item !== null && 'id' in item){
                return removeArray.idIndex(item.id) < 0
            } else {
                return false
            }
        })
    }
}