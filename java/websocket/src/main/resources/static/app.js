var stompClient = null;

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        $("#conversation").show();
    }
    else {
        $("#conversation").hide();
    }
    $("#greetings").html("");
}

var header = {
    login: 'user',
    passcode: 'pass',
    'client-id': 'blah'
}

var connect_callback = function () {
    setConnected(true);
    console.log('Connected: ');
    stompClient.subscribe('/topic/greetings', function (greeting) {
        showGreeting(JSON.parse(greeting.body).content);
    });
};

var error_callback = function (error) {
    alert(error.headers.message);
};

function connect() {
    var socket = new SockJS('/gs-guide-websocket');

    stompClient = Stomp.over(socket);

    stompClient.connect(header, connect_callback, error_callback);
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

function sendName() {
    stompClient.send("/app/hello", {}, JSON.stringify({'name': $("#name").val()}));
}

function showGreeting(message) {
    $("#greetings").append("<tr><td>" + message + "</td></tr>");
}

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $( "#connect" ).click(function() { connect(); });
    $( "#disconnect" ).click(function() { disconnect(); });
    $( "#send" ).click(function() { sendName(); });
});