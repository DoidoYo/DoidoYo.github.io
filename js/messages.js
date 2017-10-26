$(document).ready(function () {

    firebase.auth().signInWithEmailAndPassword("doc@gmail.com", "test123").catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
    });
    var chats = []
    var first = true;
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {


            firebase.database().ref("Physicians/" + user.uid).once('value').then(function (snapshot) {

            });

            //get patients
            firebase.database().ref("Physicians/" + user.uid).once('value').then(function (snapshot) {
                snapshot.forEach(function (child) {

                    let patId = child.val().id;
                    let chatId = child.val().chat;

                    firebase.database().ref("Users/" + patId).once('value').then(function (snapshot) {
                        let fname = snapshot.val().first_name;
                        let lname = snapshot.val().last_name;

                        firebase.database().ref("Chat/" + chatId).limitToLast(1).once('value').then(function (snapshot) {
                            //add items to list
                            snapshot.forEach(function (snap, index) {
                                //console.log(snap.val().text);

                                let pat = {
                                    id: patId,
                                    chat: chatId,
                                    first_name: fname,
                                    last_name: lname,
                                    last_msg: snap.val().text
                                };

                                //add html
                                let tempChat = $("#chatTemplate").clone();
                                tempChat.find(".name").text(pat.first_name + " " + pat.last_name);
                                tempChat.find(".newmsg").text(""); //set new msg number
                                tempChat.find(".lastmsg").text(pat.last_msg);
                                tempChat.attr("data-index", pat.chat);

                                tempChat.show();


                                tempChat.click(function (item) {

                                    $(".cactive").removeClass("cactive");

                                    $(this).addClass("cactive");

                                    for (var i = 0; i < chats.length; i++) {
                                        if (chats[i].chat == $(this).attr("data-index")) {
                                            openChat(chats[i]);
                                        }
                                    }


                                });

                                $("#msgtable tbody").append(tempChat);
                                chats.push(pat);

                                if (first) {
                                    first = false;
                                    tempChat.addClass("cactive");
                                    openChat(chats[0]);
                                }
                            });

                        });
                    });


                });
            });

            //open first chat
            openChat(chats[0]);

        } else {
            //location.href = "login.html"
        }
    });


});

var msgList = []
var listener;
var last_ref;
var msgTemplate = $("#msgtemplate").clone();
var chatId;

$('#text').keydown(function (e) {
    if (e.keyCode == 13) {
        $("#sendbtn").trigger('click');
    }
});

$("#sendbtn").click(function () {

    var ref = firebase.database().ref("Chat/" + chatId).push();
    var key = ref.key;

    msgList.push(key);
    var time = (new Date()).getTime();
    ref.set({
        id: key,
        sender: 1,
        text: $("#text").val(),
        time: time
    }, function (err) {
        if (err) {
            var index = msgList.indexOf(key);
            if (index > -1) {
                msgList = msgList.splice(index, 1);
            }
        } else {
            addSent($("#text").val(), time, key);
            scroll();
            $("#text").val("");
        }
    });


});

function openChat(patient) {
    if (patient != null) {
        //alert("loadig");
        chatId = patient.chat;
        let box = $(".chatboxtemplate");
        box.find(".direct-chat-messages").empty();

        box.find(".name").text(patient.first_name + " " + patient.last_name);


        if (listener != null) {
            //listener.off();
            last_ref.off('child_added', listener);
        }

        last_ref = firebase.database().ref("Chat/" + patient.chat);
        //gets last 20
        firebase.database().ref("Chat/" + patient.chat).limitToLast(20).once("value", function (snapshot) {
            snapshot.forEach(function (snap) {
                var vals = snap.val();
                msgList.push(vals["id"]);
                if (vals["sender"] == 0) {
                    addReceived(vals["text"], vals["time"], vals["id"]);
                } else {
                    addSent(vals["text"], vals["time"], vals["id"]);
                }

            });

            scroll();

            //registers event listeners
            listener = firebase.database().ref("Chat/" + patient.chat).limitToLast(1).on("child_added", function (snapshot) {
                var vals = snapshot.val();


                if (msgList.indexOf(vals["id"]) != -1) {
                    //console.log("exists");
                } else {
                    if (vals["sender"] == 0) {
                        addReceived(vals["text"], vals["time"], vals["id"]);
                    } else {
                        addSent(vals["text"], vals["time"], vals["id"]);
                    }
                    scroll();

                }

            }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });

        });





    }


}

function addSent(msg, time, key) {
    let msgo = msgTemplate.clone();
    msgo.addClass("right");
    msgo.find(".datetime").removeClass("pull-left").addClass("pull-right");
    addMsg(msg, time, msgo);
}

function addReceived(msg, time, key) {
    let msgo = msgTemplate.clone();
    addMsg(msg, time, msgo);
}

function addMsg(msg, time, obj) {
    obj.find(".datetime").text(moment(parseInt(time)).format("llll"));
    obj.find(".text").text(msg);
    obj.attr("id", "");
    obj.show();
    $(".direct-chat-messages").append(obj);
}

function scroll() {
    //        $(".box-body").animate({
    //            scrollTop: $(".direct-chat-messages")[0].scrollHeight - $(".direct-chat-messages")[0].clientHeight
    //        }, 200);
    //    console.log($('.direct-chat-messages').prop("scrollHeight"));
    $(".box-body").animate({
        scrollTop: $('.direct-chat-messages').prop("scrollHeight")
    }, 0);
}
