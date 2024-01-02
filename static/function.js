"use strict";

var ws;

$(document).ready(function () {

  ws = new WebSocket("ws://localhost:8000/ws");
  ws.onmessage = function(event){
    //websocket연결을 통해 서버로부터 실시간으로 메세지가 전송될때 호출
    var data = JSON.parse(event.data);
    var userId = $('#userId').val();
    if(userId != data.userId){
      addMessageToChat(data, userId);
      
    }
  }

  $('.Login').submit(function (e){
    e.preventDefault();
    var userId = $('#userId').val();
  
    if(userId.length != 0){
      $('#sender').empty();
      $.getJSON("/get_messages", function(messages){
        messages.forEach(function (message){
          addMessageToChat(message, userId);
        })
      });
    }
    
  });

  //enter 버튼에 대하여 작동시키기
  $("button[name='sender_button']").click(sender_send);

  //enter키를 눌러도 보내지기
  $("#sender_text").keypress(function (e) {
    if (e.which == 13) {
      sender_send();
      e.preventDefault();
    }
  });

  //단 enter+shift가 눌리면 줄바꿈
  $("#sender_text").keydown(function (e) {
    if(e.which == 13 && e.shiftKey) {
      let text = $(this).val();
      $(this).val(text + "\n");
      e.preventDefault();
    }
  });
});

function getTime(date) {
  //현재 시간을 알맞는 포멧으로 변경
  let hours = date.getHours();
  let min = date.getMinutes();

  let ampm = hours >= 12 ? "오후" : "오전";

  hours = hours % 12;
  if (hours === 0) hours = 12;
  if (min < 10) min = "0" + min;

  let time = ampm + " " + hours + ":" + min;
  return time;
}


function sender_send() {

  //첫번째 대화창에서 메세지를 보낸경우
  let text = $("#sender_text").val();
  let time = new Date();

  if (text.length === 0) {
    return;
  }
  if (!text.trim().length) {
    return;
  }

  if (text.endsWith("\n")) {
    text += "\n";
  }

  //서버로 보낸다
  var userId = $("#userId").val();
  let data = {"userId": userId, "text": text, "time": time.toISOString(), "sender": userId};
  
  ws.send(JSON.stringify(data));
  
  $.ajax({
    url:"add_message",
    type: "post",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(data),

    success: function(messages){
      //kakao page에 표시한다
      text = text.replace(/ /g, "&nbsp;"); //여러 스페이스바를 모두 표시
      text = text.replace(/\n/g, "<br>"); //줄바꿈표시
      time = getTime(time);
      

      let newMessage =
        "<div class ='sender_message'>" +
        "<div class='s_time'>" +
        time +
        "</div>" +
        "<div class='sender'>" +
        text +
        "</div>" +
        "</div>";

      $("#sender").append(newMessage);
      var senderElement = $("#sender");
      senderElement.scrollTop(senderElement[0].scrollHeight);
      $("#sender_text").val("");
    }
  });
  
}

function addMessageToChat(message, id){
  let text = message.text.replace(/ /g, "&nbsp").replace(/\n/g, "<br>");
  let time = getTime(new Date(message.time));
  let sender = message.sender;

  let newMessage;
  if(sender == id){ //로그인한 사람이 보낸 메세지인 경우-> 노란색
    newMessage =
    "<div class ='sender_message'>" +
    "<div class='s_time'>" + time +"</div>" +
    "<div class='sender'>" + text +"</div>" +
    "</div>";
    
  }else{ //로그인한 사람이 보낸 메세지가 아님 -> 하얀색
    newMessage=
    "<div class='receiver_id'>"+ sender +"</div>"+
    "<div class ='receiver_message'>" +
    
    "<div class='receiver'>" + text +"</div>" +
    "<div class='r_time'>" + time + "</div>" +
    "</div>";
  }
  var messages = $('#sender');
  messages.append(newMessage);
  var senderElement = $("#sender");
  senderElement.scrollTop(senderElement[0].scrollHeight);
}