$(function() {
    var FADE_TIME = 150; // in ms
    var COLORS = [
      '#e21400', '#91580f', '#f8a700', '#f78b00',
      '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
      '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    // Initialize variables
    var $window = $(window);
    var $usernameInput = $('.usernameInput');
    var $inputMessage = $('.inputMessage');
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

    const addChatMessage = (data, options) => {
      options = options || {};
      var $usernameDiv = $('<span class="username"/>')
        .text(data.username)
        .css('color', getUsernameColor(data.username));
      var $messageBodyDiv = $('<span class="messageBody">')
        .text(data.message);

      var $messageDiv = $('<li class="message"/>')
        .data('username', data.username)
        .append($usernameDiv, $messageBodyDiv);

      addMessageElement($messageDiv, options);
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

    const getUsernameColor = (username) => {
      // Computer has code
      var hash = 7;
      for(var i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + (hash<<5) - hash;
      }

      // calculte color
      var index = Math.abs(hash % COLORS.length);
      return COLORS[index];
    }

    // Sends a chat message
    const sendMessage = () => {
      var message = $inputMessage.val();
      // Prevent markup from being injected into the message
      message = cleanInput(message);
      // if there is a non-empty message and a socket connection
      if (message && connected) {
        $inputMessage.val('');
        addChatMessage({
          username: username,
          message: message
        });
        // tell server to execute 'new message' and send along one parameter
        socket.emit('new message', message);
      }
    }

    socket.on('new message', function(data) {
      addChatMessage(data);
    });

    socket.on('login', (data) => {
        connected = true;

        // Display welcome message
        var message = "Welcome to the chat!";
        log(message, {prepend: true});
        addParticipantsMessage(data);
    });

    socket.on('user left', (data) => {
        log(`${data.username} left`);
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
              sendMessage();
            } else {
              setUsername();
            }
        }
    })
  });
