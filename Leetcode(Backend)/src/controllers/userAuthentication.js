const User = require('../models/user');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const Submission = require('../models/submission');

const register = async (req, res) => {

    try {
        validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);

        const user = await User.create(req.body);

        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 })

        const response = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id
        }
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 })
        res.status(201).json({
            user: response,
            message: "Registered Successfully"
        })
    }
    catch (err) {
        res.status(400).send("Erro: " + err);
    }

}

const login = async (req, res) => {

    try {
        const { emailId, password } = req.body;

        if (!emailId)
            throw new Error("Invalid Credentials");

        if (!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({ emailId });

        const response = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match)
            throw new Error("Invalid Credentials");

        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 })
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 })
        res.status(201).json({
            user: response,
            message: "Logged In Successfully"
        })
    }
    catch (err) {
        res.status(401).send("Error :" + err);
    }

}

const logout = async (req, res) => {
    try {
        const { token } = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`, "Blocked")
        await redisClient.expireAt(`token:${token}`, payload.exp);

        res.cookie("token", null, { expires: new Date(Date.now()) });
        res.send("logged out Successfully");
    }
    catch (err) {
        res.status(503).send("Error :" + err);
    }
}
const adminRegister = async (req, res) => {
    try {
        validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = "admin"

        const user = await User.create(req.body);
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: "admin" }, process.env.JWT_KEY, { expiresIn: 60 * 60 })
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 })
        res.status(201).send("User Registered Successfully");
    }
    catch (err) {
        res.status(400).send("Erro: " + err);
    }
}

const deleteProfile = async (req, res) => {
    try {
        const userId = req.result._id;
        await User.findByIdAndDelete(userId);

        // await Submission.deleteMany({userId});

        res.status(200).send("Deleted Successfully");
    } catch (err) {
        res.status(500).send("internal Server Error");
    }
}

const check = async (req, res) => {
    const reply = {
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id: req.result._id
    }

    res.status(200).json({
        user: reply,
        message: "Valid User"
    });
}

module.exports = { register, login, logout, adminRegister, deleteProfile, check }