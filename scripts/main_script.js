//Łagodne przejscie miedzy sekcjami z wykorzystaniem jQuery
$(document).ready(function(){
    
    $("a").on('click', function(event) {
  
      
      if (this.hash !== "") {
        event.preventDefault();

        var hash = this.hash;
  
        $('html, body').animate({
          scrollTop: $(hash).offset().top
        }, 800, function(){
     
         
          window.location.hash = hash;
        });
      } 
    });
});

//Odtwarzanie muzyki za pomoca jQuery
$(document).ready(function() {
  $("#my_audio").get(0).play();
});

