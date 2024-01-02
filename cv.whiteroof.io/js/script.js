$(document).ready(function(){

	$('.group__file>a').on('click' ,function(e){
		e.preventDefault();
		$(this).closest(".group__file").find("input[type='file']").click();
	});

	$('.group__file input[type="file"]').on("change" ,function(e){
		e.preventDefault();
		$(this).closest(".group__file").find(".selected__file").addClass("active__selected");
		$(this).closest(".group__file").find(".selected__file").fadeIn(300);
		$(this).closest(".group__file").find(".selected__file>.inner__selected>p").text($(this)[0].files[0].name);
	});
	$('.selected__file .inner__selected>a').on("click" ,function(e){
		e.preventDefault();
		$(this).closest('.selected__file').removeClass("active__selected");
	});

	$('.group__input>input').on('focus' ,function(e){
		$(this).closest('.group__input').addClass("focused__input");
	});
	$('.group__input>input').on('blur' ,function(e){
		$(this).closest('.group__input').removeClass("focused__input");
	});

	$('.cv__form form').on("submit" ,function(e){
		e.preventDefault();

		// document.querySelector( ".input-file" ).addEventListener( "change", function() {
		// 	let fileName = this.value.split('\\')[2];
		// 	let fileType = fileName.split('.');
		// 	document.getElementById('type-uploaded-file').innerHTML = fileType[fileType.length - 1].toUpperCase();
		// 	document.getElementById('name-uploaded-file').innerHTML = fileName;
		// 	document.getElementById('file-name-container').style.display = 'flex';
		// });

		var data = new FormData();
		data.append('first_name', $('#first_name').val());
		data.append('email', $('#email').val());
		data.append('folder_url_address', $('#folder-url-address').val());
		data.append('file', $('#my-file')[0].files[0]);

		console.log($('#first_name').val())
		console.log($('#email').val())
		console.log($('#folder-url-address').val())
		console.log($('#my-file')[0].files[0])

		$.ajax({
			// url: "https://msforhr.com/ajax-upload-file",
                        url: "http://127.0.0.1:8000/ajax-upload-file",
			method: 'POST',
			data: data,
			contentType: false,
			processData: false,
			success: function (data) {
				if (data['status_code'] === '200'){
					$('.form__success').css({
						"bottom" : "20px",
						"opacity" :  "1"
					});
					setTimeout(function(){
						$('.form__success').css({
							"bottom" : "-50px",
							"opacity" :  "0"
						});
					}, 2500);

				} else {
					$('.form__fail').css({
						"bottom" : "20px",
						"opacity" :  "1"
					});
					setTimeout(function(){
						$('.form__fail').css({
							"bottom" : "-50px",
							"opacity" :  "0"
						});
					}, 2500);
				}
			},
			error: function (data) {
				$('.form__fail').css({
					"bottom" : "20px",
					"opacity" :  "1"
				});
				setTimeout(function(){
					$('.form__fail').css({
						"bottom" : "-50px",
						"opacity" :  "0"
					});
				}, 2500);
			}
		});
	});
});
