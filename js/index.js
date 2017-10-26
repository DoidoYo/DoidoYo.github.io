$(document).ajaxStart(function () {
    Pace.restart()
})
$('.ajax').click(function () {
    $.ajax({
        url: '#',
        success: function (result) {
            $('.ajax-content').html('<hr>Ajax Request Completed !')
        }
    })
})

$(document).ready(function () {
    loadPage("patients.html");
});

function navClick(item) {
    let url = $(item).attr("data-url");

    //remove active from previous
    $(".sidebar").find(".active").removeClass("active");

    //add active to current
    $(item).parent().addClass("active");

    loadPage(url);
}


function loadPage(path) {
    $("#main").load(path, function (response) {
        //change rref
        //window.location.replace("patients.html");
        //        window.history.pushState({
        //            "html": response.html,
        //            "pageTitle": response.pageTitle
        //        }, "", path);
    });
}


firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        firebase.database().ref("Users/" + user.uid).once('value').then(function (snapshot) {
            console.log(snapshot.val());
            var val = snapshot.val();
            $("#dname").text(val.first_name + " " + val.last_name);
            $("#code").text("Physician Code: " + val.code);
            //TODO LOAD PICTURE
        });
    }
});
