// Create a Stripe client
var stripe = Stripe('pk_live_gGXvGnVE3ZNAIKlB0wIz84gh');

// Create an instance of Elements
var elements = stripe.elements();

// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
var style = {
  base: {
    color: '#32325d',
    lineHeight: '18px',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4'
    }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};

// Create an instance of the card Element
var card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` <div>
card.mount('#card-element');

// Handle real-time validation errors from the card Element.
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});

function stripeTokenHandler(token) {
  var data = {
    firstName: $('#donate-first').val(),
    lastName: $('#donate-last').val(),
    address: $('#donate-address').val(),
    postalCode: $('#donate-postal').val(),
    phone: $('#donate-phone').val(),
    email: $('#donate-email').val(),
    token: token,
    tickets: ticketsSelected,
    donation: totalDonation
  }
  console.log(data);
  $.ajax({
    type: 'POST',
    url: 'https://us-central1-valentine-baldwin.cloudfunctions.net/saveEntry',
    data: data,
    success: function() { 
      $.LoadingOverlay("hide"); 
      $("#success-message-field").show();
      $("#success-message-field").text('Thank you for your donation! Your tickets have been entered for the draw and you will receive a donation receipt by email or mail.'); 
      setTimeout(function(){
        $("#success-message-field").hide();
      }, 20000);
    },
    error: function() { 
      $.LoadingOverlay("hide"); 
      $("#error-message-field").text('There was an error.');
      $("#error-message-field").show();
    },
    dataType: 'json'
  });
}

var ticketsSelected = [];
var ticketPrice = 500;
var totalDonation = 0;
var donationRef = firebase.database().ref('donations');
var donationGoal = 400000;

function updateTotal() {
  var totalCost = 0;
  var totalTickets = 0;

  for(var i=0; i<ticketsSelected.length; i++) {
    totalTickets += ticketsSelected[i].count;
  }  
    
  totalCost += totalTickets * ticketPrice;

  totalDonation = totalCost;
  $('#ticket-total-price').val('$' + totalCost / 100 + '.00');
  $('#total-donation-cost').text('$' + totalCost / 100 + '.00');
  $('#total-tickets').val(totalTickets);
}

$(document).ready(function() {
  $(".link-left").click(function(event) {
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    var spanId = event.target.id.replace("add", "count");
    var ticketId = event.target.id.replace("add-", "");
    console.log(ticketId);
    if(ticketsSelected.length < 1) {
      ticketsSelected.push({id: ticketId, count: 1});
      $('#' + spanId).text("1");
    }
    else {
      for(var i=0; i<ticketsSelected.length; i++) {
        if(ticketsSelected[i].id === ticketId) {
          ticketsSelected[i].count++;
          $('#' + spanId).text(ticketsSelected[i].count.toString());
          break;
        }
        else if(i === ticketsSelected.length - 1) {
          ticketsSelected.push({id: ticketId, count: 1});
          $('#' + spanId).text("1");
          break;
        }
      }
    }
    updateTotal();
  });
  $(".link-right").click(function(event) {
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    var tempTicketsSelected = [];
    var spanId = event.target.id.replace("remove", "count");
    var ticketId = event.target.id.replace("remove-", "");

    for(var i=0; i<ticketsSelected.length; i++) {
      if(ticketsSelected[i].id === ticketId) {
        if(ticketsSelected[i].count > 1) {
          ticketsSelected[i].count--;
          tempTicketsSelected.push(ticketsSelected[i]);
          $('#' + spanId).text(ticketsSelected[i].count.toString());
        }
        else {
          $('#' + spanId).text("0");
        }
      }
      else {
        tempTicketsSelected.push(ticketsSelected[i]);
      }
    }
    ticketsSelected = tempTicketsSelected;
    updateTotal();
  });
  $("#donate-now-button").click(function() {
    event.preventDefault();
    $("#error-message-field").hide();
    if(!$('#donate-first').val() && !$('#donate-last').val() &&
       !$('#donate-address').val() && !$('#donate-postal').val() &&
       !$('#donate-phone').val() && !$('#donate-email').val()) {
      $("#error-message-field").text('You must complete all form fields.');
      $("#error-message-field").show();
      return;
    }
    if($('#donate-first').val().trim() == '' && $('#donate-last').val().trim() == '' &&
       $('#donate-address').val().trim() == '' && $('#donate-postal').val().trim() == '' &&
       $('#donate-phone').val().trim() == '' && $('#donate-email').val().trim() == '') {
      $("#error-message-field").text('You must complete all form fields.');
      $("#error-message-field").show();
      return;
    }
    $.LoadingOverlay("show");
    stripe.createToken(card).then(function(result) {
      if (result.error) {
        // Inform the user if there was an error
        var errorElement = document.getElementById('card-errors');
        errorElement.textContent = result.error.message;
        $.LoadingOverlay("hide");
      } else {
        // Send the token to your server
        stripeTokenHandler(result.token.id);
      }
    });
  });
  donationRef.on('value', function(snapshot) {
    var totalDonations = 0;
    snapshot.forEach(childSnapshot => {
      totalDonations += parseInt(childSnapshot.val().donation); 
    });
    var donationPercentage = Math.round((totalDonations / donationGoal) * 100);
    $('#donation-amount').text('$' + Math.round(totalDonations / 100));
    $('#donation-progress').css('width', donationPercentage.toString() + '%');
  });
  $('#donation-goal').text('$' + Math.round(donationGoal / 100));
});