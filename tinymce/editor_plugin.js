/**
 * TinyMCE plugin BigBlueButtonBN - provides UI to annotate the content in the text editor with a BigBlueButton recording.
 *
 * @package    atto_bigbluebuttonbn
 * @author     Jesus Federico  (jesus [at] blindsidenetworks [dt] com)
 * @copyright  2016 Blindside Networks Inc.
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

(function() {
    var each = tinymce.each;

    tinymce.PluginManager.requireLangPack('bigbluebuttonbn');

    tinymce.create('tinymce.plugins.BigBlueButtonBN', {
        /**
         * Initializes the plugin, this will be executed after the plugin has been created.
         * This call is done before the editor instance has finished it's initialization so use the onInit event
         * of the editor instance to intercept that event.
         *
         * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
         * @param {string} url Absolute URL to where the plugin is located.
         */
        init : function(ed, url) {
            ed.addCommand('mceForceRepaint', function() {
                var root = ed.dom.getRoot();
                items = root.getElementsByTagName("img");
                for (var i = 0; i < items.length; i++) {
                    src = items[i].getAttribute('src').replace(/\?\d+$/, '');
                    items[i].setAttribute('src', src+'?'+(new Date().getTime()))
                }
                ed.execCommand('mceRepaint');
                ed.focus();
            });

            ed.addCommand('mceMaximizeWindow', function(w) {
                // This function duplicates the TinyMCE windowManager code when 'maximize' button is pressed.
                var vp = ed.dom.getViewPort(),
                    id = w.id;
                // Reduce viewport size to avoid scrollbars
                vp.w -= 2;
                vp.h -= 2;

                w.oldPos = w.element.getXY();
                w.oldSize = w.element.getSize();

                w.element.moveTo(vp.x, vp.y);
                w.element.resizeTo(vp.w, vp.h);
                ed.dom.setStyles(id + '_ifr', {width : vp.w - w.deltaWidth, height : vp.h - w.deltaHeight});
                ed.dom.addClass(id + '_wrapper', 'mceMaximized');
            });

            ed.addCommand('mceBigBlueButtonBN', function() {
                var bigbluebuttonbn = ed.getParam('bigbluebuttonbn', {});
                var viewparams = '';
                for (key in bigbluebuttonbn) {
                    viewparams += (viewparams != '' ? '&' : '') + encodeURIComponent(key) + "=" + encodeURIComponent(bigbluebuttonbn[key]);
                }
                var viewurl = ed.getParam("moodle_plugin_base") + 'bigbluebuttonbn/bigbluebuttonbn.php' + (viewparams != '' ? '?' + viewparams : '');
                var onClose = function() {
                   ed.windowManager.onClose.remove(onClose);
                   ed.execCommand('mceForceRepaint');
                };
                ed.windowManager.onClose.add(onClose);
                var vp = ed.dom.getViewPort(),
                        width = 900 + parseInt(ed.getLang('advimage.delta_width', 0)),
                        height = 600 + parseInt(ed.getLang('advimage.delta_height', 0)),
                        maximizedmode = (width >= vp.w - 2 || height >= vp.h - 2);
                if (maximizedmode) {
                    width = vp.w;
                    height = vp.h;
                }
                w = ed.windowManager.open({
                    file : viewurl ,
                    width : width,
                    height : height,
                    inline : 1
                }, {
                    plugin_url : url // Plugin absolute URL
                });
                if (maximizedmode) {
                    ed.execCommand('mceMaximizeWindow', w);
                }
            });

            var bigbluebuttonbn = ed.getParam('bigbluebuttonbn', {});

            // Register button
            ed.addButton('bigbluebuttonbn', {
                title : 'bigbluebuttonbn.desc',
                cmd : 'mceBigBlueButtonBN',
                image : url + '/img/bigbluebuttonbn.png'
            });
        },
        createControl : function(n, cm) {
            return null;
        },

        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @return {Object} Name/value array containing information about the plugin.
         */
        getInfo : function() {
            return {
                longname : 'Moodle TinyMCE BigBlueButtonBN plugin',
                author : 'Jesus Federico',
                infourl : 'http://bigbluebutton.org',
                version : "1.0"
            };
        }
    });

    // Register plugin.
    tinymce.PluginManager.add('bigbluebuttonbn', tinymce.plugins.BigBlueButtonBN);
})();
