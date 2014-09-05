$(function() {
  var settings = $('#js-settings').data();
  var chat_client = $('#js-chat-client');
  if (chat_client.length > 0) {
    chat_client.append(
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
  var chat_moderator = $('#js-chat-moderator');
  if (chat_moderator.length > 0) {
    chat_moderator.append(
        '<iframe scrolling="yes" style="width: 100%; height: 100%;" ' +
        'src="http://dev.we.kab.tv/admin.html?label=shidur_*' +
        '&css=' + location.origin + '/static/css/chat.css' +
        '&auto_approve=true' +
        '&from_text=Shidur' +
        '&name_text=Moderator' +
        '&static_form=true' +
        '"></iframe>');
  }
}
