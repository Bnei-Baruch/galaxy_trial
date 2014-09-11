$(function() {
  var settings = $('#js-settings').data();
  var chatClient = $('#js-chat-client');
  if (chatClient.size() > 0) {
    chatClient.append(
        '<iframe scrolling="yes" style="width: 100%; height: 100%;" ' +
        'src="http://dev.we.kab.tv/?label=shidur_' + settings.participantId +
        '&css=' + location.origin + '/static/css/chat.css' +
        '&auto_approve=true' +
        '&from_text=Participant' +
        '&name_text=' + settings.participantId +
        '&static_form=true' +
        '"></iframe>');
  }
});

function loadChatModerator() {
  var chatModerator = $('#js-chat-moderator');
  if (chatModerator.size() > 0) {
    chatModerator.append(
        '<iframe scrolling="yes" style="width: 100%; height: 100%;" ' +
        'src="http://dev.we.kab.tv/admin.html?label=shidur_*' +
        '&css=' + location.origin + '/static/css/chat.css' +
        '&auto_approve=true' +
        '&from_text=Shidur' +
        '&name_text=Moderator' +
        '&alert_on_empty_to=true' +
        '&static_form=true' +
        '"></iframe>');
  }
}
