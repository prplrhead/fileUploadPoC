// JavaScript Document

$.mobile.page.prototype.options.domCache = false;
		function mypopup( div, closetime)
		{
			if( typeof closetime == 'undefined')
			{
				closetime = 2000;
			}
			$(div).popup("open",{ overlayTheme: "a" });
			setTimeout( function(){ $(div).popup("close")},closetime);
		}
		
		function showLoader()
		{
									$.mobile.loading( 'show', {
									text: false,
									textVisible: false,
									theme: "a",
									textonly: false,
									html: false
									});
		}
		
		
		function hideLoader()
		{
			$.mobile.loading( 'hide');
		}
		
		function loadPage( path, obj)
		{
			//showLoader();						
			/*$.post(path,obj,function(data){ 
				
			$("#divMain").html(data);
			ideLoader();
			});*/
			
			$.mobile.changePage("list.html");
		}
		
		
		function onDeviceReady(){
	
	var play_btn = '#play';
	var pause_btn = '#pause';
	var stop_btn = '#stop';
	var rewind_btn = '#rewind';
	var record_btn = '#record';
	
	$(document).on('click',play_btn,function(){
		
		alert('play');
		
		$(this).button('disable');
		$(pause_btn,document).button('enable');
	});
	
	$(document).on('click',pause_btn,function(){
		
				alert('pause');
		$(this).button('disable');
		$(play_btn,document).button('enable');
	});
	
	$(document).on('click',stop_btn,function(){
	
		alert('stop');
		$('#slider',document).val(0);
		$('#slider',document).slider('refresh');
		
	    $(pause_btn,document).button('disable');
		$(play_btn,document).button('enable');
	});
	
	$(document).on('click',rewind_btn,function(){
				alert('rewind');
		
		
	    $(play_btn,document).button('enable');
		$(pause_btn,document).button('disable');
	});
	
	$(document).on('click',record_btn,function(){
	
		$(this).button('disable');
		$(play_btn,document).button('enable');
		$(pause_btn,document).button('disable');
		
	});
}


	
	
	
$(document).ready(function(e) {
	onDeviceReady();
      $(document).on('click', '#submit', function() { // catch the form's submit event
            if($('#username').val().length > 0 && $('#password').val().length > 0){
                // Send data to server through the ajax call
                // action is functionality we want to call and outputJSON is our data
                    $.ajax({url: 'check.php',
                        data:  $('#check-user').serialize(),
                        type: 'post',                  
                        async: 'true',
                         dataType: 'json',
                        beforeSend: function() {
                            // This callback function will trigger before data is sent
							// $("body").append('<div class="modalWindow" />');
                          $.mobile.loading( 'show', {
									text: false,
									textVisible: false,
									theme: "a",
									textonly: false,
									html: false
									});
						},
                        complete: function() {
                            // This callback function will trigger on data sent/received complete
                            $.mobile.loading( 'hide'); // This will hide ajax spinner
                        },
                        success: function (result) {
							
                            if(result.status=='1') {
                               // $.mobile.changePage("list.html");      
							   loadPage('list.html', ob = { id : 1, name : "test" } );                  
                            } else {
								$("#divError p").text('Login unsuccessful!');
//                                alert('Logon unsuccessful!');
								mypopup("#divError");

                            }
                        },
                        error: function (request,error) {
                            // This callback function will trigger on unsuccessful action               
                           // alert('Network error has occurred please try again!')
						   $("#divError p").text('Network error has occurred please try again!');
						   mypopup("#divError");;
							//$("#divError").popup("open",{ overlayTheme: "a" });
                        }
                    });                  
            } else {
					$("#divError p").text('Please fill all necessary fields');
					mypopup("#divError");
              
            }          
            return false; // cancel original event to prevent form submitting
        }); 
		
		
		$("#backbutton").click(function() { 
					$.mobile.changePage($(this).attr('href'));
				});
				
				$(document).on("click","#songs-list a",function() { 
										
					$.mobile.changePage("player.html",{ songname : $(this).attr('rel') });
				});
				
				$('#slider',document).css('display','none !important;');
		
			$(document).on("change","#slider",function() { 
			
				$(".playedtimebtn").text($(this).val());
				
			});
});