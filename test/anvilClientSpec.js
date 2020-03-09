var AccessToken, AnvilConnect, IDToken, chai, cwd, expect, nock, path, sinon, sinonChai

cwd = process.cwd()
path = require('path')
chai = require('chai')
sinon = require('sinon')
sinonChai = require('sinon-chai')
expect = chai.expect
nock = require('nock')

chai.use(sinonChai)
chai.should()

AnvilConnect = require(path.join(cwd, 'index'))
AccessToken = require(path.join(cwd, 'lib', 'AccessToken'))
IDToken = require(path.join(cwd, 'lib', 'IDToken'))

describe('Anvil Connect Client', function () {
  // {anvil,promise,success,failure} = {}
  var anvil = {}
  var failure = {}
  var promise = {}
  var success = {}
  var config = {
    issuer: 'https://connect.anvil.io',
    client_id: 'uuid',
    client_secret: 'secret',
    redirect_uri: 'https://app.example.com/callback'
  }
  var openid = {
    issuer: 'https://connect.anvil.io',
    authorization_endpoint: 'https://connect.anvil.io/authorize',
    token_endpoint: 'https://connect.anvil.io/token',
    userinfo_endpoint: 'https://connect.anvil.io/userinfo',
    jwks_uri: 'https://connect.anvil.io/jwks',
    registration_endpoint: 'https://connect.anvil.io/register',
    scopes_supported: ['realm', 'client', 'profile', 'openid'],
    response_types_supported: ['code', 'token id_token'],
    response_modes_supported: [],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    acr_values_supported: [],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    id_token_encryption_alg_values_supported: [],
    id_token_encryption_enc_values_supported: [],
    userinfo_signing_alg_values_supported: ['none'],
    userinfo_encryption_alg_values_supported: [],
    userinfo_encryption_enc_values_supported: [],
    request_object_signing_alg_values_supported: [],
    request_object_encryption_alg_values_supported: [],
    request_object_encryption_enc_values_supported: [],
    token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
    token_endpoint_auth_signing_alg_values_supported: [],
    display_values_supported: [],
    claim_types_supported: ['normal'],
    claims_supported: ['iss', 'sub', 'aud', 'acr', 'name', 'given_name', 'family_name', 'middle_name', 'nickname', 'preferred_username', 'profile', 'picture', 'website', 'email', 'email_verified', 'zoneinfo', 'locale', 'joined_at', 'updated_at'],
    service_documentation: 'https://anvil.io/docs/connect/',
    claims_locales_supported: [],
    ui_locales_supported: [],
    check_session_iframe: 'https://connect.anvil.io/session',
    end_session_endpoint: 'https://connect.anvil.io/signout'
  }
  var jwks = {
    keys: [
      {
        kty: 'RSA',
        use: 'sig',
        alg: 'RS256',
        n: 'zRchTwN0Ok6suWzaWYsbfZ81qdGVZM_LCqR6dhtlHaYAPpyVKefY3U5ByhbvDgbCm3BQ9OLu1E4OEJFkJVYvapxsyosrnSyY7qjLxHGKC-16AQNhX8qssTZVQCzdnKk67RUyKraM87zPkWNU6Qlw539-O9-g54YICKZV7ESfvA4nVvHQTJr8mem6S0GrRHxma8gEecogAvQCw5c2Hb500lW8eGqQ8qFjiBPQVScf4PZul4UO01KFB-cKiK575bFpxLSgfFBIGvqbjRgxLGkJnYq6IhtRfPQ0LAcM8rjYIINcFtLv9P647JcjrwNrxjP-yG_C84UddJl9L5kdA4_8JHom1sfaR7izF2B2mBFrGNODYDj8LctmWi4FaXBAIKa8XNW9lGv6Olc6G9AHpjzcQOY_lwAYWmULsotRRWfuV7wr49CyMSnthcd2smoA7ABed7qfd4FDCIft4SpONu7Mfba-pf8-0yYbXUcCdQzgaFr4P7MzMre4tcMhmWa89tMDP-XklptjgBmmK7RNdqk_g_Ol2KSXb233bIVd3tL8VgO1_vxwrvSZr_k9169GlsB3Ud50ulG_b6MOQxbpKZb1WEP_ajaZ8RnQOAFvfBKxBBxxT6y0maNtRGtpunYWmkxBPs-eJKZrYpVGLSX0ZwPOoPpQDInOuPcAuCp2Y3sEXK8',
        e: 'AQAB'
      }, {
        kty: 'RSA',
        use: 'enc',
        alg: 'RS256',
        n: 'xoAIJ40-f5lr07WswyF6XryOtEJSpNYY_RFmMdKWMLoZnZ4dTl9LlBFyXYNunbkKQHXmhTTr_C6FWjUA6JZwCkymtgD5Be8Mz8N8K0RB6nokLzXzUilYrY8m_0G1yLAGAeAv0evGXMJN5GLuHzInB9zPzySr7xsCUB0L5DuEv6WJ4abNw5ylnLKLW9nvGfZDXwJ4YVJOaVre3S8CjvXu1fuTmzBW3VSD9Zttd_NB6uiS0QsvFBifHx-S1PZ_LZNGC52Z3-rs9kMzzneBiBJrhULFsyGF5OQBGBDQD5Ghl_O86DyCXKOGrIDso2l7ZY5vlicL9QD7jeBJnIF9sDnZDugoVneT2yHMBqiDKlFHKjGSE_mKhnD1K-QMolOwbADNytMeu5BDgFYdAkx9hyo1L2f8f4eB7_8XUSCnnQoIR9tb5ie9bSpd4Uel881N97WLVe9hyUVY0YSU3MKHaoNrPYVbGYjRsQrK14-NaZ3bC4Grrwd8eGGFaQeT_a4dIFfBfHtl_wH-DGZIqlTLX9fxfeNu93I4zPky1TlQaTwFiRo-9FXF6I6r2s2WaZKLnFWKdS2c0VrHJQebrkAN0VQNhp9-7jBRQqJmTiNVSg7J5wd7mgCMXIOfktOBHoNiulMRd9rYN21qRxt0xOwFujNZ8mlx2M96gBdhDVq020zJdB0',
        e: 'AQAB'
      }
    ]
  }
  var registration = {
    client_name: 'TEST CLIENT',
    redirect_uris: ['http://app.example.com/callback']
  }
  var registrationResponse = {
    client_id: 'a011bbd4-6171-4d84-ba1a-7db73fd64056',
    client_secret: 'cd38a23c7a53045cbb64',
    client_name: registration.client_name,
    token_endpoint_auth_method: 'client_secret_basic',
    application_type: 'web',
    redirect_uris: registration.redirect_uris,
    client_id_issued_at: 1441564333989
  }
  var userinfo = {
    given_name: 'FAKE',
    family_name: 'USER'
  }
  describe('constructor', function () {
    before(function () {
      anvil = new AnvilConnect(config)
    })
    it('should set the issuer', function () {
      return anvil.issuer.should.equal(config.issuer)
    })
    it('should set the client id', function () {
      return anvil.client_id.should.equal(config.client_id)
    })
    it('should set the client secret', function () {
      return anvil.client_secret.should.equal(config.client_secret)
    })
    it('should set the redirect uri', function () {
      anvil.redirect_uri = config.redirect_uri
      return anvil.redirect_uri
    })
    it('should set default scope', function () {
      return anvil.scope.should.equal('openid profile')
    })
    it('should not duplicate scope', function () {
      anvil = new AnvilConnect({
        scope: 'openid profile'
      })
      return anvil.scope.should.equal('openid profile')
    })
    it('should set scope from an array', function () {
      anvil = new AnvilConnect({
        scope: ['realm']
      })
      return anvil.scope.should.contain('realm')
    })
    it('should default to no post_logout_redirect_uris', function () {
      anvil = new AnvilConnect()
      anvil.registeredPostLogoutUris().length.should.equal(0)
    })
    it('should set scope from a string', function () {
      anvil = new AnvilConnect({
        scope: 'realm extra'
      })
      anvil.scope.should.contain('realm')
      return anvil.scope.should.contain('extra')
    })
  })
  describe('addScope', function () {
    it('should add scope with no duplication', function () {
      var client = new AnvilConnect()
      client.addScope(['openid', 'profile'])
      client.addScope(['openid', 'profile'])
      client.scope.should.equal('openid profile')
    })
  })
  describe('discover', function () {
    describe('with a successful response', function () {
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        nock(anvil.issuer).get('/.well-known/openid-configuration').reply(200, openid)
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.discover().then(success).catch(failure)
        return promise
      })
      after(function () {
        return nock.cleanAll()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should provide the openid configuration', function () {
        return success.should.have.been.calledWith(sinon.match({
          issuer: anvil.issuer
        }))
      })
      it('should set configuration', function () {
        return anvil.configuration.should.eql(openid)
      })
      return it('should not catch an error', function () {
        return failure.should.not.have.been.called
      })
    })
    describe('with a failure response', function () {
      beforeEach(function () {
        // var data = {
        //   issuer: anvil.issuer
        // }
        anvil = new AnvilConnect(config)
        nock(anvil.issuer)
          .get('/.well-known/openid-configuration')
          .reply(404, 'Not found')
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.discover().then(success).catch(failure)
        return promise
      })
      after(function () {
        return nock.cleanAll()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should not provide the openid configuration', function () {
        return success.should.not.have.been.called
      })
      it('should not set configuration', function () {
        return expect(anvil.configuration).to.be.undefined
      })
      return it('should not catch an error', function () {
        return failure.should.have.been.called
      })
    })
    return describe('with an invalid response', function () {
      beforeEach(function () {
        // var data = {
        //   issuer: anvil.issuer
        // }
        anvil = new AnvilConnect(config)
        nock(anvil.issuer).get('/.well-known/openid-configuration').reply(200, 'This isn\'t JSON!')
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.discover().then(success).catch(failure)
        return promise
      })
      after(function () {
        return nock.cleanAll()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should not provide the openid configuration', function () {
        return success.should.not.have.been.called
      })
      it('should not set configuration', function () {
        return expect(anvil.configuration).to.be.undefined
      })
      return it('should not catch an error', function () {
        return failure.should.have.been.called
      })
    })
  })
  describe('jwks', function () {
    describe('with a successful response', function () {
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        nock(anvil.issuer).get('/jwks').reply(200, jwks)
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.getJWKs().then(success).catch(failure)
        return promise
      })
      after(function () {
        return nock.cleanAll()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should provide the JWK set', function () {
        return success.should.have.been.calledWith(sinon.match(jwks))
      })
      it('should set jwks', function () {
        return anvil.jwks.keys.should.eql(jwks.keys)
      })
      it('should set signature jwk', function () {
        return anvil.jwks.sig.should.eql(jwks.keys[0])
      })
      return it('should not catch an error', function () {
        return failure.should.not.have.been.called
      })
    })
    return describe('with a failure response', function () {
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        nock(anvil.issuer).get('/jwks').reply(404, 'Not found')
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.getJWKs().then(success).catch(failure)
        return promise
      })
      after(function () {
        return nock.cleanAll()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should not provide the JWK set', function () {
        return success.should.not.have.been.called
      })
      it('should not set jwks', function () {
        return expect(anvil.jwks).to.be.undefined
      })
      return it('should catch an error', function () {
        return failure.should.have.been.called
      })
    })
  })
  describe('register', function () {
    describe('with a successful response', function () {
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        nock(anvil.issuer).post('/register', registration).reply(201, registrationResponse)
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.register(registration).then(success).catch(failure)
        return promise
      })
      after(function () {
        return nock.cleanAll()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should provide the registration response', function () {
        return success.should.have.been.calledWith(sinon.match(registrationResponse))
      })
      return it('should not catch an error', function () {
        return failure.should.not.have.been.called
      })
    })
    return describe('with a failure response', function () {
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        nock(anvil.issuer).post('/register', registration).reply(400, {
          error: 'whatever'
        })
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.register(registration).then(success).catch(failure)
        return promise
      })
      after(function () {
        return nock.cleanAll()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should not provide the registration response', function () {
        return success.should.have.not.been.called
      })
      return it('should catch an error', function () {
        return failure.should.have.been.called
      })
    })
  })
  describe('authorizationUri', function () {
    beforeEach(function () {
      anvil = new AnvilConnect(config)
      anvil.configuration = openid
    })
    describe('with no endpoint in the argument', function () {
      return it('should use the "authorize" endpoint', function () {
        return anvil.authorizationUri().should.contain('/authorize?')
      })
    })
    describe('with a string argument', function () {
      return it('should use the argument as the endpoint', function () {
        return anvil.authorizationUri('signin').should.contain('/signin?')
      })
    })
    return describe('with an options argument', function () {
      it('should set the optional endpoint', function () {
        var uri
        uri = anvil.authorizationUri({
          endpoint: 'connect/google'
        })
        return uri.should.contain('/connect/google?')
      })
      it('should set default authorization params', function () {
        var uri
        uri = anvil.authorizationUri({
          endpoint: 'connect/google'
        })
        uri.should.contain('response_type=code')
        uri.should.contain('client_id=' + config.client_id)
        uri.should.contain('redirect_uri=' + (encodeURIComponent(config.redirect_uri)))
        return uri.should.contain('scope=' + anvil.scope.split(' ').join('+'))
      })
      return it('should set optional authorization params', function () {
        var uri
        uri = anvil.authorizationUri({
          endpoint: 'signin',
          provider: 'password',
          max_age: 2600
        })
        uri.should.contain('provider=password')
        return uri.should.contain('max_age=2600')
      })
    })
  })
  describe('authorizationParams', function () {
    beforeEach(function () {
      anvil = new AnvilConnect(config)
      anvil.configuration = openid
    })
    it('should set default response type', function () {
      return anvil.authorizationParams().response_type.should.equal('code')
    })
    it('should set optional response type', function () {
      return anvil.authorizationParams({
        response_type: 'id_token token'
      }).response_type.should.equal('id_token token')
    })
    it('should set client id', function () {
      return anvil.authorizationParams().client_id.should.equal(config.client_id)
    })
    it('should set configured redirect uri', function () {
      return anvil.authorizationParams().redirect_uri.should.equal(config.redirect_uri)
    })
    it('should set optional redirect uri', function () {
      var uri
      uri = 'https://app.example.com/other'
      return anvil.authorizationParams({
        redirect_uri: uri
      }).redirect_uri.should.equal(uri)
    })
    it('should set configured scope', function () {
      return anvil.authorizationParams().scope.should.equal(anvil.scope)
    })
    it('should set optional scope', function () {
      return anvil.authorizationParams({
        scope: 'foo bar'
      }).scope.should.equal('foo bar')
    })
    it('should set optional parameters', function () {
      return anvil.authorizationParams({
        prompt: 'none'
      }).prompt.should.equal('none')
    })
    return it('should ignore unknown parameters', function () {
      var params
      params = anvil.authorizationParams({
        unknown: 'forgetme'
      })
      return expect(params.unknown).to.be.undefined
    })
  })
  describe('serialize', function () {
    it('should treat serialized-then-deserialized clients as equivalent',
      function () {
        var client = new AnvilConnect({
          issuer: 'https://oidc.example.com',
          client_id: 'uuid',
          client_secret: 'secret',
          redirect_uri: 'https://app.example.com/callback'
        })
        var serializedClient = client.serialize()
        expect(serializedClient).to.be.a('string')
        // Now deserialize and compare to the original client
        var clientOptions = JSON.parse(serializedClient)
        var newClient = new AnvilConnect(clientOptions)
        JSON.stringify(newClient).should.equal(JSON.stringify(client))
      })
  })
  describe('refresh', function () {
    describe('with missing options argument', function () {
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.refresh().then(success).catch(failure)
        return promise
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should not provide the tokens', function () {
        return success.should.not.have.been.called
      })
      return it('should catch an error', function () {
        return failure.should.have.been.calledWith(sinon.match({
          message: 'Missing refresh_token'
        }))
      })
    })
    describe('with error response', function () {
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        nock(anvil.issuer).post('/token', {
          grant_type: 'refresh_token',
          refresh_token: 'random'
        }).basicAuth({
          user: config.client_id,
          pass: config.client_secret
        }).reply(400, {
          error: 'invalid_request'
        })
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.refresh({
          refresh_token: 'random'
        }).then(success).catch(failure)
        return promise
      })
      after(function () {
        return nock.cleanAll()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should not provide the tokens', function () {
        return success.should.not.have.been.called
      })
      return it('should catch an error', function () {
        return failure.should.have.been.called
      })
    })
    describe('with token response and signature ko', function () {
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        anvil.jwks = jwks
        anvil.tokens = {
          access_token: 'jwt1',
          id_token: 'jwt2'
        }
        nock(anvil.issuer).post('/token', {
          grant_type: 'refresh_token',
          refresh_token: 'fake_refresh_token'
        }).basicAuth({
          user: config.client_id,
          pass: config.client_secret
        }).reply(200, anvil.tokens)
        sinon.stub(AccessToken, 'refresh').callsArgWith(2, null, anvil.tokens)
        sinon.stub(AccessToken, 'verify').callsArgWith(2, new Error(), null)
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.refresh({
          refresh_token: 'fake_refresh_token'
        }).then(success).catch(failure)
        return promise
      })
      after(function () {
        return nock.cleanAll()
      })
      afterEach(function () {
        AccessToken.refresh.restore()
        return AccessToken.verify.restore()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should not provide the tokens', function () {
        return success.should.not.have.been.called
      })
      it('should catch an error', function () {
        return failure.should.have.been.called
      })
      it('should AccessToken.refresh called once', function () {
        return AccessToken.refresh.should.have.been.calledOnce
      })
      return it('should AccessToken.verify called once', function () {
        return AccessToken.verify.should.have.been.calledOnce
      })
    })
    return describe('with token response and signature ok', function () {
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        anvil.jwks = jwks
        anvil.jwks.keys[0] = jwks.keys[0]
        anvil.tokens = {
          access_token: 'jwt1',
          id_token: 'jwt2'
        }
        nock(anvil.issuer).post('/token', {
          grant_type: 'refresh_token',
          refresh_token: 'fake_refresh_token'
        }).basicAuth({
          user: config.client_id,
          pass: config.client_secret
        }).reply(200, anvil.tokens)
        sinon.stub(AccessToken, 'refresh').callsArgWith(2, null, anvil.tokens)
        sinon.stub(AccessToken, 'verify').callsArgWith(2, null, anvil.tokens)
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.refresh({
          refresh_token: 'fake_refresh_token'
        }).then(success).catch(failure)
        return promise
      })
      after(function () {
        return nock.cleanAll()
      })
      afterEach(function () {
        AccessToken.refresh.restore()
        return AccessToken.verify.restore()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should provide the tokens', function () {
        return success.should.have.been.called
      })
      it('should not catch an error', function () {
        return failure.should.not.have.been.called
      })
      it('should AccessToken.refresh called once', function () {
        return AccessToken.refresh.should.have.been.calledOnce
      })
      it('should AccessToken.verify called once', function () {
        return AccessToken.verify.should.have.been.calledOnce
      })
      return it('should provide the tokens', function () {
        return success.should.have.been.calledWith(sinon.match(anvil.tokens))
      })
    })
  })
  describe('token', function () {
    describe('with missing options argument', function () {
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.token().then(success).catch(failure)
        return promise
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should not provide the tokens', function () {
        return success.should.not.have.been.called
      })
      return it('should catch an error', function () {
        return failure.should.have.been.calledWith(sinon.match({
          message: 'Missing authorization code'
        }))
      })
    })
    describe('with missing authorization code', function () {
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.token({}).then(success).catch(failure)
        return promise
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should not provide the tokens', function () {
        return success.should.not.have.been.called
      })
      return it('should catch an error', function () {
        return failure.should.have.been.calledWith(sinon.match({
          message: 'Missing authorization code'
        }))
      })
    })
    describe('with error response', function () {
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        anvil.tokens = {
          access_token: 'jwt1',
          id_token: 'jwt2'
        }
        nock(anvil.issuer).post('/token', {
          grant_type: 'authorization_code',
          code: 'random',
          redirect_uri: config.redirect_uri
        }).basicAuth({
          user: config.client_id,
          pass: config.client_secret
        }).reply(400, {
          error: 'invalid_request'
        })
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.token({
          code: 'random'
        }).then(success).catch(failure)
        return promise
      })
      after(function () {
        return nock.cleanAll()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should not provide the tokens', function () {
        return success.should.not.have.been.called
      })
      return it('should catch an error', function () {
        return failure.should.have.been.called
      })
    })
    describe('with unverifiable id token', function () {
      var tokens
      tokens = {}.tokens
      before(function () {
        // var claims = {
        //   sub: 'uuid'
        // }
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        anvil.jwks = jwks
        anvil.jwks.sig = jwks.keys[0]
        tokens = {
          id_token: 'invalid.id.token',
          access_token: 'valid.access.token'
        }
        nock(anvil.issuer).post('/token', {
          grant_type: 'authorization_code',
          code: 'random',
          redirect_uri: config.redirect_uri
        }).basicAuth({
          user: config.client_id,
          pass: config.client_secret
        }).reply(200, tokens)
        sinon.stub(IDToken, 'verify').callsArgWith(2, new Error())
        sinon.stub(AccessToken, 'verify').callsArgWith(2, null, {})
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.token({
          code: 'random'
        }).then(success).catch(failure)
        return promise
      })
      after(function () {
        IDToken.verify.restore()
        AccessToken.verify.restore()
        return nock.cleanAll()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should verify the id token', function () {
        return IDToken.verify.should.have.been.calledWith(tokens.id_token)
      })
      it('should verify the access token', function () {
        return AccessToken.verify.should.have.been.calledWith(tokens.access_token)
      })
      it('should not provide the id claims', function () {
        return success.should.not.have.been.called
      })
      return it('should not catch an error', function () {
        return failure.should.have.been.called
      })
    })
    describe('with unverifiable access token', function () {
      var tokens
      tokens = {}.tokens
      before(function () {
        // var claims = {
        //   sub: 'uuid'
        // }
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        anvil.jwks = jwks
        anvil.jwks.sig = jwks.keys[0]
        tokens = {
          id_token: 'valid.id.token',
          access_token: 'invalid.access.token'
        }
        nock(anvil.issuer).post('/token', {
          grant_type: 'authorization_code',
          code: 'random',
          redirect_uri: config.redirect_uri
        }).basicAuth({
          user: config.client_id,
          pass: config.client_secret
        }).reply(200, tokens)
        sinon.stub(AccessToken, 'verify').callsArgWith(2, new Error())
        sinon.stub(IDToken, 'verify').callsArgWith(2, null, {})
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.token({
          code: 'random'
        }).then(success).catch(failure)
        return promise
      })
      after(function () {
        AccessToken.verify.restore()
        IDToken.verify.restore()
        return nock.cleanAll()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should verify the id token', function () {
        return IDToken.verify.should.have.been.calledWith(tokens.id_token)
      })
      it('should verify the access token', function () {
        return AccessToken.verify.should.have.been.calledWith(tokens.access_token)
      })
      it('should not provide the id claims', function () {
        return success.should.not.have.been.called
      })
      return it('should not catch an error', function () {
        return failure.should.have.been.called
      })
    })
    describe('with valid token response', function () {
      var tokens
      tokens = {}.tokens
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        anvil.jwks = jwks
        anvil.jwks.sig = jwks.keys[0]
        tokens = {
          id_token: 'valid.id.token',
          access_token: 'valid.access.token'
        }
        nock(anvil.issuer).post('/token', {
          grant_type: 'authorization_code',
          code: 'random',
          redirect_uri: config.redirect_uri
        }).basicAuth({
          user: config.client_id,
          pass: config.client_secret
        }).reply(200, tokens)
        sinon.stub(AccessToken, 'verify').callsArgWith(2, null, {
          aud: config.client_id
        })
        sinon.stub(IDToken, 'verify').callsArgWith(2, null, {
          payload: {
            iss: config.issuer
          }
        })
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.token({
          code: 'random'
        }).then(success).catch(failure)
        return promise
      })
      afterEach(function () {
        AccessToken.verify.restore()
        IDToken.verify.restore()
        return nock.cleanAll()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should verify the id token', function () {
        return IDToken.verify.should.have.been.calledWith(tokens.id_token)
      })
      it('should verify the access token', function () {
        return AccessToken.verify.should.have.been.calledWith(tokens.access_token)
      })
      it('should provide the tokens', function () {
        return success.should.have.been.calledWith(sinon.match(tokens))
      })
      it('should provide the id claims', function () {
        return success.should.have.been.calledWith(sinon.match({
          id_claims: {
            iss: config.issuer
          }
        }))
      })
      it('should provide the access claims', function () {
        return success.should.have.been.calledWith(sinon.match({
          access_claims: {
            aud: config.client_id
          }
        }))
      })
      return it('should not catch an error', function () {
        return failure.should.not.have.been.called
      })
    })
    describe('with response uri', function () {
      var tokens
      tokens = {}.tokens
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        anvil.jwks = jwks
        anvil.jwks.sig = jwks.keys[0]
        tokens = {
          id_token: 'valid.id.token',
          access_token: 'valid.access.token'
        }
        nock(anvil.issuer).post('/token', {
          grant_type: 'authorization_code',
          code: 'random',
          redirect_uri: config.redirect_uri
        }).basicAuth({
          user: config.client_id,
          pass: config.client_secret
        }).reply(200, tokens)
        sinon.stub(AccessToken, 'verify').callsArgWith(2, null, {
          aud: config.client_id
        })
        sinon.stub(IDToken, 'verify').callsArgWith(2, null, {
          payload: {
            iss: config.issuer
          }
        })
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.token({
          responseUri: 'https://app.example.com/callback?code=random'
        }).then(success).catch(failure)
        return promise
      })
      afterEach(function () {
        AccessToken.verify.restore()
        IDToken.verify.restore()
        return nock.cleanAll()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should verify the id token', function () {
        return IDToken.verify.should.have.been.calledWith(tokens.id_token)
      })
      it('should verify the access token', function () {
        return AccessToken.verify.should.have.been.calledWith(tokens.access_token)
      })
      it('should provide the tokens', function () {
        return success.should.have.been.calledWith(sinon.match(tokens))
      })
      it('should provide the id claims', function () {
        return success.should.have.been.calledWith(sinon.match({
          id_claims: {
            iss: config.issuer
          }
        }))
      })
      it('should provide the access claims', function () {
        return success.should.have.been.calledWith(sinon.match({
          access_claims: {
            aud: config.client_id
          }
        }))
      })
      return it('should not catch an error', function () {
        return failure.should.not.have.been.called
      })
    })
    return describe('with client_credentials grant', function () {
      var tokens
      tokens = {}.tokens
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        anvil.jwks = jwks
        anvil.jwks.sig = jwks.keys[0]
        tokens = {
          access_token: 'valid.access.token'
        }
        nock(anvil.issuer).post('/token', {
          grant_type: 'client_credentials',
          scope: 'realm'
        }).basicAuth({
          user: config.client_id,
          pass: config.client_secret
        }).reply(200, tokens)
        sinon.stub(AccessToken, 'verify').callsArgWith(2, null, {
          aud: config.client_id
        })
        sinon.stub(IDToken, 'verify')
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.token({
          grant_type: 'client_credentials',
          scope: 'realm'
        }).then(data => {
          return success(data)
        }).catch(failure)
        return promise
      })
      afterEach(function () {
        AccessToken.verify.restore()
        IDToken.verify.restore()
        return nock.cleanAll()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should NOT receive an id token', function () {
        return IDToken.verify.should.not.have.been.called
      })
      it('should verify the access token', function () {
        return AccessToken.verify.should.have.been.calledWith(tokens.access_token)
      })
      it('should provide the tokens', function () {
        return success.should.have.been.calledWith(sinon.match(tokens))
      })
      it('should NOT provide the id claims', function () {
        return success.should.not.have.been.calledWith(sinon.match({
          id_claims: {
            iss: config.issuer
          }
        }))
      })
      it('should provide the access claims', function () {
        return success.should.have.been.calledWith(sinon.match({
          access_claims: {
            aud: config.client_id
          }
        }))
      })
      return it('should not catch an error', function () {
        return failure.should.not.have.been.called
      })
    })
  })
  describe('userInfo', function () {
    describe('with a missing access token', function () {
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.userInfo().then(success, failure)
        return promise
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should not provide userInfo', function () {
        return success.should.not.have.been.called
      })
      return it('should catch an error', function () {
        return failure.should.have.been.calledWith(sinon.match.instanceOf(Error))
      })
    })
    describe('with a successful response', function () {
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        nock(anvil.issuer).get('/userinfo').reply(200, userinfo)
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.userInfo({
          token: 'token'
        }).then(success).catch(failure)
        return promise
      })
      afterEach(function () {
        return nock.cleanAll()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should provide the userinfo', function () {
        return success.should.have.been.calledWith(sinon.match(userinfo))
      })
      return it('should not catch an error', function () {
        return failure.should.not.have.been.called
      })
    })
    return describe('with a failure response', function () {
      beforeEach(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        nock(anvil.issuer).get('/userinfo').reply(404, 'Not found')
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.userInfo({
          token: 'token'
        }).then(success).catch(failure)
        return promise
      })
      after(function () {
        return nock.cleanAll()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should not provide the userinfo', function () {
        return success.should.not.have.been.called
      })
      return it('should catch an error', function () {
        return failure.should.have.been.calledWith(sinon.match.instanceOf(Error))
      })
    })
  })
  return describe('verify', function () {
    var ref1 = {}
    var claims = ref1.claims
    var options = ref1.options
    describe('with defaults and invalid token', function () {
      before(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        anvil.jwks = jwks
        anvil.jwks.sig = jwks.keys[0]
        sinon.stub(AccessToken, 'verify').callsArgWith(2, new Error())
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.verify('invalid.access.token')
          .then(success).catch(failure)
        return promise
      })
      after(function () {
        return AccessToken.verify.restore()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should not provide the claims', function () {
        return success.should.have.not.been.called
      })
      return it('should catch an error', function () {
        return failure.should.have.been.called
      })
    })
    describe('with defaults and valid token', function () {
      before(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        anvil.jwks = jwks
        anvil.jwks.sig = jwks.keys[0]
        claims = {
          sub: 'uuid'
        }
        sinon.stub(AccessToken, 'verify').callsArgWith(2, null, claims)
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.verify('valid.access.token')
          .then(success).catch(failure)
        return promise
      })
      after(function () {
        return AccessToken.verify.restore()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should provide the claims', function () {
        return success.should.have.been.calledWith(sinon.match(claims))
      })
      return it('should not catch an error', function () {
        return failure.should.not.have.been.called
      })
    })
    describe('with options and invalid token', function () {
      before(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        anvil.jwks = jwks
        anvil.jwks.sig = jwks.keys[0]
        sinon.stub(AccessToken, 'verify').callsArgWith(2, new Error())
        options = {
          scope: 'realm'
        }
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.verify('invalid.access.token', options)
          .then(success).catch(failure)
        return promise
      })
      after(function () {
        return AccessToken.verify.restore()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should pass the options to verify', function () {
        return AccessToken.verify.should.have.been.calledWith(sinon.match.string, sinon.match(options))
      })
      it('should not provide the claims', function () {
        return success.should.have.not.been.called
      })
      return it('should catch an error', function () {
        return failure.should.have.been.called
      })
    })
    return describe('with options and valid token', function () {
      before(function () {
        anvil = new AnvilConnect(config)
        anvil.configuration = openid
        anvil.jwks = jwks
        anvil.jwks.sig = jwks.keys[0]
        claims = {
          sub: 'uuid'
        }
        sinon.stub(AccessToken, 'verify').callsArgWith(2, null, claims)
        options = {
          scope: 'realm'
        }
        success = sinon.spy()
        failure = sinon.spy()
        promise = anvil.verify('valid.access.token', options)
          .then(success).catch(failure)
        return promise
      })
      after(function () {
        return AccessToken.verify.restore()
      })
      it('should return a promise', function () {
        return promise.should.be.instanceof(Promise)
      })
      it('should pass the options to verify', function () {
        return AccessToken.verify.should.have.been.calledWith(sinon.match.string, sinon.match(options))
      })
      it('should provide the claims', function () {
        return success.should.have.been.calledWith(sinon.match(claims))
      })
      return it('should not catch an error', function () {
        return failure.should.not.have.been.called
      })
    })
  })
})
