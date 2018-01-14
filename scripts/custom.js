// Create a Stripe client
var stripe = Stripe('pk_test_jIxkcFZApPWPynEEMP8qkHPH');

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

// Handle form submission
var form = document.getElementById('payment-form');
form.addEventListener('submit', function(event) {
  event.preventDefault();

  stripe.createToken(card).then(function(result) {
    if (result.error) {
      // Inform the user if there was an error
      var errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
    } else {
      // Send the token to your server
      stripeTokenHandler(result.token);
    }
  });
});

var ticketsSelected = [];

$(document).ready(function() {
  $(".link-left").click(function(event) {
    event.preventDefault();
    var spanId = event.target.id.replace("add", "count");
    var ticketId = event.target.id.replace("add-", "");
    if(ticketsSelected.length < 1) {
      ticketsSelected.push({id: ticketId, count: 1});
      $('#' + spanId).text = "1";
    }
    else {
      for(var i=0; i<ticketsSelected.length; i++) {
        if(ticketsSelected[i].id === ticketId) {
          ticketsSelected[i].count++;
          $('#' + spanId).text = ticketsSelected[i].count.toString();
        }
        else if(i === ticketsSelected.length - 1) {
          ticketsSelected.push({id: ticketId, count: 1});
          $('#' + spanId).text = "1";
        }
      }
    }
    console.log(ticketsSelected);
  });
  $(".link-right").click(function(event) {
    event.preventDefault();
    var tempTicketsSelected = [];
    var spanId = event.target.id.replace("remove", "count");
    var ticketId = event.target.id.replace("remove-", "");

    for(var i=0; i<ticketsSelected.length; i++) {
      if(ticketsSelected[i].id === ticketId) {
        if(ticketsSelected[i].count > 1) {
          ticketsSelected[i].count--;
          tempTicketsSelected.push(ticketsSelected[i]);
          $('#' + spanId).text = ticketsSelected[i].count.toString();
        }
        else {
          $('#' + spanId).text = "0";
        }
      }
      else {
        tempTicketsSelected.push(ticketsSelected[i]);
      }
    }
    ticketsSelected = tempTicketsSelected;
    console.log(ticketsSelected);
  });
});