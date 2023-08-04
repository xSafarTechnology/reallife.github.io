window.partialSent = false;
window.checkoutSent = false;
$(function () {

    $('#partialForm').submit(function (e) {
        e.preventDefault();
        setCookies();
        $('#loading').addClass('active');
        var $form = $(this);
        $form.prepend('<input type="hidden" name="action" value="partial">')
        var serializedData = $(this).serializeArray();
        var $data = {};
        serializedData.forEach((item) => {
            $data[item.name] = item.value;
        });
        if (window.partialSent) {
            return;
        } else {
            window.partialSent = true;
        }
        $.ajax({
            url: "./_logic/_dataModule.php",
            type: "POST",
            data: $data,
            success: function (reply) {
                $code = reply.code;
                if ($code == 110) {
                    $('.invalid-feedback').remove();
                    $('#partialForm input, #partialForm select').removeClass('is-invalid').addClass('is-valid');
                    $.each(reply.response, function (index, error) {
                        $markup = '<span class="invalid-feedback" role="alert"><strong>' + error + '</strong></span>';
                        $('input[name="' + index + '"]').addClass('is-invalid').removeClass('is-valid').parent().append($markup);
                        $('select[name="' + index + '"]').addClass('is-invalid').removeClass('is-valid').parent().append($markup);
                    });
                }
                if ($code == 100) {
                    $('.invalid-feedback').remove();
                    $('#partialForm input:visible, #partialForm select').removeClass('is-invalid').addClass('is-valid');
                    // console.log(reply);
                    $string = '?';
                    $.each(reply.response, function (i, val) {
                        if (i == 'id') {
                            $string += i + '=' + val;
                        }
                        if (i == 'isOTP') { // -- added by Florina --
                            $string += '&iop' + '=' + val;
                        }
                    });
                    window.location.href = './checkout.php' + $string;
                }
                $('#loading').removeClass('active');

            },
            error: function (reply) {
                console.log(reply);
                $('#loading').removeClass('active');
            }
        });
    });
    $('#checkoutform').submit(function (e) {
        e.preventDefault();
        if (window.checkoutSent) {
            return;
        } else {
            window.checkoutSent = true;
        }
        setCookies();
        $('#loading').addClass('active');
        $(this).prepend('<input type="hidden" name="action" value="checkout">')
        var serializedData = $(this).serializeArray();
        var $data = {};
        serializedData.forEach((item) => {
            $data[item.name] = item.value;
        });
        $.ajax({
            url: "./_logic/_dataModule.php",
            type: "POST",
            data: $data,
            success: function (reply) {
                // console.log(reply);
                $code = reply.code;
                if ($code == 110) {
                    $('#loading').removeClass('active');
                    $('.invalid-feedback').remove();
                    $('#checkoutform input, #checkoutform select').removeClass('is-invalid').addClass('is-valid');
                    $.each(reply.response, function (index, error) {
                        $markup =
                            '<span class="invalid-feedback" role="alert"><strong>' +
                            error + '</strong></span>';
                        $('input[name="' + index + '"]').addClass('is-invalid')
                            .removeClass('is-valid').parent().append($markup);
                        $('select[name="' + index + '"]').addClass('is-invalid')
                            .removeClass('is-valid').parent().append($markup);
                    });
                    $('html,body').animate({scrollTop: $('#formtop').offset().top}, 'slow');
                    window.checkoutSent = false;
                }
                if ($code == 100) {
                    // $('#loading').removeClass('active');
                    $('.invalid-feedback').remove();
                    $('#checkoutform input:visible, #checkoutform select').removeClass('is-invalid').addClass('is-valid');
                    if (!reply.response.errors || !reply.response.exception) {
                        if (reply.response.order.payment_method == 'online') {
                            window.location.href = './razor.php';
                        } else {
                            window.location.href = './pay.php';
                           // $('#codForm').attr('action', `thankyou.php?token=${reply.response.order.token}&id=${reply.response.order.id}`);
                          //  $('#codForm').submit();
                        }

                    } else {
                        alert(JSON.stringify(reply.response.errors));
                        $('#loading').removeClass('active');
                        window.checkoutSent = false;
                    }
                }
            },
            error: function (reply) {
                $('#loading').removeClass('active');
                window.checkoutSent = false;

            }
        });
    });

    $('#updateForm').submit(function (e) {
        e.preventDefault();
        $(this).prepend('<input type="hidden" name="action" value="update">')
        var serializedData = $(this).serializeArray();
        var $data = {};
        serializedData.forEach((item) => {
            $data[item.name] = item.value;
        });
        $.ajax({
            url: "./_logic/_dataModule.php",
            type: "POST",
            data: $data,
            success: function (reply) {
                // console.log(reply);
                $code = reply.code;
                if ($code == 110) {
                    $('.invalid-feedback').remove();
                    $('#updateForm input, #updateForm select').removeClass('is-invalid').addClass('is-valid');
                    $.each(reply.response, function (index, error) {
                        $markup =
                            '<span class="invalid-feedback" role="alert"><strong>' +
                            error + '</strong></span>';
                        $('input[name="' + index + '"]').addClass('is-invalid')
                            .removeClass('is-valid').parent().append($markup);
                        $('select[name="' + index + '"]').addClass('is-invalid')

                            .removeClass('is-valid').parent().append($markup);
                    });
                    window.checkoutSent = false;

                }
                if ($code == 100) {
                    $('.invalid-feedback').remove();
                    $('#updateForm input:visible, #updateForm select').removeClass('is-invalid').addClass('is-valid');
                    $('#editinfo').collapse('hide');
                    $('#success').html(reply.response.message).fadeIn();
                }
            },
            error: function (reply) {
                console.log(reply);
            }
        });
    });

    var prevData = readCookie('data');
    if (prevData != null) {
        prevData = JSON.parse(prevData);
        $('input[name="first_name"]').val(prevData.fname);
        $('input[name="last_name"]').val(prevData.lname);
        $('input[name="pincode"]').val(prevData.pincode);
        $('input[name="address1"]').val(prevData.address1);
        $('input[name="address2"]').val(prevData.address2);
        $('input[name="city"]').val(prevData.city);
        $('select[name="state"]').val(prevData.state);
        $('input[name="email"]').val(prevData.email);
        $('input[name="phone"]').val(prevData.phone);
    }

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function setCookies() {
        var now = new Date();
        var time = now.getTime();
        var expireTime = time + 360 * 1000;
        $data = {
            fname: $('input[name="first_name"]').val(),
            lname: $('input[name="last_name"]').val(),
            pincode: $('input[name="pincode"]').val(),
            address1: $('input[name="address1"]').val(),
            address2: $('input[name="address2"]').val(),
            city: $('input[name="city"]').val(),
            state: $('select[name="state"]').val(),
            email: $('input[name="email"]').val(),
            phone: $('input[name="phone"]').val(),
        };
        now.setTime(expireTime);
        document.cookie = 'data=' + JSON.stringify($data) + ';expires=' + now.toGMTString() + ';path=/';
    }
});
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};