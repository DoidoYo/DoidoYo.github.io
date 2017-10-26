var patient = JSON.parse(sessionStorage.getItem("patient"));
$(document).ready(function () {


    $("#edit").click(function () {
        loadPage("patients.html");
    });

    $("#dob").text(patient.dob);
    $("#sex").text("N/A");
    $("#phone").text("N/A");

});


var range = 1;
var range_amount = 20;
var lastKey = null;

var data = [];
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {



        if (lastKey == null) {
            firebase.database().ref("Patients/" + patient.id).orderByChild("time").limitToFirst(20).once('value').then(function (snapshot) {
                snapshot.forEach(function (child) {
                    lastKey = child.key;

                    var single = {
                        measurement: child.val().measurement,
                        time: child.val().time,
                        type: parseInt(child.val().type)
                    };


                    var html;
                    if (single.type == 0) {
                        html = $("#pill").clone().show();
                        html.find("#dose").text(single.measurement + " mg");
                    } else {
                        html = $("#reading").clone().show();
                        html.find("#dose").text(single.measurement + " ul");
                    }

                    var mom = moment(parseInt(single.time));
                    html.find("#time").text(mom.format("LT"));
                    html.find("#date").text(mom.format("L"));
                    data.push(single);

                    $(".pillTable tbody").prepend(html);

                });

                var cdata = []

                for (var i = 0; i < data.length; i++) {
                    //console.log(cdata[i]);
                    if (data[i].type == 1) {
                        var mom = moment(parseInt(data[i].time));
                        var dot = {
                            date: parseInt(data[i].time),
                            value: data[i].measurement
                        };
                        cdata.push(dot);
                    }
                }
                new Morris.Line({
                    // ID of the element in which to draw the chart.
                    element: 'chart',
                    // Chart data records -- each entry in this array corresponds to a point on
                    // the chart.
                    data: cdata,
                    // The name of the data record attribute that contains x-values.
                    xkey: 'date',
                    // A list of names of data record attributes that contain y-values.
                    ykeys: ['value'],
                    // Labels for the ykeys -- will be displayed when you hover over the
                    // chart.
                    labels: ['Value']
                });

            });
        }

        //        firebase.database().ref("Patients/" + patient.id).orderByChild("time").startAt(1).endAt(2).once('value').then(function (snapshot) {
        //            snapshot.forEach(function (child) {
        //                lastKey = child.key;
        //
        //
        //                console.log(child.val());
        //            });
        //        });
    }
});
