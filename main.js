$(function() {
    var FADE_TIME = 150; // in ms

    // Initialize variables
    var $window = $(window);
    var $usernameInput = $('.usernameInput');
    var $loginPage = $('.login.page');

    // Propmt for setting a username
    var username;
    var connected = false;
    var $currentInput = $usernameInput.focus();

    const setUsername = () => {
        username = cleanInput($usernameInput.val().trim());

        // If the username is valid
        if(username) {
            $loginPage.fadeOut();
            $loginPage.off('click');

            // Send username to server
            socket.emit('add user', username);
        }
    }

    var socket = io();
    $('form').submit(function(e) {
      e.preventDefault(); // prevents page reloading
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
    });
    socket.on('chat message', function(msg){
      $('.messages').append($('<li>').text(msg));
    })


    // Prevents input from having injected markup
    const cleanInput = (input) => {
        return $('<div/>').text(input).html();
    }
    // Click events
    
    // Focus input when clicking anywhere on login page
    $loginPage.click(() => {
        $currentInput.focus();
    });

    // keyboard events
    $window.keydown(event => {
        // Auto-focus the current input when a key is typed
        if(!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }

        // When client hits enter on their keybaord
        if(event.which === 13) {
            if(username) {
                
            } else {
                setUsername();
            }
        }
    })
  });