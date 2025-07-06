const { getLanguageById, submitBatch, submitToken } = require('../utils/problemUtility');
const Problem = require('../models/problem');
const User = require('../models/user');
const Submission = require('../models/submission');

const createProblem = async (req, res) => {

    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution, problemCreator } = req.body;


    try {

        for (const { language, completeCode } of referenceSolution) {

            const languageId = getLanguageById(language);

            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output

            }));

            const submitResult = await submitBatch(submissions);


            const resultToken = submitResult.map((value) => value.token);

            const testresult = await submitToken(resultToken);

            for (test of testresult) {
                if (test.status_id != 3) {
                    res.status(400).send("Error Occured");
                }
            }
        }

        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        });

        res.status(201).send("Problem Saved Successfully");
    }

    catch (err) {
        res.status(400).send("Error :" + err)
    }
}

const updateProblem = async (req, res) => {

    const { id } = req.params;
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution, problemCreator } = req.body;

    try {

        if (!id) {
            return res.status(400).send("Id field is Missing");
        }

        const DsaProblem = await Problem.findById(id);

        if (!DsaProblem) {
            return res.status(404).send("Id doesn't exist");
        }

        for (const { language, completeCode } of referenceSolution) {

            const languageId = getLanguageById(language);

            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output

            }));

            const submitResult = await submitBatch(submissions);


            const resultToken = submitResult.map((value) => value.token);

            const testresult = await submitToken(resultToken);

            for (test of testresult) {
                if (test.status_id != 3) {
                    res.status(400).send("Error Occured");
                }
            }
        }

        const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });
        res.status(201).send(newProblem);

    } catch (err) {
        res.status(500).send("Error :" + err);
    }
}

const deleteProblem = async (req, res) => {

    const { id } = req.params;

    try {

        if (!id) {
            return res.status(400).send("Id field is Missing");
        }

        const deletedProblem = await Problem.findByIdAndDelete(id);

        if (!deleteProblem) {
            res.status(404).send("Problem is Missing");
        }

        res.status(200).send("Successfully Deleted");

    } catch (err) {
        res.status(500).send("Error :" + err);
    }


}

const getProblemById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).send("Id field is Missing");
        }

        const getProblem = await Problem.findById(id).select('title description difficulty tags visibleTestCases startCode ');

        if (!getProblem) {
            res.send(404).send("Problem is Missing");
        }

        res.status(200).send(getProblem);
    } catch (err) {
        res.status(500).send("Error :" + err);
    }
}

const getAllProblem = async (req, res) => {

    try {
        const allProblem = await Problem.find({}).select('title difficulty tags _id');
        if (allProblem.length == 0) {
            res.send(404).send("Problems is Missing");
        }

        res.status(200).send(allProblem);
    } catch (err) {
        res.status(500).send("Error :" + err);
    }
}

const solvedAllProblembyUser = async (req, res) => {
    try {
        const userId = req.result._id;
        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "_id title difficulty tags"
        })

        res.status(200).send(user.problemSolved);

    } catch (err) {
        res.status(500).send("Server Error" + err);
    }
}

const submittedProblem = async (req, res) => {
    try {
        const userId=req.result._id;
        const problemId=req.params.pid;

        const ans=await Submission.find({userId,problemId});

        if(ans.length==0)
            res.status(200).send("No Submission is present");

        res.status(200).send(ans);
    } catch (err) {
        res.status(500).send("Internal Server Error: "+err);
    }
}

module.exports = { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedAllProblembyUser, submittedProblem };