'{% load static %}'

$(document).ready(function(){

	let clipboard = false;

	$('body').on("contextmenu" , ".elem__department--folder" ,function(e){
		e.preventDefault();
		if (clipboard == true) {
			$('.paste__menu').fadeIn(200);
			$('.paste__menu').css("top" , $(this).offset().top);
			$('.paste__menu').css("left" , $(this).offset().left + $(this).width() - 50);
			$(".paste__menu--button").attr("data-department" , $(this).attr("id"));
			clipboard = false;
		}
	});


	$(".paste__menu--button").on("click" , function(e){
		e.preventDefault();

		// Yevhen
		const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
		const toDepartment = $(this).attr("data-department");

		let data = new FormData();
		data.append('to_department', toDepartment)

		$.ajax({
			url: "/ajax-past-file-from-clipboard",
			method: 'POST',
			headers: {'X-CSRFToken': csrfToken},
			data: data,
			contentType: false,
			processData: false,
			success: function (data) {
				const currentDepartment = $(`#${data['result']['current_department']}`).attr('data-department')
				const fillPathToFile = '222';
				createJobRow(data['result']['file_name'], "pdf", data['result']['file_size'], data['result']['file_url'], data['result']['file_received'], currentDepartment, "lorem10 20 210 123012", fillPathToFile);

				if ($(`#${data['result']['current_department']}`).hasClass('active__department') == true) {
					$('.job__positions').css("display" ,"block");
					$('.position__row--wrapper').css("display" ,"block");
				}

				$('.copy__status').css('bottom' ,"20px");
				$(".error__status").css("bottom", "-60px");
				$('.copy__status p').text("Paste successfully");
				$('.copied__position').removeClass('copied__position');
				$(this).closest(".position__row--wrapper").addClass("copied__position");
				if (!copyTimeout) {
					copyTimeout = setTimeout(function(){
						$('.copy__status').css('bottom' ,"-60px");
					} ,1500);
				} else {
					clearTimeout(copyTimeout);
					copyTimeout = setTimeout(function(){
						$('.copy__status').css('bottom' ,"-60px");
					} ,1500);
				}

				setTimeout(function(){
					const currentCompany = $(".active__company").attr('id');
					recalculateCurrentCompany(currentCompany)
				}, 500);
			},
			error: function (data) {console.log("ERROR", data)}
		});
		// End - Yevhen

		$(this).closest(".paste__menu").fadeOut(200);

	});


	// Yevhen
	function addCompany(company_name, unique_folder_name, count_files, total_file_size) {
		let newElement = "<div class='elem__company' data-folder=folder"+ (+$('.company__grid .elem__company').length + 1) +" id="+ unique_folder_name +">\
							<div class='elem__company--box'>\
								<div class='company__left'>\
									<span><img src='/static/img/foldericon.svg' alt='folder'></span>\
									<div class='company__folder--info'>\
										<h6>"+ company_name +"</h6>\
										<ul>\
											<li><span>"+ count_files +"</span> files </li>\
											<li class='spacer'>|</li>\
											<li><span>"+ total_file_size +"</span> MB</li>\
										</ul>\
									</div>\
								</div>\
								<div class='company__right'>\
									<div class='dropdown__dots'>\
										<a href='#'><img src='/static/img/dots.svg' alt='dots'></a>\
										<div class='dropdown__box'>\
											<ul>\
												<li><a href='#' class='rename__folder'>Rename</a></li>\
												<li><a href='#' class='delete__folder'>Delete</a></li>\
												<li><a href='#' class='copy__button' data-copy="+ unique_folder_name +">Copy Link</a></li>\
											</ul>\
										</div>\
									</div>\
								</div>\
							</div>\
						</div>";
		$(".company__grid").append(newElement);
	}
	function addDepartment(folder_name, unique_folder_name, count_files, total_file_size) {
		let newElement = "<div class='elem__department--folder " + $(".active__company").attr("data-folder") +"' data-department=unique" + ($('.grid__department .elem__department--folder').length  + 1) + " id="+ unique_folder_name +">\
							<span class='count_files'>"+ count_files +"</span>\
							<div class='department__box'>\
								<div class='department__left'>\
									<span><img src='/static/img/foldericon.svg' alt='folder'></span>\
									<div class='department__folder--info'>\
										<h6>" + folder_name + "</h6>\
										<ul>\
											<li><span>"+ count_files +"</span> files </li>\
											<li class='spacer'>|</li>\
											<li><span>"+ total_file_size +"</span> MB</li>\
										</ul>\
									</div>\
								</div>\
								<div class='department__right'>\
									<div class='dropdown__dots'>\
										<a href='#'><img src='/static/img/dots.svg' alt='dots'></a>\
										<div class='dropdown__box'>\
											<ul>\
												<li><a href='#' class='rename__folder'>Rename</a></li>\
												<li><a href='#' class='delete__folder'>Delete</a></li>\
												<li><a href='#' class='copy__button' data-copy='"+ unique_folder_name +"'>Copy Link</a></li>\
											</ul>\
										</div>\
									</div>\
								</div>\
							</div>\
						</div>";
		$('.grid__department').append(newElement);
		$('.department__main').fadeIn(300);
	}

	const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
	let data = new FormData();
	data.append('folder_type', 'main_page')

	$.ajax({
		url: "/ajax-get-folders",
		method: 'POST',
		headers: {'X-CSRFToken': csrfToken},
		data: data,
		contentType: false,
		processData: false,
		success: function (data) {
			$.each(data['folders_data'], function (item, key) {
				addCompany(key['company_name'], key['unique_folder_name'], key['count_files'], key['total_file_size']);
			});
		},
		error: function (data) {console.log("ERROR", data)}
	});
	// End - Yevhen

	setTimeout(function(){
		if ($('.transition').length) {
			$('.transition').css("transition" , ".4s ease all");
		}
	} ,  500);

	$(".menu__button>a").on('click' ,function(e){
		e.preventDefault();
		if ($(this).hasClass("active__button")) {
			$(this).removeClass("active__button");
			$("header ul").css('top' ,"-100%");
			$('body,html').css("overflow-y" , "initial");
		} else {
			$(this).addClass("active__button");
			$("header ul").css('top' ,"0px");
			$('body,html').css("overflow-y" , "hidden");
		}
	});
	$('.switcher__sign ul li a').on('click' ,function(e){
		e.preventDefault();
		if (!$(this).closest("li").hasClass("active__switcher")) {
			$('.form__grid .elem__form').css("display" , "none");
			$('.elem__form.'  + $(this).attr("data-form")).fadeIn(150);		
			if ($('.active__switcher').find("a").attr("data-form") == "form__signup") {
				$('.switcher__sign .status').css("left", "2px");
			}	
			if ($('.active__switcher').find("a").attr("data-form") == "form__signin") {
				$('.switcher__sign .status').css("left", "90px");
			}	
			$(".switcher__sign li").removeClass("active__switcher")
			$(this).closest("li").addClass("active__switcher");
		}

	});


	$('.password__input>a').on('click' ,function(e){
		e.preventDefault();
		if ($(this).closest('.group__input').hasClass('visible')) {
			$(this).closest('.group__input').removeClass('visible');
			$(this).closest(".group__input").find("input").attr("type" , "password");
		} else {
			$(this).closest('.group__input').addClass('visible');
			$(this).closest(".group__input").find("input").attr("type" , "text");
		}
	});

	





	// if ($('.company__grid .elem__company').length  == 0) {
	// 	$('.right__company').css("display" ,"none");
	// }



	$("body").on("input" , ".error__input" , function(){
		$(this).removeClass("error__input");
		$("label.error").fadeOut(300);
	});

	$('body').on("click" ,".dropdown__dots>a" ,function(e){
		e.preventDefault();
		if ($(this).closest('.dropdown__dots').find(".dropdown__box:visible").length == 0) {
			$('.dropdown__box').css("display"  , "none");
			$(this).closest('.dropdown__dots').find(".dropdown__box").fadeIn(150);
		}
	});

	$(document).click(function(event) { 
	  var $target = $(event.target);
	  if(!$target.closest('.dropdown__dots').length) {
	  	$('.dropdown__dots .dropdown__box').fadeOut(150);
	  }        
	});

	$('body').on('click' , ".elem__department--folder" , function(e){
		e.preventDefault();

		// Yevhen
		const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
		const uniqueFolderName = e.currentTarget.getAttribute('id');
		const currentDepartment = e.currentTarget.getAttribute('data-department');

		let data = new FormData();
		data.append('unique_folder_name', uniqueFolderName)

		$.ajax({
			url: "/ajax-get-files",
			method: 'POST',
			headers: {'X-CSRFToken': csrfToken},
			data: data,
			contentType: false,
			processData: false,
			success: function (data) {
				$('.position__grid')[0].innerHTML=""

				$.each(data['files_data'], function (item, key) {
					const fillPathToFile = 'https://msforhr.com/media/' + key['file_url']
					createJobRow(key['file_name'], "pdf", key['file_size'], key['file_url'], key['file_received'], currentDepartment, key['file_comment'], fillPathToFile);
					let counter = 0;
					$('.job__positions .position__row').each(function(index,elem){
						if ($(elem).attr("data-folder") == $(".active__department").attr("data-department")) {
							counter++;
							$(elem).addClass("active__rows");
							$('.job__positions').fadeIn(300);
							$(elem).closest(".position__row--wrapper").fadeIn(300);
						}
					});
				});
			},
			error: function (data) {console.log("ERROR", data)}
		});

		// End - Yevhen

		if (e.target.closest(".dropdown__dots") == null) {
			if (!$(this).hasClass("active__department")) {
				$(this).closest('.grid__department').find(".elem__department--folder").removeClass("active__department");
				$(this).addClass("active__department");
				$('.active__rows').removeClass("active__rows");
				$(".position__row--wrapper").css("display"  , "none");
				$('.positions__form input').val("");
				$('.position__row').css("display"  , "flex");
				let counter = 0;
				$('.job__positions .position__row').each(function(index,elem){
					if ($(elem).attr("data-folder") == $(".active__department").attr("data-department")) {
						counter++;
						$(elem).addClass("active__rows");
						$('.job__positions').fadeIn(300);
						$(elem).closest(".position__row--wrapper").fadeIn(300);
					}
				});
				if (counter == 0) {
					$('.job__positions').css("display" , "none");
				}
			}
		}
		createPagination();
	});

	$('body').on('click' , ".elem__company" , function(e){
		e.preventDefault();

		// Yevhen
		const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
		const uniqueFolderName = e.currentTarget.getAttribute('id');

		let data = new FormData();
		data.append('folder_type', 'departments')
		data.append('active_department', uniqueFolderName)

		$.ajax({
			url: "/ajax-get-folders",
			method: 'POST',
			headers: {'X-CSRFToken': csrfToken},
			data: data,
			contentType: false,
			processData: false,
			success: function (data) {
				document.getElementsByClassName('grid__department')[0].innerHTML = '';
				$.each(data['folders_data'], function (item, key) {
					addDepartment(key['company_name'], key['unique_folder_name'], key['count_files'], key['total_file_size']);
					$(".grid__department .elem__department--folder." + $(".active__company").attr("data-folder")).fadeIn(300);
				});
			},
			error: function (data) {console.log("ERROR", data)}
		});
		//End -  Yevhen
		if (e.target.closest(".dropdown__dots") == null) {
			if (!$(this).hasClass("active__company")) {
				$(this).closest('.company__folders--wrapper').find(".elem__company").removeClass("active__company");
				$(this).addClass("active__company");
				$(".elem__department--folder").css('display' , "none");
				if ($(".elem__department--folder." + $(this).attr("data-folder")).length != 0) {
					$('.create__department').fadeIn(300);
					$('.department__main').fadeIn(300);
					$(".elem__department--folder." + $(this).attr("data-folder")).fadeIn(300);
				} else {
					$('.department__main').css("display" ,"none");
					$('.create__department').fadeIn(300);
				}
				$('.active__department').removeClass('active__department');
				$('.job__positions').css("display"  , "none");
				$('.position__grid .position__row--wrapper').css("display" ,"none");
			}
			
		}
	});

	
	$("body").on('click' , ".rename__folder" ,function(e){
		e.preventDefault();
		$('.rename__form').closest(".modal__wrapper").fadeIn(300);
		$('body,html').css("overflow-y" ,"hidden");
		$('.dropdown__box').css("display" , "none");
		if ($(this).closest('.elem__company--box').length) {

			$('.rename__form').find(".rename__name").val($(this).closest(".elem__company--box").find('.company__folder--info>h6').text());	
			$(".rename__form").closest('.modal__wrapper').attr("data-depart" , "");
			$(".rename__form").closest('.modal__wrapper').attr("data-oldname" ,  $(this).closest('.elem__company').find(".company__folder--info>h6").text())
			$(".rename__form").closest('.modal__wrapper').attr("data-company" , $(this).closest(".elem__company").attr("data-folder"));		
			$(".rename__form").closest('.modal__wrapper').attr("data-unique_folder_name" , $(this).closest(".elem__company").attr("id"));
		}
		if ($(this).closest('.department__box').length) {
			$('.rename__form').find(".rename__name").val($(this).closest(".department__box").find('.department__folder--info>h6').text());			
			$(".rename__form").closest('.modal__wrapper').attr("data-company" , "");
			$(".rename__form").closest('.modal__wrapper').attr("data-oldname" ,  $(this).closest('.elem__department--folder').find(".department__folder--info>h6").text())
			$(".rename__form").closest('.modal__wrapper').attr("data-depart" , $(this).closest(".elem__department--folder").attr("data-department"));
			$(".rename__form").closest('.modal__wrapper').attr("data-unique_folder_name" , $(this).closest(".elem__department--folder").attr("id"));
		}
	});

	$('.rename__form').on("submit" ,function(e){
		e.preventDefault();

		// Yevhen
		const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;

		let folderType = null;
		if ($(this).closest('.modal__wrapper').attr("data-company").length > 0) {
			folderType = 'company';
		} else if ($(this).closest('.modal__wrapper').attr("data-depart").length > 0) {
			folderType = 'department';
		};

		const uniqueFolderName = $(this).closest('.modal__wrapper').attr("data-unique_folder_name");																			// TODO: Get uniqueFolderName from ...
		const newFolderName = $(this).find(".rename__name").val();
		const currentCompany = document.getElementById(uniqueFolderName);

		let data = new FormData();
		data.append('folder_type', folderType);
		data.append('unique_folder_name', uniqueFolderName);
		data.append('new_folder_name', newFolderName);

		$.ajax({
			url: "/ajax-rename-folder",
			method: 'POST',
			headers: {'X-CSRFToken': csrfToken},
			data: data,
			contentType: false,
			processData: false,
			success: function (data) {
				currentCompany.setAttribute('id', data['unique_folder_name']);
				currentCompany.getElementsByClassName('copy__button')[0].setAttribute('data-copy', data['unique_folder_name']);
			},
			error: function (data) {console.log("ERROR", data)}
		});
		// End - Yevhen
		let allow = true;
		if ($(this).closest('.modal__wrapper').attr("data-depart").length != 0) {
			if ($('.rename__form .rename__name').val().toLowerCase() != $('.rename__form').closest(".modal__wrapper").attr("data-oldname").toLowerCase()) {
				$('.elem__department--folder:visible').each(function(index,elem){
					if ($(elem).find(".department__folder--info>h6").text().toLowerCase() == $('.rename__form .rename__name').val().toLowerCase()) {
						allow = false;
						$(".rename__form .rename__name").addClass("error__input");
						$('.rename__form .error').fadeIn(300);
						$('.rename__form .error').text("Department folder with that name is already exists");
					}
				});
				if (allow == true) {
					$(".elem__department--folder[data-department="+ $(this).closest('.modal__wrapper').attr("data-depart") +"]").find(".department__folder--info>h6").text($(this).find(".rename__name").val());
					$(this).closest(".modal__wrapper").fadeOut(300);
					$(this).find(".rename__name").val("");
					$('body,html').css("overflow-y" , "initial");
				}
			} else {
				$(".elem__department--folder[data-department="+ $(this).closest('.modal__wrapper').attr("data-depart") +"]").find(".department__folder--info>h6").text($(this).find(".rename__name").val());
				$(this).closest(".modal__wrapper").fadeOut(300);
				$(this).find(".rename__name").val("");
				$('body,html').css("overflow-y" , "initial");
			}
			
		}
		if ($(this).closest('.modal__wrapper').attr("data-company").length != 0) {
			if ($('.rename__form .rename__name').val().toLowerCase() != $('.rename__form').closest(".modal__wrapper").attr("data-oldname").toLowerCase()) {
				$('.company__grid .elem__company').each(function(index,elem){
					if ($(elem).find(".company__folder--info>h6").text().toLowerCase() == $('.rename__form .rename__name').val().toLowerCase()) {
						allow = false;
						$(".rename__form .rename__name").addClass("error__input");
						$('.rename__form .error').fadeIn(300);
						$('.rename__form .error').text("Company folder with that name is already exists");
					}
				});
				if (allow == true) {
					$(".elem__company[data-folder="+ $(this).closest('.modal__wrapper').attr("data-company") +"]").find(".company__folder--info>h6").text($(this).find(".rename__name").val());
					$(this).closest(".modal__wrapper").fadeOut(300);
					$(this).find(".rename__name").val("");
					$('body,html').css("overflow-y" , "initial");
				}
			} else {
				$(".elem__company[data-folder="+ $(this).closest('.modal__wrapper').attr("data-company") +"]").find(".company__folder--info>h6").text($(this).find(".rename__name").val());
				$(this).closest(".modal__wrapper").fadeOut(300);
				$(this).find(".rename__name").val("");
				$('body,html').css("overflow-y" , "initial");
			}
		}
		if (allow == true) {
			$(this).closest(".modal__wrapper").fadeOut(300);
			$(this).find(".rename__name").val("");
			$('body,html').css("overflow-y" , "initial");
		}
	});



	$("body").on("click" , ".delete__folder" , function(e){
		e.preventDefault();
		if ($(this).closest('.elem__company').length) {
			$('.job__positions').css("display" , "none");
			$('.elem__department--folder.' + $(this).closest(".elem__company").attr("data-folder")).each(function(index,elem){
				$(".position__row[data-folder="+ $(elem).attr("data-department") +"]").closest(".position__row--wrapper").remove();
			});
			$('.elem__department--folder.' + $(this).closest(".elem__company").attr('data-folder')).remove();
			$(this).closest(".elem__company").remove();
			$('.department__main').css("display" , "none");
			$(".create__department").css("display" , 'none');
		}
		if ($(this).closest(".department__box").length) {
			if ($(this).closest('.grid__department').find(".elem__department--folder:visible").length == 1) {
				$('.department__main').css("display" , "none");
			}
			$(".position__row[data-folder="+ $(this).closest(".elem__department--folder").attr("data-department") +"]").closest(".position__row--wrapper").remove();
			$(this).closest('.elem__department--folder').remove();
			$('.job__positions').css("display" ,"none");
			recalculateFolders();
		}

		// Yevhen
		const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;

		let uniqueFolderName, folderType = null;

		if ($(this).closest(".elem__company").length) {
			folderType = 'company';
			uniqueFolderName = $(this).closest(".elem__company").attr("id");
		} else if ($(this).closest(".department__box").length) {
			folderType = 'department';
			uniqueFolderName = $(this).closest(".elem__department--folder").attr("id");
		};

		let data = new FormData();
		data.append('folder_type', folderType);
		data.append('unique_folder_name', uniqueFolderName);

		$.ajax({
			url: "/ajax-delete-folder",
			method: 'POST',
			headers: {'X-CSRFToken': csrfToken},
			data: data,
			contentType: false,
			processData: false,
			success: function (data) {},
			error: function (data) {console.log("ERROR", data)}
		});
		// End - Yevhen
	});


	function copyToClipboard(text) {
	    var $temp = $("<input>");
	    $("body").append($temp);
	    $temp.val(text).select();
	    document.execCommand("copy");
	    $temp.remove();
	}
	 let copyTimeout;
	$("body").on("click" , ".copy__button" ,function(e){
		e.preventDefault();
		$(this).closest(".dropdown__box").fadeOut(150);
		copyToClipboard($(this).attr('data-copy'));
		$('.copy__status').css('bottom' ,"20px");
		$(".error__status").css("bottom", "-60px");
		$('.copy__status p').text("Link copied")
		if (!copyTimeout) {
			copyTimeout = setTimeout(function(){
				$('.copy__status').css('bottom' ,"-60px");
			} ,1500);
		} else {
			clearTimeout(copyTimeout);
			copyTimeout = setTimeout(function(){
				$('.copy__status').css('bottom' ,"-60px");
			} ,1500);
		}
	});


	$('.company__folder--create').on("click" ,function(e){
		e.preventDefault();
		$(".company__folder").closest('.modal__wrapper').fadeIn(300);
		$("body,html").css("overflow-y" ,"hidden");
	});

	$('.modal__box>a').on("click" ,function(e){
		e.preventDefault();
		$(this).closest('.modal__wrapper').fadeOut(300);
		$("body,html").css("overflow-y" , "initial");
	});

	$(".create__department>a").on("click" ,function(e){
		e.preventDefault();
		$(".department__folder").closest('.modal__wrapper').fadeIn(300);
		$("body,html").css("overflow-y" ,"hidden");
	});

	$('.department__folder').on("submit" ,function(e){
		e.preventDefault();

		if ($(this).find(".department__name").val().length == 0) {
			$(this).find(".error").fadeIn(300);
			$(this).find(".department__name").addClass('error__input')
			$(this).find(".error").text("Please enter Department Name");
		} else {
			let allow = true;
			$('.grid__department .elem__department--folder:visible').each(function(index,elem){
				if ($(".department__folder").find(".department__name").val().toLowerCase() == $(elem).find(".department__folder--info>h6").text().toLowerCase()) {
					allow = false;
					$(".department__folder").find(".department__name").addClass("error__input");
					$(".department__folder").find(".error").fadeIn(300);
					$(".department__folder").find(".error").text("Department folder with that name is already exists");
				}
			});
			if (allow == true) {
				$(this).closest(".modal__wrapper").fadeOut(300);
				$("body,html").css('overflow-y' , "initial");

				// let newElement = "<div class='elem__department--folder " + $(".active__company").attr("data-folder") +"' data-department=unique" + ($('.grid__department .elem__department--folder').length  + 1) + " id=''>\
				// 						<span>0</span>\
				// 						<div class='department__box'>\
				// 							<div class='department__left'>\
				// 								<span><img src='/static/img/foldericon.svg' alt='folder'></span>\
				// 								<div class='department__folder--info'>\
				// 									<h6>" + $(this).find(".department__name").val() + "</h6>\
				// 									<ul>\
				// 										<li><span>0</span> files </li>\
				// 										<li class='spacer'>|</li>\
				// 										<li><span>0</span> MB</li>\
				// 									</ul>\
				// 								</div>\
				// 							</div>\
				// 							<div class='department__right'>\
				// 								<div class='dropdown__dots'>\
				// 									<a href='#'><img src='/static/img/dots.svg' alt='dots'></a>\
				// 									<div class='dropdown__box'>\
				// 										<ul>\
				// 											<li><a href='#' class='rename__folder'>Rename</a></li>\
				// 											<li><a href='#' class='delete__folder'>Delete</a></li>\
				// 											<li><a href='#' class='copy__button' data-copy='1google.com'>Copy Link</a></li>\
				// 										</ul>\
				// 									</div>\
				// 								</div>\
				// 							</div>\
				// 						</div>\
				// 					</div>";
				// $('.grid__department').append(newElement);
				// $('.department__main').fadeIn(300);

				// Yevhen
				const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
				const newFolderName = $(this).find(".department__name").val();
				const parentFolder = $(".active__company").attr("id");
				// const currentDepartment = $(".grid__department").children()[$(".grid__department").children().length - 1];

				let data = new FormData();
				data.append('new_folder_name', newFolderName);
				data.append('parent_folder', parentFolder);

				$.ajax({
					url: "/ajax-create-sub-folder",
					method: 'POST',
					headers: {'X-CSRFToken': csrfToken},
					data: data,
					contentType: false,
					processData: false,
					success: function (data) {
						addDepartment(data['folder_name'], data['unique_folder_name'], 0, 0.0)
						// currentDepartment.setAttribute('id', data['unique_folder_name']);
						// currentDepartment.getElementsByClassName('copy__button')[0].setAttribute('data-copy', data['unique_folder_name']);
						$(".grid__department .elem__department--folder." + $(".active__company").attr("data-folder")).fadeIn(300);
					},
					error: function (data) {console.log("ERROR", data)}
				});
				// End - Yevhen

				$(this).find(".department__name").val("");
				$(".grid__department .elem__department--folder." + $(".active__company").attr("data-folder")).fadeIn(300);

				createJobRow("newFile" , "pdf" , "8.2" , "msforhr.com/AMAZON LLC/IT/Senior Software Engineer.pdf" , "06-02-2022" , "unique" + ($('.grid__department .elem__department--folder').length) , "lorem10 20 210 123012" , "files/pdf1.pdf");
				createJobRow("newFile2" , "docx" , "5.3" , "msforhr.com/AMAZON LLC/IT/Senior Software Engineer.pdf" , "06-02-2022" , "unique" + ($('.grid__department .elem__department--folder').length) , "lorem10 20 210 123012" , "files/pdf1.pdf");
				createJobRow("newFile4" , "png" , "3.4" , "msforhr.com/AMAZON LLC/IT/Senior Software Engineer.pdf" , "06-02-2022" , "unique" + ($('.grid__department .elem__department--folder').length) , "lorem10 20 210 123012" , "files/pdf1.pdf");
				createJobRow("newFile8" , "jpg" , "3.6" , "msforhr.com/AMAZON LLC/IT/Senior Software Engineer.pdf" , "06-02-2022" , "unique" + ($('.grid__department .elem__department--folder').length) , "lorem10 20 210 123012" , "files/pdf1.pdf");
				createJobRow("newFile" , "pdf" , "8.2" , "msforhr.com/AMAZON LLC/IT/Senior Software Engineer.pdf" , "06-02-2022" , "unique" + ($('.grid__department .elem__department--folder').length) , "lorem10 20 210 123012" , "files/pdf1.pdf");
				createJobRow("newFile2" , "docx" , "5.3" , "msforhr.com/AMAZON LLC/IT/Senior Software Engineer.pdf" , "06-02-2022" , "unique" + ($('.grid__department .elem__department--folder').length) , "lorem10 20 210 123012" , "files/pdf1.pdf");
				createJobRow("newFile4" , "png" , "3.4" , "msforhr.com/AMAZON LLC/IT/Senior Software Engineer.pdf" , "06-02-2022" , "unique" + ($('.grid__department .elem__department--folder').length) , "lorem10 20 210 123012" , "files/pdf1.pdf");
				createJobRow("newFile8" , "jpg" , "3.6" , "msforhr.com/AMAZON LLC/IT/Senior Software Engineer.pdf" , "06-02-2022" , "unique" + ($('.grid__department .elem__department--folder').length) , "lorem10 20 210 123012" , "files/pdf1.pdf");
			}
		}







		
	});	
	$('.company__folder').on('submit' ,function(e){
		e.preventDefault();
		if ($(this).find(".company__name").val().length == 0) {
			$(this).find(".error").fadeIn(300);
			$(this).find(".company__name").addClass('error__input')
			$(this).find(".error").text("Please enter Company Name");
		} else {
			let allow = true;
			$('.company__grid .elem__company').each(function(index,elem){
				if ($(".company__folder").find(".company__name").val().toLowerCase() == $(elem).find(".company__folder--info>h6").text().toLowerCase()) {
					allow = false;
					$(".company__folder").find(".company__name").addClass("error__input");
					$(".company__folder").find(".error").fadeIn(300);
					$(".company__folder").find(".error").text("Company folder with that name is already exists");
				}
			});
			if (allow == true) {
				$(this).closest('.modal__wrapper').fadeOut(300);
				$("body,html").css("overflow-y" , 'initial');
				$('.right__company').fadeIn(300);

				// let newElement = "<div class='elem__company' data-folder=folder"+ (+$('.company__grid .elem__company').length + 1) +" id=''>\
				// 					<div class='elem__company--box'>\
				// 						<div class='company__left'>\
				// 							<span><img src='/static/img/foldericon.svg' alt='folder'></span>\
				// 							<div class='company__folder--info'>\
				// 								<h6>" + $(this).find(".company__name").val() +  "</h6>\
				// 								<ul>\
				// 									<li><span>0</span> files </li>\
				// 									<li class='spacer'>|</li>\
				// 									<li><span>0.0</span> MB</li>\
				// 								</ul>\
				// 							</div>\
				// 						</div>\
				// 						<div class='company__right'>\
				// 							<div class='dropdown__dots'>\
				// 								<a href='#'><img src='/static/img/dots.svg' alt='dots'></a>\
				// 								<div class='dropdown__box'>\
				// 									<ul>\
				// 										<li><a href='#' class='rename__folder'>Rename</a></li>\
				// 										<li><a href='#' class='delete__folder'>Delete</a></li>\
				// 										<li><a href='#' class='copy__button' data-copy='2google.com'>Copy Link</a></li>\
				// 									</ul>\
				// 								</div>\
				// 							</div>\
				// 						</div>\
				// 					</div>\
				// 				</div>";
				// $(".company__grid").append(newElement);

				// Yevhen
				const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
				const newFolderName = $(this).find(".company__name").val();

				let data = new FormData();
				data.append('new_folder_name', newFolderName)

				$.ajax({
					url: "/ajax-create-folder",
					method: 'POST',
					headers: {'X-CSRFToken': csrfToken},
					data: data,
					contentType: false,
					processData: false,
					success: function (data) {addCompany(newFolderName, data['unique_folder_name'], 0, 0.0)},
					error: function (data) {console.log("ERROR", data)}
				});
				// End - Yevhen
				$(this).find(".company__name").val("");
			}
		}
	});



	$('.positions__form input').on('input' ,function(e){
		let currentSearch = $(this).val().toLowerCase().replace(/\s/g, '');
		if ($(this).val().length == 0) {
			$(".position__grid .position__row").css("display" , "flex");
		} else {
			$('.position__grid .position__row.active__rows').each(function(index, elem){
				var count = 0;
				$(elem).find(".elem__position").each(function(index,elem){
					let elemText = $(this).find(">p").text().toLowerCase();
					console.log(elemText);
					if (elemText.indexOf(currentSearch) !== -1) {
						count++;
						return count;
					}
				})
				if (count == 0) {
					$(elem).css("display" , 'none');
				} else {
					$(elem).css("display" , "flex");
				}
			});
		}
	});

	function createJobRow(fileName, extension, size, path, lastreceived, dataFolder, comment, pdfFilePath){

		$(".elem__department--folder[data-department="+ dataFolder +"]").find(">span").fadeIn(200);
		// $(".elem__department--folder[data-department="+ dataFolder +"]").find(">span").text(+$(".elem__department--folder[data-department="+ dataFolder +"]").find(">span").text() + 1);
		// $(".elem__department--folder[data-department="+ dataFolder +"]").find(".department__folder--info>ul>li:nth-child(1)>span").text(+$(".elem__department--folder[data-department="+ dataFolder +"]").find(".department__folder--info>ul>li:nth-child(1)>span").text() + 1);
		// $(".elem__department--folder[data-department="+ dataFolder +"]").find(".department__folder--info>ul>li:nth-child(3)>span").text((+$(".elem__department--folder[data-department="+ dataFolder +"]").find(".department__folder--info>ul>li:nth-child(3)>span").text() + +size).toFixed(1))
		// <p><span class='file__name'>"+ fileName +"</span>."+ extension +"</p>\
		let newRow = "<div class='position__row--wrapper' data-position=uniquerow" +$(".position__row--wrapper").length + " data-file-path="+ path +">\
										<div class='position__row' data-folder="+ dataFolder +" data-company="+ $('.active__company')[0].id +">\
										<div class='elem__position'>\
											<div class='mobile__desc'>\
												<p>File Name</p>\
											</div>\
											<p><span class='file__name'>"+ fileName +"</span></p>\
										</div>\
										<div class='elem__position'>\
											<div class='mobile__desc'>\
												<p>Size</p>\
											</div>\
											<p class='size__file'  data-size="+ size +">"+ size +"MB</p>\
										</div>\
										<div class='elem__position'>\
											<div class='mobile__desc'>\
												<p>Received</p>\
											</div>\
											<p>"+ lastreceived + "</p>\
										</div>\
										<div class='elem__position'>\
											<div class='mobile__desc'>\
												<p>Comments</p>\
											</div>\
											<p class='comment__'>"+ comment +"</p>\
										</div>\
										<div class='elem__position'>\
											<div class='mobile__desc'>\
												<p>View</p>\
											</div>\
											<p><a href='#' class='view__pdf--button' data-view="+ pdfFilePath +">View PDF</a></p>\
										</div>\
										<div class='elem__position'>\
											<div class='mobile__desc'>\
												<p>Actions</p>\
											</div>\
											<div class='dropdown__dots'>\
												<a href='#'><img src='/static/img/dots.svg' alt='dots'></a>\
												<div class='dropdown__box'>\
													<ul>\
														<li><a href='#' class='add__comment--button' >Add comment</a></li>\
														<li><a href='#' class='rename__file'>Rename</a></li>\
														<li><a href='#' class='move__file'>Move</a></li>\
														<li><a href='#' class='copy__file' data-file-path="+ path +">Copy</a></li>\
														<li><a href='#' class='delete__file'>Delete</a></li>\
													</ul>\
												</div>\
											</div>\
										</div>\
									</div>\
								</div>";
		$('.position__grid').append(newRow);
		// recalculateFolders();
	}
	$("body").on("mousedown" , ".elem__department--folder" , function(e){
		if (e.button === 2) e.target.contentEditable = true;
	  setTimeout(() => e.target.contentEditable = false, 100);
	});
	

	$("body").on("paste" , ".elem__department--folder" ,function(e){
		// Yevhen
		const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
		const toDepartment = $(this).attr("id");

		let data = new FormData();
		data.append('to_department', toDepartment)

		$.ajax({
			url: "/ajax-past-file-from-clipboard",
			method: 'POST',
			headers: {'X-CSRFToken': csrfToken},
			data: data,
			contentType: false,
			processData: false,
			success: function (data) {
				$('.copy__status').css('bottom' ,"20px");
				$(".error__status").css("bottom", "-60px");
				$('.copy__status p').text("Paste successfully");
				$('.copied__position').removeClass('copied__position');
				$(this).closest(".position__row--wrapper").addClass("copied__position");
				if (!copyTimeout) {
					copyTimeout = setTimeout(function(){
						$('.copy__status').css('bottom' ,"-60px");
					} ,1500);
				} else {
					clearTimeout(copyTimeout);
					copyTimeout = setTimeout(function(){
						$('.copy__status').css('bottom' ,"-60px");
					} ,1500);
				}

				setTimeout(function(){
					const currentCompany = $(".active__company").attr('id');
					recalculateCurrentCompany(currentCompany)
				}, 500);
			},
			error: function (data) {console.log("ERROR", data)}
		});
		// End - Yevhen
		let currentCompanyId = $(this).attr("id");
		let currentDepartment = $(this).attr("data-department");
		let allowCopy = true;

		if ($(".copied__position").length == 0) {
			$('.error__status').css('bottom' ,"20px");
			$('.copy__status').css("bottom" ,"-60px");
			$('.error__status p').text("Nothing is copied");
			if (!copyTimeout) {
				copyTimeout = setTimeout(function(){
					$('.error__status').css('bottom' ,"-60px");
				} ,1500);
			} else {
				clearTimeout(copyTimeout);
				copyTimeout = setTimeout(function(){
					$('.error__status').css('bottom' ,"-60px");
				} ,1500);
			}
		} else {
			$(".position__row").each(function(index,elem){
				if ($(elem).attr("data-folder") == currentDepartment && $(elem).attr("data-company") == currentCompanyId) {
					if ($(elem).closest(".position__row--wrapper").hasClass("copied__position")) {
						allowCopy = false;
					}
				}
			});
			if (allowCopy == false) {
				$('.error__status').css('bottom' ,"20px");
				$('.copy__status').css("bottom" ,"-60px");
				$('.error__status p').text("This position is already exists");
				if (!copyTimeout) {
					copyTimeout = setTimeout(function(){
						$('.error__status').css('bottom' ,"-60px");
					} ,1500);
				} else {
					clearTimeout(copyTimeout);
					copyTimeout = setTimeout(function(){
						$('.error__status').css('bottom' ,"-60px");
					} ,1500);
				}
			}
			// } else {
			// 	let newElement = $(".copied__position").clone();
			// 	$(newElement).css("display" ,"block");
			// 	$(newElement).attr("data-position" , "uniquerow" + $('.position__row--wrapper').length);
			// 	$(newElement).removeClass("copied__position");
			// 	$(newElement).find(".position__row").attr("data-folder" , currentDepartment);
			// 	$('.position__grid').prepend(newElement);
			// 	recalculateFolders();
			// 	$('.copy__status').css('bottom' ,"20px");
			// 	$(".error__status").css("bottom", "-60px");
			// 	$('.copy__status p').text("Paste successfully");
			// 	$('.copied__position').removeClass('copied__position');
			// 	$(this).closest(".position__row--wrapper").addClass("copied__position");
			// 	if (!copyTimeout) {
			// 		copyTimeout = setTimeout(function(){
			// 			$('.copy__status').css('bottom' ,"-60px");
			// 		} ,1500);
			// 	} else {
			// 		clearTimeout(copyTimeout);
			// 		copyTimeout = setTimeout(function(){
			// 			$('.copy__status').css('bottom' ,"-60px");
			// 		} ,1500);
			// 	}
			// }
		}
		
	});


	$("body").on("click" , ".copy__file" ,function(e){
		e.preventDefault();
		// Yevhen
		const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
		const filePath = $(this)[0].getAttribute('data-file-path');

		let data = new FormData();
		data.append('file_path', filePath)

		$.ajax({
			url: "/ajax-copy-file-to-clipboard",
			method: 'POST',
			headers: {'X-CSRFToken': csrfToken},
			data: data,
			contentType: false,
			processData: false,
			success: function (data) {clipboard = true},
			error: function (data) {console.log("ERROR", data)}
		});
		// End - Yevhen
		$('.dropdown__dots .dropdown__box').fadeOut(150);
		copyToClipboard($(this).attr('data-copy'));
		$('.copy__status').css('bottom' ,"20px");
		$(".error__status").css("bottom", "-60px");
		$('.copy__status p').text("Job Position copied");
		$('.copied__position').removeClass('copied__position');
		$(this).closest(".position__row--wrapper").addClass("copied__position");
		if (!copyTimeout) {
			copyTimeout = setTimeout(function(){
				$('.copy__status').css('bottom' ,"-60px");
			} ,1500);
		} else {
			clearTimeout(copyTimeout);
			copyTimeout = setTimeout(function(){
				$('.copy__status').css('bottom' ,"-60px");
			} ,1500);
		}
	});

	$('body').on("click" , ".delete__file" , function(e){
		e.preventDefault();
		$('.dropdown__dots .dropdown__box').fadeOut(150);
		$(this).closest(".position__row--wrapper").remove();

		// Yevhen
		// recalculateFolders();
		const currentCompany = $(".active__company").attr('id');
		recalculateCurrentCompany(currentCompany);

		const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;

		let data = new FormData();
		data.append('file_path', $(this).closest(".position__row--wrapper").data('file-path'));

		$.ajax({
			url: "/ajax-delete-file",
			method: 'POST',
			headers: {'X-CSRFToken': csrfToken},
			data: data,
			contentType: false,
			processData: false,
			success: function (data) {},
			error: function (data) {console.log("ERROR", data)}
		});
		// End - Yevhen
	});

	$('body').on("click", ".add__comment--button" , function(e){
		e.preventDefault();
		$('.dropdown__dots .dropdown__box').fadeOut(150);
		$(".add__comment").closest(".modal__wrapper").attr("data-row" , $(this).closest(".position__row--wrapper").attr("data-position"));
		$(".add__comment").closest(".modal__wrapper").fadeIn(300);
		$("body,html").css("overflow-y" ,"hidden");
		$(".add__comment").find('.comment__text').val($(this).closest('.position__row').find(".comment__").text());
	});

	$('form.add__comment').on("submit" ,function(e){
		e.preventDefault();
		$('body,html').css("overflow-y" ,"initial");
		$("form.add__comment").closest('.modal__wrapper').fadeOut(300);
		if ($(this).find(".comment__text").val() == "") {
			$(".position__row--wrapper[data-position="+ $(this).closest('.modal__wrapper').attr("data-row") +"]").find(".comment__").text("-");		
		} else {
			$(".position__row--wrapper[data-position="+ $(this).closest('.modal__wrapper').attr("data-row") +"]").find(".comment__").text($(this).find(".comment__text").val());		
		}

		// Yevhen
		const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;

		const filePath = $(".position__row--wrapper[data-position="+ $(this).closest('.modal__wrapper').attr("data-row") +"]").attr("data-file-path");
		const fileComment = $(this).find(".comment__text").val();

		let data = new FormData();
		data.append('file_path', filePath);
		data.append('file_comment', fileComment);

		$.ajax({
			url: "/ajax-add-comment-to-file",
			method: 'POST',
			headers: {'X-CSRFToken': csrfToken},
			data: data,
			contentType: false,
			processData: false,
			success: function (data) {},
			error: function (data) {console.log("ERROR", data)}
		});
		// End - Yevhen


	});

	$('body').on("click" , ".rename__file" ,function(e){
		e.preventDefault();
		$('.dropdown__dots .dropdown__box').fadeOut(150);
		$('.rename__row').closest(".modal__wrapper").fadeIn(300);
		$("body,html").css("overflow-y" ,"hidden");
		$(".rename__row").closest(".modal__wrapper").attr("data-file-path" , $(this).closest(".position__row--wrapper").data('file-path'));
		$(".rename__row").closest(".modal__wrapper").attr("data-oldname" , $(this).closest(".position__row--wrapper").find(".file__name").text());
		$('.rename__row').closest(".modal__wrapper").attr("data-row" , $(this).closest(".position__row--wrapper").attr("data-position"));
		$(".rename__row").find(".file__name--input").val($(this).closest(".position__row--wrapper").find(".file__name").text());
	});

	$('form.rename__row').on("submit" ,function(e){
		e.preventDefault();

		// Yevhen
		const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;

		const filePath = $(this).closest(".modal__wrapper").attr("data-file-path");
		const oldFileName = $(this).closest(".modal__wrapper").attr("data-oldname");
		const newFileName = $(this).find(".file__name--input").val();

		let data = new FormData();
		data.append('file_path', filePath);
		data.append('old_file_name', oldFileName);
		data.append('new_file_name', newFileName);

		$.ajax({
			url: "/ajax-rename-file",
			method: 'POST',
			headers: {'X-CSRFToken': csrfToken},
			data: data,
			contentType: false,
			processData: false,
			success: function (data) {},
			error: function (data) {console.log("ERROR", data)}
		});
		// End - Yevhen

		let currentValue = $(this).find(".file__name--input").val();
		if ($(this).find(".file__name--input").val().toLowerCase() != $(this).closest(".modal__wrapper").attr("data-oldname").toLowerCase()) {
			let countError = 0;
			$('.active__rows').each(function(index,elem){
				if ($(elem).find(".file__name").text().toLowerCase() == currentValue) {
					$('.rename__row').find(".file__name--input").addClass("error__input");
					$('.rename__row').find(".error").fadeIn(300);
					$('.rename__row').find(".error").text("File with that name is already exists.");
					countError++;
				}
			});
			if (countError == 0) {
				$("body,html").css("overflow-y" ,"initial"); 
				$(this).closest(".modal__wrapper").fadeOut(300);
				$(".position__row--wrapper[data-position="+ $(this).closest(".modal__wrapper").attr("data-row") +"]").find(".file__name").text($(this).find(".file__name--input").val());
				$(this).find(".file__name--input").val("");	
			}
		} else {
			$("body,html").css("overflow-y" ,"initial"); 
			$(this).closest(".modal__wrapper").fadeOut(300);
			$(".position__row--wrapper[data-position="+ $(this).closest(".modal__wrapper").attr("data-row") +"]").find(".file__name").text($(this).find(".file__name--input").val());
			$(this).find(".file__name--input").val("");	
		}
	});



	$("body").on("click" ,".view__pdf--button" , function(e){
		e.preventDefault();
		if ($(window).width() > 1200) {
			$("body,html").css("overflow-y" ,"hidden");
			$('.modal__pdf').closest(".modal__wrapper").fadeIn(300);
			$(".modal__pdf").find("object").attr("data" , $(this).attr("data-view"));
			$(".modal__pdf").find("iframe").attr("src" , $(this).attr("data-view"));
		} else {
			window.open($(this).attr("data-view"), '_blank').focus();
		}
	});

	$("body").on("click" ,".move__file" , function(e){
		e.preventDefault();
		$('.move__me').removeClass("move__me");
		$(this).closest('.position__row--wrapper').addClass("move__me");
		
		$('.move__list .elem__move').remove();
		$('.elem__department--folder').each(function(index,elem){
			if (!$(elem).hasClass('active__department')) {
				let newFolder = "<div class='elem__move' data-folder="+ $(elem).attr("data-department") +">\
	                			<span><img src='/static/img/foldericon.svg' alt='folder'></span>\
	                			<p>"+ $(elem).find(".department__folder--info>h6").text() +"</p>\
	                		</div>"
				$(".move__list").append(newFolder);
			}
			
		});
		if ($('.elem__move').length == 0) {
			$(".copy__status").css("bottom", "-60px");
			$('.error__status').css('bottom' ,"20px");
			$('.error__status p').text("Folders doesn't exist (create new one)");
			if (!copyTimeout) {
				copyTimeout = setTimeout(function(){
					$('.error__status').css('bottom' ,"-60px");
				} ,1500);
			} else {
				clearTimeout(copyTimeout);
				copyTimeout = setTimeout(function(){
					$('.error__status').css('bottom' ,"-60px");
				} ,1500);
			}
		} else {
			$('.dropdown__dots .dropdown__box').fadeOut(150);
			$('.move__box').closest(".modal__wrapper").fadeIn(300);
			$("body,html").css("overflow-y" , "hidden");
		}
	});

	$("body").on("click" , ".elem__move" ,function(e){
		e.preventDefault();
		$(".elem__move").removeClass("active__move");
		$(this).addClass("active__move");
		$('.move__submit button').removeClass("disabled");
	});

	$("body").on("submit" , ".move__form" ,function(e){
		e.preventDefault();

		// Yevhen
		const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;

		const oldFilePath = $('.move__me')[0].getAttribute("data-file-path");
		const newUniqueFolderName = $("div").find(`[data-department='${$('.active__move').attr("data-folder")}']`)[0].getAttribute("id");

		let data = new FormData();
		data.append('old_file_path', oldFilePath);
		data.append('new_unique_folder_name', newUniqueFolderName);

		$.ajax({
			url: "/ajax-move-file",
			method: 'POST',
			headers: {'X-CSRFToken': csrfToken},
			data: data,
			contentType: false,
			processData: false,
			success: function (data) {$('.move__me')[0].remove()},
			error: function (data) {console.log("ERROR", data)}
		});
		// End - Yevhen

		$('body,html').css("overflow-y" ,"initial");
		$(this).closest(".modal__wrapper").fadeOut(300);
		let moveElement = $('.move__me');
		$(".move__form").find('.move__submit>button').addClass("disabled");
		$('.copy__status p').text("Moved successfully");
		$('.copy__status').css('bottom' ,"20px");
		if (!copyTimeout) {
			copyTimeout = setTimeout(function(){
				$('.copy__status').css('bottom' ,"-60px");
			} ,1500);
		} else {
			clearTimeout(copyTimeout);
			copyTimeout = setTimeout(function(){
				$('.copy__status').css('bottom' ,"-60px");
			} ,1500);
		}
		$(moveElement).find(".position__row").attr("data-folder" , $('.active__move').attr("data-folder"));
		$('.position__grid').prepend(moveElement);
		// Yevhen
		const currentCompany = $(".active__company").attr('id');
		recalculateCurrentCompany(currentCompany)
		// recalculateFolders();
		// End - Yevhen
	});


	$(".modal__pdf>a").on("click" ,function(e){
		e.preventDefault();
		$(this).closest(".modal__wrapper").fadeOut(300);
		$('body,html').css("overflow-y" , "initial");
	});

	function createPagination(){

	}

	function recalculateFolders(){
		$('.elem__company').each(function(index,elem){
			let mainFile = 0;
			let mainSize =  0;
			$('.elem__department--folder.' + $(elem).attr("data-folder")).each(function(index,elem){
				let file  = 0;
				let size = 0;
				$(".position__row[data-folder="+ $(elem).attr("data-department") +"]").each(function(index,elem){
					file++;
					size = (+size + +$(elem).find(".size__file").attr("data-size")).toFixed(1);
				});
				$(elem).find(".department__folder--info>ul>li:nth-child(1)>span").text(file);
				$(elem).find(".department__folder--info>ul>li:nth-child(3)>span").text(size);
				$(elem).find(">span").text(file);
				mainFile += +file;
				mainSize += +size;
			});

			$(elem).find(".company__folder--info>ul>li:nth-child(1) span").text(mainFile);
			$(elem).find(".company__folder--info>ul>li:nth-child(3) span").text(mainSize.toFixed(1));
		});
	}
	// Yevhen
	function recalculateCurrentCompany(currentCompany){

		const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;

		let data = new FormData();
		data.append('current_company', currentCompany)

		$.ajax({
			url: "/ajax-recalculate-company",
			method: 'POST',
			headers: {'X-CSRFToken': csrfToken},
			data: data,
			contentType: false,
			processData: false,
			success: function (data) {
				$(`#${currentCompany}`).find(".company__folder--info>ul>li:nth-child(1) span").text(data['folders_data']['company']['count_files']);
				$(`#${currentCompany}`).find(".company__folder--info>ul>li:nth-child(3) span").text(data['folders_data']['company']['total_file_size']);

				$('.elem__department--folder.' + $(`#${currentCompany}`).data('folder')).each(function(index,elem){
					$(elem).find(".department__folder--info>ul>li:nth-child(1)>span").text(data['folders_data'][$(elem)[0].id]['count_files']);
					$(elem).find(".department__folder--info>ul>li:nth-child(3)>span").text(data['folders_data'][$(elem)[0].id]['total_file_size']);
					$(elem).find(".count_files").text(data['folders_data'][$(elem)[0].id]['count_files']);
				});
			},
			error: function (data) {console.log("ERROR", data)}
		});
	}

	$("#button__sign-up").on('click' ,function(e){
		const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
		const firstName = $('.form__signup>form>.double__group>:nth-child(1)>:nth-child(2)').val();
		const lastName = $('.form__signup>form>.double__group>:nth-child(2)>:nth-child(2)').val();
		const email = $('.form__signup>form>:nth-child(2)>:nth-child(2)').val();
		const password = $('.form__signup>form>:nth-child(3)>:nth-child(2)').val();
		const confirmPassword = $('.form__signup>form>:nth-child(4)>:nth-child(2)').val();

		if (password == confirmPassword) {
			let data = new FormData();
			data.append('first_name', firstName)
			data.append('last_name', lastName)
			data.append('email', email)
			data.append('password', password)

			$.ajax({
				url: "/accounts/sign-up/",
				method: 'POST',
				headers: {'X-CSRFToken': csrfToken},
				data: data,
				contentType: false,
				processData: false,
				success: function (data) {
					window.location.replace("/main");
				},
				error: function (data) {console.log("ERROR", data)}
			});
		} else {
			$('.form__signup>form>:nth-child(4)>:nth-child(4)')[0].style.display='block';
			$('.form__signup>form>:nth-child(4)>:nth-child(3)')[0].style.bottom='22px';
		};
	});
	// End -  Yevhen

	$("#button__hr").on('click' ,function(e){
		$(".overlay__block--wrapper").css('display', 'none');
	});

});