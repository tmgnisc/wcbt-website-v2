/**
 * Emergency Notice Module
 * version 1.1
 */
var EmergencyNotices;
(function ($) {
    EmergencyNotices = {
        setCookie: function (cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires + ";" + "path=/";
        },
        getCookie: function (cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
            }
            return "";
        },
        init: function (attrs) {

            var $this = this;
            //Path of the JSON file with the Related Content Navigation Object
            var url = typeof attrs !== 'undefined' && typeof attrs.url !== 'undefined' ? attrs.url : $('[data-t4-emergency-notices]').data('t4-emergency-notices');
            var mainContainerClass = typeof attrs !== 'undefined' && typeof attrs.mainContainerClass !== 'undefined' ? attrs.mainContainerClass : '[data-t4-emergency-notices]';
            var singleNoticeClass = typeof attrs !== 'undefined' && typeof attrs.singleNoticeClass !== 'undefined' ? attrs.singleNoticeClass : '[data-t4-emergency-notices] [data-id]';
            var closeButtonClass = typeof attrs !== 'undefined' && typeof attrs.closeButtonClass !== 'undefined' ? attrs.closeButtonClass : '[data-close]';
            var closedClass = typeof attrs !== 'undefined' && typeof attrs.closedClass !== 'undefined' ? attrs.closedClass : 'closed';

            var EmCookieSet = $this.getCookie('emergency').split(',');
            var random = Math.floor(Math.random() * (1 - 1000 + 1) + 1);
            var checkBanner = $.getJSON((url.indexOf("?") >= 0 ? url : url + '?ver=' + random), function (data) {
                // Ignore dummy element
                let idsInUse = {};
                let noticesClean = {};
                if (data.notices.length > 1) {
                    for (i = 0; i < data.notices.length - 1; i++) {
                        if (Object.keys(idsInUse).indexOf(data.notices[i].id) > -1) {
                            let publishDateNotice = new Date(data.notices[i].publishDate);
                            let expireDateNotice = new Date(data.notices[i].expireDate);

                            if ((!isNaN(publishDateNotice) && new Date() >= publishDateNotice && !isNaN(expireDateNotice) && new Date() < expireDateNotice)) {
                                idsInUse[data.notices[i].id] = i;
                            }
                        } else {
                            idsInUse[data.notices[i].id] = i;
                        }
                    }
                }

                if (data.notices.length > 1) {
                    // Iterate over each notice in the JSON
                    for (i = 0; i < data.notices.length - 1; i++) {

                        if (Object.values(idsInUse).indexOf(i) === -1) {
                            continue;
                        }

                        // Create an array containing the IDs of all the notices already output on the page
                        var noticesOnPage = $(singleNoticeClass + '[data-id]').map(function () {
                            return $.map($(this).data(), function (v, k) {
                                if (k == 'id') {
                                    return v.toString();
                                }
                            });
                        }).get();

                        // Checks if the notice is in the cookie
                        var noticeInCookie = ($.inArray(data.notices[i].id + '>>' + data.notices[i].version , EmCookieSet) < 0) ? false : true;
                        // Checks if notice is already on the page
                        var noticeOnPage = ($.inArray(data.notices[i].id, noticesOnPage) < 0) ? false : true;
                        // Checks if notice is of type 'emergency;
                        var isEmergency = (data.notices[i].noticetype == 'Emergency') ? true : false;

                        if (noticeOnPage) {
                            if (noticeOnPage && $(singleNoticeClass + '[data-id="' + data.notices[i].id + '"]').data('version') != data.notices[i].version) {
                                $(singleNoticeClass + '[data-id="' + data.notices[i].id + '"]').remove();
                                noticeOnPage = false;
                            } else {
                                let publishDate = new Date($(singleNoticeClass + '[data-id="' + data.notices[i].id + '"]').data('publishDate'));
                                let expireDate = new Date($(singleNoticeClass + '[data-id="' + data.notices[i].id + '"]').data('expireDate'));
                                let publishDateNotice = new Date(data.notices[i].publishDate);
                                let expireDateNotice = new Date(data.notices[i].expireDate);
                                if (!isNaN(publishDate) && new Date() < publishDate) {
                                    $(singleNoticeClass + '[data-id="' + data.notices[i].id + '"]').remove();
                                    noticeOnPage = false;
                                } else if (!isNaN(publishDateNotice) && new Date() < publishDateNotice) {
                                    $(singleNoticeClass + '[data-id="' + data.notices[i].id + '"]').remove();
                                    noticeOnPage = false;
                                } else if (!isNaN(expireDate) && new Date() >= expireDate) {
                                    $(singleNoticeClass + '[data-id="' + data.notices[i].id + '"]').remove();
                                    noticeOnPage = false;
                                } else if (!isNaN(expireDateNotice) && new Date() >= expireDateNotice) {
                                    $(singleNoticeClass + '[data-id="' + data.notices[i].id + '"]').remove();
                                    noticeOnPage = false;
                                }
                            }
                        }

                        // Output the notice only if:
                        // this notice is not in the cookie and is not on the page OR
                        // the notice is in the cookie AND not on the page already but is also an Emergency notice
                        if ((!noticeInCookie && !noticeOnPage) || (noticeInCookie && !noticeOnPage && isEmergency)) {
                            
                            let publishDateNotice = new Date(data.notices[i].publishDate);
                            let expireDateNotice = new Date(data.notices[i].expireDate);
                            
                            if (!isNaN(publishDateNotice) && new Date() < publishDateNotice) {
                                continue;
                            } else if (!isNaN(expireDateNotice) && new Date() > expireDateNotice) {
                                continue;
                            }
                            $(mainContainerClass).append(data.notices[i].html);

                            // Remove ability to dismiss "Emergency" notices
                            if (isEmergency) {
                                $(closeButtonClass + '[data-close="' + data.notices[i].id + '"]').remove();
                            }
                            
                        }

                    }

                    // Hide notices on click
                    $(singleNoticeClass + ' ' + closeButtonClass).on('click', function () {
                        var thisId = $(this).parents('[data-id]').attr('data-id');
                        var thisVer = $(this).parents('[data-id]').attr('data-version');
                        var parentNotice = $(this).parents(singleNoticeClass).slideUp(300).addClass(closedClass);

                        // Double checks notice type before addign to cookie
                        if (!parentNotice.hasClass('emergency')) {
                            var currentCookie = $this.getCookie('emergency');

                            if (currentCookie == '') {
                                $this.setCookie('emergency', thisId + '>>' + thisVer, 1);
                            } else {
                                var cookieArray = currentCookie.split(',');
                                if ($.inArray(thisId + '>>' + thisVer, cookieArray) < 0) {
                                    $this.setCookie('emergency', currentCookie + ',' + thisId + '>>' + thisVer, 1);
                                }
                            }
                        }
                    });
                }
            }).fail(function () {
                console.error("Failed to get emergency notice JSON File");
            })

            
            setTimeout(function () {
                $this.init(attrs);
            }, 20000); // Modify this number to change how often the json file is polled
        }
    }


    /** Emergency Notices **/
    // Cookie Functions

    if ($('[data-t4-emergency-notices]').length) {
        EmergencyNotices.init({});
    }

})(jQuery);



