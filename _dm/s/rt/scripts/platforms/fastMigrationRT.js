// All code in this file will run on fast migration sites
(function () {
    'use strict';

    var methods = {
        onDocReady: _onDocReady
    };

    ready(methods.onDocReady);

    // VANILLA DOCUMENT READY (NO JQUERY)
    // supports IE8 and above, not tested for old browsers
    function ready(fn) {
        if (document.readyState != 'loading') {
            fn();
        } else if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            document.attachEvent('onreadystatechange', function () {
                if (document.readyState != 'loading') {
                    fn();
                }
            });
        }
    }

    function fixLinks() {
        if (location.href.indexOf('preview=true') < 0) {
            return;
        }
        Array.prototype.slice.call(document.getElementsByTagName('a')).filter(
            function (link) {
                return link.href.startsWith(location.origin);
            }).map(function (link) {
            link.href = location.origin + '/site/' + Parameters.SiteAlias + ''
                + link.pathname + '?preview=true';
        });

    }

    function _onDocReady() {
        if (document.cookie
            && document.cookie.indexOf('persistentCookieExists=true') > -1) {
            $('#cookieWrapper').hide();
        }
        fixLinks();
    }

    function _formModifier() {

        $('form').not('.dmform form, .dmform').each(function () {
            $(this).attr("action", function (i, original) {

                if (original.indexOf("?a=" + Parameters.SiteAlias) < 0) {
                    return original + "?a=" + Parameters.SiteAlias;
                } else {
                    return original;
                }

            });
        });

        var forms = document.querySelectorAll(".fastform")
        for (var i = 0; i < forms.length; i++) {
            overrideSubmitForm(forms[i]);
        }

    }

    function overrideSubmitForm(form) {
        var successDiv = document.createElement("div");
        form.onsubmit = function (event) {
            event.preventDefault();

            var url = form.getAttribute("action");

            var data = new FormData(form);
            var req = new XMLHttpRequest();
            req.open("POST", url, true);

            req.onreadystatechange = function () {//Call a function when the state changes.
                if (req.readyState == XMLHttpRequest.DONE && req.status
                    == 200) {
                    var textToShow = req.responseText;
                    if (req.responseText.startsWith("ERROR_PREFIX")) {
                        textToShow = textToShow.replace("ERROR_PREFIX", "");
                    }
                    var submitBtn = form.querySelector(".fastformsubmit");
                    successDiv.innerHTML = textToShow;
                    submitBtn.parentNode.insertBefore(successDiv,
                        submitBtn.nextSibling);
                }
            }
            req.send(data);

            return false;
        }
    }

    ready(_formModifier);

}());
