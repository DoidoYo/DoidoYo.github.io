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
