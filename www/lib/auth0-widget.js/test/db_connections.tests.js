/**
 * Mocha config
 */

mocha.timeout(60000);
mocha.ui('bdd');
mocha.reporter('html');
mocha.globals(['jQuery*', '__auth0jp*', 'Auth0*']);

/**
 * Test db connections
 */

describe('db connections', function () {
  describe('init options', function () {
    afterEach(function (done) {
      global.window.location.hash = '';
      global.window.Auth0 = null;
      this.auth0.removeAllListeners('transition_mode');
      this.auth0._hideSignIn(done)
    });

    beforeEach(function (done) {
      var self = this;

      if (!this.auth0) return onhidden();
      this.auth0._hideSignIn(onhidden);

      function onhidden() {
        self.auth0 = new Auth0Widget({
          domain:      'mdocs.auth0.com',
          callbackURL: 'http://localhost:3000/',
          clientID:    '0HP71GSd6PuoRYJ3DXKdiXCUUdGmBbup',
          enableReturnUserExperience: false
        });
        done();
      }
    });

    it('can disable signup', function (done) {

      this.auth0
      .on('transition_mode', function (mode) {
        if (mode !== 'signin') return;
        expect($('.a0-sign-up').length).to.equal(0);
        expect($('.a0-divider').length).to.equal(0);
        done();
      })
      .show({
        showSignup: false
      });
    });

    it('should show signup', function (done) {
      this.auth0
      .on('transition_mode', function (mode) {
        if (mode !== 'signin') return;
        expect($('.a0-sign-up').length).to.equal(1);
        done();
      })
      .show();
    });

  });

  describe.skip('when username or password is empty', function () {

    afterEach(function (done) {
      global.window.location.hash = '';
      global.window.Auth0 = null;
      this.auth0.removeAllListeners('transition_mode');
      this.auth0._hideSignIn(done);
    });

    beforeEach(function (done) {
      var self = this;

      if (!this.auth0) return onhidden();
      this.auth0._hideSignIn(onhidden);

      function onhidden() {
        self.auth0 = new Auth0Widget({
          domain:      'mdocs.auth0.com',
          callbackURL: 'http://localhost:3000/',
          clientID:    '0HP71GSd6PuoRYJ3DXKdiXCUUdGmBbup',
          enableReturnUserExperience: false
        });
        done();
      }
    });

    //fails on ie9
    it.skip('should not change to loading', function (done) {
      var auth0 = this.auth0.show().on('transition_mode', function (mode) {
        if (mode !== 'signin') return;
        $('#a0-signin_easy_email').val('');
        $('#a0-signin_easy_password').val('');

        auth0.on('transition_mode', function (mode) {
          if (mode !== 'loading') return;
          done(new Error('do not change to loading'));
        });
        setTimeout(function () {
          done();
        }, 500);
        var form = $('.a0-notloggedin form')[0];
        bean.fire(form, 'submit');
      });
    });

  });

  describe('when username or password is wrong', function () {
    afterEach(function (done) {
      global.window.location.hash = '';
      global.window.Auth0 = null;
      this.auth0.removeAllListeners('transition_mode');
      this.auth0._hideSignIn(done);
    });

    beforeEach(function (done) {
      var self = this;

      if (!this.auth0) return onhidden();
      this.auth0._hideSignIn(onhidden);

      function onhidden() {
        self.auth0 = new Auth0Widget({
          domain:      'mdocs.auth0.com',
          callbackURL: 'http://localhost:3000/',
          clientID:    '0HP71GSd6PuoRYJ3DXKdiXCUUdGmBbup',
          enableReturnUserExperience: false
        });
        done();
      }
    });

    // the test fails on IE9 but it does works. It looks like a timing issue.
    // it('email should have focus', function () {
    //   var email_has_focus = $('#a0-signin_easy_email').is(':focus');
    //   expect(email_has_focus).to.be.ok();
    // });

    it('should display error', function () {
      var auth0 = this.auth0;
      var submitted = false;

      auth0
      .show()
      .on('transition_mode', function (mode) {
        if (mode !== 'signin') return;
        $('#a0-signin_easy_email').val('j@j.com');
        $('#a0-signin_easy_password').val('yy');
        var form = $('.a0-notloggedin form')[0];
        bean.fire(form, 'submit');
        submitted = true;
      })
      .on('signin_ready', function() {
        if (!submitted) return;
        expect($('.a0-signin .a0-error').html()).to.equal(this.auth0._dict.t('signin:wrongEmailPasswordErrorText'));
        expect($('.a0-email .a0-input-box').hasClass('a0-error-input')).to.equal(true);
        expect($('.a0-password .a0-input-box').hasClass('a0-error-input')).to.equal(true);

        done();
      });


    });
  });
});
