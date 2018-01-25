function stripeTokenHandler(token) {
  $.LoadingOverlay("show"); 
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

  $.ajax({
    type: 'POST',
    url: 'https://us-central1-valentine-baldwin.cloudfunctions.net/saveEntry',
    data: data,
    dataType: 'json'
  })
  .done(function() {
    $.LoadingOverlay("hide"); 
    $("#success-message-field").show();
    $("#success-message-field").text('Thank you for your donation. Your tickets have been entered for the draw and you will be contacted if you win anything!'); 
    setTimeout(function(){
      $("#success-message-field").hide();
    }, 20000);
  })
  .fail(function() {
    $.LoadingOverlay("hide"); 
    $("#error-message-field").text('There was an error.');
    $("#error-message-field").show();
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