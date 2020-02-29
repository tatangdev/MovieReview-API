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
var errorPassword = '12344';
var token;
var verifyToken;

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
//     it('should not success login with existed user', function () {
//         chai
//             .request(app)
//             .post('/api/user/login')
//             .send({
//                 email: testEmail,
//                 password: errorPassword
//             })
//             .end(function (err, res) {
//                 expected(res.status).eq(422)
//             })
//     });
//     it('forgot password', function () {
//         chai
//             .request(app)
//             .post('/api/user/forgotPassword')
//             .end(function (err, res) {
//                 expected(res.status).eq(200)
//             })
//     })
})