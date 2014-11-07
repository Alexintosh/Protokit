var _ = require('underscore');
var $ = require('../js/bonzo_qwery');

var buttonTmpl = require('../html/button.ejs');
var collapse_onfocus = require('../js/collapse_onfocus');
var is_small_screen = require('../js/is_small_screen');
var regex = require('../js/regex');
var empty = regex.empty;
var email_parser = regex.email_parser;
var trim = require('trim');
var signup = module.exports;

signup.submit = function (widget, connectionName, email, password) {
  var form = $('.a0-signup form');
  var password_input = $('input[name=password]', form);

  widget._setLoginView({mode: 'loading', title: 'signup'}, function () {
    widget._auth0.signup({
      connection: connectionName,
      username:   email,
      password:   password,
      auto_login: false
    }, function (err) {

      // This is now dummy, and should no longer exist since all
      // dom events keep a reference to widget._container
      if ( !widget._container || widget._$()[0] !== widget._container.childNodes[0] ) {
        return console && console.log && console.log('this signup was triggered from another node instance', arguments);
      }

      if (err) {
        // set error message before view refresh
        // to avoid wrong resizing calculations
        if (400 === err.status) {
          if ('invalid_password' === err.name) {

            Opentip.prototype['class'] = _.reduce(Opentip.prototype['class'], function (obj, value, key) {
              obj[key] = 'a0-' + value;
              return obj;
            }, {});

            Opentip.defaultStyle = "auth0Light";

            Opentip.styles.auth0Light = {
              // Make it look like the alert style. If you omit this, it will default to "standard"
              extends: "glass",
              // Tells the tooltip to be fixed and be attached to the trigger, which is the default target
              target: true,
              stem: true,
              showOn: "creation"
            };
            

            widget._focusError(password_input, '!'); //, err.message);
            Opentip.lastZIndex = 10000;
            var tip = new Opentip('span.a0-error-message', err.message, 'Optional title', {
              showOn: 'click',
              target: true,
              style: 'auth0Light',
              tipJoint: 'left',
              root: $('.a0-overlay').get(0),
              fixed: true,
              hideTrigger: null,
              className: 'auth0-opentip'
            });
            widget._showError(widget._dict.t('signup:invalidPassword'));
          } else {
            widget._showError(widget._dict.t('signup:userExistsErrorText'));
          }
        } else {
          widget._showError(widget._dict.t('signup:serverErrorText'));
        }
        return widget._setLoginView({ mode: 'signup' });
      }

      return widget._signInWithAuth0(email, password);
    });
  });
};

signup.bind = function (widget) {
  var list = widget._$('.a0-signup .a0-iconlist').html('');

  widget._$('.a0-signup .a0-options').show(widget._openWith ? 'none' : 'block');

  _.chain(widget._client.strategies)
    .where({social: true})
    .map(function (s) {
      var e = {
        use_big_buttons: false,
        title: widget._dict.t('signupSocialButton').replace('{connection:title}', s.title)
      }
      return  _.extend({}, s, e);
    })
    .each(function (s) { return list.append(buttonTmpl(s)); });

  if (_.where(widget._client.strategies, {social: true}).length > 0) {
    widget._$('.a0-signup .a0-separator, .a0-signup .a0-iconlist').show();
  }

  widget._$('.a0-zocial[data-strategy]', list).a0_on('click', function (e) {
    widget._signInSocial(e);
  });

  var form = widget._$('.a0-signup form')
    .a0_off('submit')
    .a0_on('submit', function (e) {
      e.preventDefault();
      var connection  = widget._getAuth0Connection();
      var email = widget._$('.a0-email input', form).val();
      var password = widget._$('.a0-password input', form).val();

      if (!valid(form, widget)) return;
      signup.submit(widget, connection.name, email, password);
    });

  if (is_small_screen()) {
    collapse_onfocus.hook(widget._$('.a0-signup form input'), widget._$('.a0-collapse-social-signup'));
  }

  return signup;
};

function valid(form, widget) {
  var ok = true;
  var email_input = widget._$('input[name=email]', form);
  var email = trim(email_input.val());
  var email_empty = empty.test(email);
  var email_parsed = email_parser.exec(email.toLowerCase());
  var password_input = widget._$('input[name=password]', form);
  var password = password_input.val();
  var password_empty = empty.test(password);

  // asume valid by default
  // and reset errors
  widget._showError();
  widget._focusError();

  if (email_empty) {
    widget._focusError(email_input);
    ok = false;
  }

  if (!email_parsed && !email_empty) {
    widget._focusError(email_input, widget._dict.t('invalid'));
    ok = false;
  }

  if (password_empty) {
    widget._focusError(password_input);
    ok = false;
  };

  return ok;
}
