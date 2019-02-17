$(function() {
    var FADE_TIME = 150; // in ms
    var TYPING_TIMER_LENGTH = 400; 
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
    var username = '';
    var lastTypingTime;
    var connected = false;
    var typing = false;
    var $currentInput = $usernameInput.focus();
    var socket = io();

    // log a message
    const log = (message, options) => {
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options)
    }

    // Adds the visual chat message to the message list
    const addChatMessage = (data, options) => {
      // Don't fade the message in if there is an 'X was typing'
      var $typingMessages = getTypingMessages(data);
      options = options || {};
      if ($typingMessages.length !== 0) {
        options.fade = false;
        $typingMessages.remove();
      }

      var $usernameDiv = $('<span class="username"/>')
        .text(data.username)
        .css('color', getUsernameColor(data.username));
      var $messageBodyDiv = $('<span class="messageBody">')
        .text(data.message);

      var typingClass = data.typing ? 'typing' : '';
      var $messageDiv = $('<li class="message"/>')
        .data('username', data.username)
        .addClass(typingClass)
        .append($usernameDiv, $messageBodyDiv);

      addMessageElement($messageDiv, options);
    }

    // Add the visual chat typing message
    const addChatTyping = (data) => {
      data.typing = true;
      data.message = ' is typing';
      addChatMessage(data)
    }

    // remove the visual chat typing message
    const removeChatTyping = (data) => {
      getTypingMessages(data).fadeOut(function() {
        $(this).remove;
      });
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
        if(username != '') {
            // Send username to server
            socket.emit('add user', username);
        }
    }

    // display '${username} is typing'
    const getTypingMessages = (data) => {
      return $('.typing.message').filter(function(i) {
        return $(this).data('username') === data.username;
      })
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

    const updateTyping = () => {
      if(connected) {
        if(!typing) {
          typing = true;
          socket.emit('typing');
        }

        lastTypingTime = (new Date()).getTime();
        
        setTimeout(() => {
          var typingTimer = (new Date()).getTime();
          var timeDiff = typingTimer - lastTypingTime;
          if(timeDiff >= TYPING_TIMER_LENGTH && typing) {
            socket.emit('stop typing');
            typing = false;
          }
        }, TYPING_TIMER_LENGTH);
      }
    }

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
              socket.emit('stop typing');
              typing = false;
            } else {
              setUsername();
            }
        }
    });

    $inputMessage.on('input', () => {
      updateTyping();
    });
      
    socket.on('new message', function(data) {
      addChatMessage(data);
    });

    socket.on('typing', (data) => {
      addChatTyping(data);
    });

    socket.on('stop typing', (data) => {
      removeChatTyping(data);
    });

    socket.on('login', (data) => {
        connected = true;
        $loginPage.fadeOut();
        $loginPage.off('click');
        $username = data.username;
        // Display welcome message
        var message = "Welcome to the chat!";
        log(message, {prepend: true});
        addParticipantsMessage(data);
        
    });

    socket.on('user already exist', (data) => {
      alert(data.message);
      username = '';
    });

    socket.on('user joined', (data) => {
      var message = `${data.username} joined`;
      log(message, {prepend: false});
      addParticipantsMessage(data);
    });

    socket.on('user left', (data) => {
        log(`${data.username} left`);
        addParticipantsMessage(data);
    });
  });
