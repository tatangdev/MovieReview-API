const chai = require('chai');
const chaiHttp = require('chai-http');
const bcrypt = require('bcryptjs');
const expected = chai.expect;

const app = require('../app');
const User = require('../models/user.schema');

chai.use(chaiHttp);

var testName = 'Reza Nirvana Pratama';
var testEmail = 'ezanirvana@gmail.com';
var testPassword = bcrypt.hashSync('12345', 10);
var token;
var verifyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTViY2QzZWI0NDg2YzVkNDg5NDQyMWEiLCJwcml2aWxlZ2UiOmZhbHNlLCJpYXQiOjE1ODMwNzQ5NDd9.aJSKI_O0fViMk5Btz2BrWLqDsuo1UzahgJ4gJ-vau_E';

describe('USER', () => {
    before(done => {
        User.deleteMany({}, err => {
            done()
        })
    });
    it('should create new user', done => {
        chai.request(app)
            .post('/api/user/register')
            .send({
                name: testName,
                email: testEmail,
                password: testPassword,
                password_confirmation: testPassword
            })
            .end((err, res) => {
                token = res.body.data.token
                expected(res.status).eql(201)
                done()
            })
    });
    it('activate user', done => {
        chai.request(app)
            .get(`/api/user/activation/${token}`)
            .end((err, res) => {
                expected(res.status).eql(201)
                done();
            })
    })
    it('should not create new user', done => {
        chai.request(app)
            .post('/api/user/register')
            .send({
                name: testName,
                email: testEmail,
                password: testPassword,
                password_confirmation: testPassword
            })
            .end((err, res) => {
                expected(res.status).eql(422)
                done()
            })
    });
    it('should login user', done => {
        chai.request(app)
            .post('/api/user/login')
            .send({
                email: testEmail,
                password: testPassword,
            })
            .end((err, res) => {
                token = res.body.data.token
                expected(res.status).eql(200)
                done()
            })
    });
    it('should not success login with not existing user', done => {
        chai
            .request(app)
            .post('/api/user/login')
            .send({
                email: 'testEmail',
                password: 'errorPassword'
            })
            .end(function (err, res) {
                expected(res.status).eq(403)
                done()
            })
    });
    it('forgot password 2', done => {
        chai.request(app)
            .post('/api/user/forgotPassword')
            .send({
                email: testEmail
            })
            .end((err, res) => {
                token = res.body.data;
                expected(res.status).eql(200)
                done()
            })
    });
    it('reset password', done => {
        chai.request(app)
        .put(`/api/user/resetPassword/${token}`)
        .send({
            password: 'newpassword',
            password_confirmation: 'newpassword'
        })
        .end((err, res) => {
            token = res.body.data.token;
            password = res.body.password;
            expected(res.status).eql(201)
            done();
        })
    })
    it('edit profile', done => {
        chai.request(app)
        .put('/api/user/updateProfile')
        .set('Authorization', verifyToken)
        .send({
            name: 'new name'
        })
        .end((err, res) => {
            console.log(res.status)
            expected(res.status).eql(422)
            done();
        })
    })
    // it('user profile', done => {
    //     chai.request(app)
    //     .put('/api/user/editProfile')
    //     .set('Authorization', ve)
    // })
})