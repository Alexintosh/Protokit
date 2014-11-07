/**
 * Mocha config
 */

mocha.timeout(60000);
mocha.ui('bdd');
mocha.reporter('html');
mocha.globals(['jQuery*', '__auth0jp*', 'Auth0*']);

/**
 * Test reset
 */

describe('reset', function (done) {
  afterEach(function () {
    global.window.location.hash = '';
    global.window.Auth0 = null;
    this.auth0._hideSignIn(done);
  });

  beforeEach(function (done) {
    var self = this;
    if (!this.auth0) return onhidden();

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

  it('should show the loading pane', function (done) {
    var auth0 = this.auth0.show().once('signin_ready', function () {
      bean.fire($('#a0-widget .a0-forgot-pass')[0], 'click');
    }).once('reset_ready', function () {
      $('#a0-reset_easy_email').val('ohmy@mandatory.com');
      $('#a0-reset_easy_password').val('123');
      $('#a0-reset_easy_repeat_password').val('123');

      auth0.once('loading_ready', function () {
        expect($('#a0-widget h1').html()).to.be(auth0._dict.t('reset:title'));
        done();
      });

      bean.fire($('.a0-reset form')[0], 'submit');
    });
  });

});
