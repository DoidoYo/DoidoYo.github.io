var user_iud = null;


function savePatient(item) {
    let model = $(document).find(".modal-body");

    let fname = model.find("#fname").val();
    let lname = model.find("#lname").val();
    let dob = model.find("#datepicker").val();
    let phone = model.find("#phone").val();
    let sex = $('input[name=optradio]:checked').val()

    let code = "";

    //generate first part of patient code
    code = fname.substr(0, 1) + lname.substr(0, 5);
    code = code.toLowerCase();



    firebase.database().ref("PendingPatients/").once('value').then(function (snapshot) {
        var nums = [];
        snapshot.forEach(function (child) {
            let cval = child.val();

            if (cval.code.includes(code)) {
                var num = parseInt(cval.code.substr(code.length, cval.code.length));
                nums.push(num);
            }
        });

        nums.sort();
        console.log(nums);

        var counter = 0;
        for (var i in nums) {
            if (counter == i) {
                counter++;
            }
        }
        if (counter != 0) {
            code += "" + counter;
        }

        let user = {
            first_name: fname,
            last_name: lname,
            dob: dob,
            phone: phone,
            sex: sex,
            doc: user_iud,
            code: code
        };
        //user function to save user with code (under users and )


        firebase.database().ref('PendingPatients/').push(user, function (err) {
            if (err) {

            } else {
                $('#myModal').modal('toggle');
                location.href = "index.html"
            }
        });
    });



}

function detailsPatient(sender) {
    let row = $(sender).parent().parent();

    let patData = JSON.parse(row.attr("data-pat"));

    clearModal();

    $('#dModal').find("h3").text(patData.first_name + " " + patData.last_name);
    $('#dModal').find("#dob").text(patData.dob);
    $('#dModal').find("#sex").text(patData.sex);
    $('#dModal').find("#phone").text(patData.phone);
    $('#dModal').find("#code").text(patData.code);
    $('#dModal').modal('toggle');

    //console.log(patData);
}

function clearModal() {
    $('#dModal').find("h3").text("N/A");
    $('#dModal').find("#dob").text("N/A");
    $('#dModal').find("#sex").text("N/A");
    $('#dModal').find("#phone").text("N/A");
    $('#dModal').find("#code").text("N/A");
}

$(document).ready(function () {

    $("#logout").click(function () {
        firebase.auth().signOut().then(function () {
            location.href = "login.html"
        }, function (error) {
            // An error happened.
        });

    });


    $('#datepicker').inputmask('mm/dd/yyyy', {
        'placeholder': 'mm/dd/yyyy'
    })
    $('[data-mask]').inputmask();

    firebase.auth().signInWithEmailAndPassword("doc@gmail.com", "test123").catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
    });
    var patients = []
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {

            user_iud = user.uid;
            //set physician code
            firebase.database().ref("Users/" + user.uid).once('value').then(function (snapshot) {
                $("#code").text(snapshot.val().code);
            });

            //get patients
            firebase.database().ref("Physicians/" + user.uid).once('value').then(function (snapshot) {

                //console.log(snapshot.numChildren());

                $("#showing").text("Showing " + snapshot.numChildren() + " of " + snapshot.numChildren());

                snapshot.forEach(function (child) {

                    patients.forEach(function (item) {
                        var iid = new String(item.id);
                        var oid = new String(patient.id);

                        if (iid === oid) {
                            //console.log("YES");
                        }
                    });

                    firebase.database().ref("Users/" + child.val().id).once('value').then(function (snapshot) {

                        var val = snapshot.val();
                        var patient = {
                            dob: val.dob,
                            first_name: val.first_name,
                            last_name: val.last_name,
                            id: child.val().id
                        };


                        patients.push(patient);
                        var patientIndex = patients.indexOf(patient);


                        let patientHTML = $("#template").clone();
                        patientHTML.attr('id', patientIndex);
                        patientHTML.css("position", "relative");
                        patientHTML.find(".firstname").text(patient.first_name);
                        patientHTML.find(".lastname").text(patient.last_name);
                        patientHTML.find(".dob").text(patient.dob);
                        patientHTML.attr("data-pat", JSON.stringify(patient));

                        //                        TODO
                        //Status
                        //Picture

                        patientHTML.find("#data").click(function () {
                            sessionStorage.setItem("patient", $(this).parent().parent().attr("data-pat"))
                            loadPage("data.html");
                        });

                        patientHTML.find("#chat").click(function () {
                            loadPage("messages.html");
                        });

                        patientHTML.show();

                        $("#patientTable tbody").append(patientHTML);





                    });
                });
            });


            firebase.database().ref("PendingPatients/").orderByChild('doc').equalTo(user.uid).once('value').then(function (snapshot) {
                //console.log(snapshot.val());
                snapshot.forEach(function (child) {
                    let cval = child.val();

                    //console.log(cval);

                    let patientHTML = $("#template").clone();
                    patientHTML.css("position", "relative");
                    patientHTML.find(".firstname").text(cval.first_name);
                    patientHTML.find(".lastname").text(cval.last_name);
                    patientHTML.find(".dob").text(cval.dob);
                    patientHTML.attr("data-pat", JSON.stringify(cval));
                    patientHTML.find("#data").prop("disabled", true);

                    patientHTML.find(".status").find("span").removeClass("label-success").addClass("label-danger").text("PENDING");


                    patientHTML.show();

                    $("#patientTable tbody").append(patientHTML);
                });

            });

        } else {
            location.href = "login.html"
        }
    });


});
