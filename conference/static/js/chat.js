/*jshint curly:true, indent:4, strict:true*/

/* TODO: Integrate into the AngularJS app */

(function($, config, chat) {
    "use strict";

    $(function() {
        var nuveConfig = $('#js-nuve-config').data();
        var chatClient = $('#js-chat-client');

        if (chatClient.size() > 0) {
            chatClient.append(
                '<iframe scrolling="yes" style="width: 100%; height: 100%;" ' +
                'src="' + config.chat.baseURL + '?label=shidur_' + nuveConfig.userId +
                '&css=' + location.origin + config.chat.cssPath +
                '&auto_approve=true' +
                '&from_text=Participant' +
                '&name_text=' + nuveConfig.userId +
                '&static_form=true' +
                '"></iframe>');
        }
    });

    chat.loadChatModerator = function () {
        var chatModerator = $('#js-chat-moderator');
        if (chatModerator.length > 0) {
            chatModerator.append(
                    '<iframe scrolling="yes" style="width: 100%; height: 100%;" ' +
                    'src="' + config.chat.baseURL + 'admin.html?label=shidur_*' +
                    '&css=' + location.origin + config.chat.cssPath +
                    '&auto_approve=true' +
                    '&from_text=Shidur' +
                    '&name_text=Technical Support' +
                    '&alert_on_empty_to=true' +
                    '&static_form=true' +
                    '&buzzer=true' +
                    '"></iframe>');
        }
    };
})(jQuery, window.config, window.chat = {});
