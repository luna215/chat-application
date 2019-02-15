$(function() {
    var FADE_TIME = 150; // in ms

    // Initialize variables
    var $window = $(window);
    var $usernameInput = $('.usernameInput');
    var $messages = $('.messages');
    var $loginPage = $('.login.page');

    // Propmt for setting a username
    var username;
    var connected = false;
    var $currentInput = $usernameInput.focus();
    var socket = io();

    // log a message
    const log = (message, options) => {
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options)
    }

    const addMessageElement = (el, options) => {
        var $el = $(el);

        // setup default options
        if(!options) {
            options = {};
        }

        if(typeof options.fade === 'undefined') {
            options.fade = true;
        }

        if(typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if(options.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }

        if(options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }

        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    const addParticipantsMessage = (data) => {
        var message = '';
        if(data.numUsers === 1) {
            message += `there's 1 participant`;
        } else {
            message += `there are ${data.numUsers} participants`;
        }

        log(message);
    }

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

    $('form').submit(function(e) {
      e.preventDefault(); // prevents page reloading
      socket.emit('chat message', $('.inputMessage').val());
      $('.inputMessage').val('');
    });
    socket.on('chat message', function(msg){
      $('.messages').append($('<li>').text(msg));
    })

    socket.on('login', (data) => {
        connected = true;

        // Display welcome message
        var message = "Welcome to the chat!";
        log(message, {prepend: true});
        addParticipantsMessage(data);
    });

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