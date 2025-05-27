import IVRModel from '../models/IVRModel.js';
import Registrant from '../../config/models/testRegistrants.js'
import NewTest from '../../config/models/tests.js'
import Subscriber from '../../config/models/subscribers.js'
import DownloadFile from '../util/downloadFile.js';
import dotenv from 'dotenv';
import Util from '../util/services.js';
dotenv.config();

class IVRController {
    constructor() {
    }

    static async addSubscribe(request, response) {

        try {
            const { userId } = request;
            const subscriber = request.body;

            if (!subscriber.code && !subscriber.phone1) {
                return response.status(400).json({ status: 1, message: "Error: code or phone1 is required" });
            }

            const checkValidateSubscriber = await Util.validateAddSubscriber(subscriber.code, subscriber.phone1, userId);
            if (!checkValidateSubscriber.result) {
                return response.status(400).json({ status: checkValidateSubscriber.status, message: checkValidateSubscriber.message });
            }

            if (subscriber.linkName) {
                const downloadFile = await DownloadFile.downloadFile(subscriber.linkName);
                if (!downloadFile) {
                    return response.status(400).json({ status: 2, message: "Error: canot save file" });
                }
                subscriber.linkName = "/" + downloadFile;
            }

            const subscribe = await IVRModel.addSubscribe(subscriber, userId);
            if (!subscribe) {
                return response.status(400).json({ status: 3, message: "'canot save new subscribe" });
            }
            subscribe.linkName = process.env.BASE_URL + subscribe.linkName;
            response.status(200).json({ status: 0, message: "ok", subscribe });
        } catch (error) {
            console.error(error);
            response.status(500).json({ status: 500, message: "internal server error" });
        }

    }


    static async getSubscriber(request, response) {

        const { userId } = request;
        const { phone, code } = request.query;

        if (!phone && !code) {
            return response.status(400).json({ status: 1, message: "Error: phone or code is required" });
        }

        try {
            const subscriber = await IVRModel.getSubscribers(phone, code, userId, false);
            if (!subscriber) {
                return response.status(400).json({ status: 2, message: "'no subscriber found on this phone or code" });
            }
            subscriber.linkName = process.env.BASE_URL + subscriber.linkName;

            response.status(200).json({ status: 0, message: "ok", subscriber});
        } catch (error) {
            console.error(error);
            response.status(500).json({ status: 500, message: "internal server error" });
        }

    }

     static async getSubscribers(request, response) {

        const { userId } = request;
        const { phone, code } = request.query;

        try {
            const subscribers = await IVRModel.getSubscribers(phone, code, userId, true);
            if (!subscribers.length <= 0) {
                return response.status(400).json({ status: 1, message: "'no subscriber found on this phone or code" });
            }
            subscribers.forEach(subscriber => {
                subscriber.linkName = process.env.BASE_URL + subscriber.linkName;
            })

            response.status(200).json({ status: 0, message: "ok", subscribers});
        } catch (error) {
            console.error(error);
            response.status(500).json({ status: 500, message: "internal server error" });
        }

    }

  


    // Get the count of questions for a specific test
    static async questionsCount(req, res) {
        try {
            const { role, userId } = req;

            const { testId } = req.query


            if (!testId) {
                return res.status(400).json({ status: 1, message: "Test ID is required" })
            }

            const test = await NewTest.findOne({ _id: testId, active: true, user_id: userId });

            if (!test) {
                return res.status(404).json({ status: 2, message: "Test not found" })
            }

            // Only count active questions
            const activeQuestions = test.questions.filter((q) => q.active !== false);

            // check is random question count
            if (test.settings.random) {
                if (activeQuestions.length > test.settings.limitRandom) {
                    return res.json({ count: test.settings.limitRandom })
                }
            }
            // if no random limit
            res.json({ status: 0, count: activeQuestions.length, settings: test.settings })
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: 500, message: "internal server error" });
        }
    }

    static async updateAnswerAndPoints(req, res) {

        const { role, userId } = req;

        try {
            const { testId, questionId, code, phone } = req.body
            let answerDigit = req.body.answerDigit;

            if (!code && !phone) {
                return res.status(400).json({ status: 1, error: "code or phone is required" });
            }

            const result = await formatSubscriberQuery(code, phone, testId, userId);
            if (!result.result) {
                return res.status(400).json({ status: result.status, error: result.message });
            }
            const { subscriberQuery, test } = result;
            const subscriber = await Subscriber.findOne(subscriberQuery);
            if (!subscriber) {
                return res.status(404).json({ status: 2, error: "לא נמצא נרשם למבחן" })
            }

            // check if subscriber allow this test
            if (test?.restrictedAccess) {
                if (!test?.allowedSubscribers.includes(subscriber._id)) {
                    return res.status(404).json({ status: 3, error: "איש הקשר לא מורשה להשתתף במבחן" })
                }
            }

            let registrant = await Registrant.findOne({ user_id: userId, testId, subscribeId: subscriber._id })


            if (!registrant) {
                return res.status(400).json({ status: 4, error: "נרשם לא נמצא" })
            }

            if (!questionId) {
                return res.status(400).json({ status: 5, error: "מזהה שאלה נדרש" })
            }

            const question = test.questions.id(questionId)
            if (!question) {
                return res.status(404).json({ status: 6, error: "שאלה לא נמצאה" })
            }

            // Check if question was already answered
            const alreadyAnswered = registrant.answeredQuestions.some((q) => q.questionId.toString() === questionId && q.status === "answered");

            if (alreadyAnswered) {
                return res.status(400).json({ status: 7, error: "השאלה כבר נענתה" })
            }

            // if subscriber hangup phone after listen question
            if (!answerDigit) {
                // check if settings allow hangup or it will wrong answer
                const wrongHangup = test.settings.hangupWrong;
                if (!wrongHangup) {
                    registrant.answeredQuestions.push({
                        questionId,
                        status: 'heard'
                    });
                    await registrant.save();
                    return res.status(400).json({ status: 8, error: "לא נבחרה תשובה" })
                }
                // else its mean its wrong answer
                answerDigit = -1;
            }

            // Update points based on answer
            if (question.correctAnswer == Number(answerDigit)) {
                registrant.points += question.pointsForCorrect || 1

            } else {
                registrant.points -= question.pointsForIncorrect || 1;
            }

            const isCorrect = question.correctAnswer === Number(answerDigit);

            const existingIndex = registrant.answeredQuestions.findIndex(
                (q) => q.questionId.toString() === questionId && q.status === "heard"
            );

            if (existingIndex !== -1) {
                // 🔁 עדכון שאלה שהושמעה אך לא נענתה
                registrant.answeredQuestions[existingIndex] = {
                    ...registrant.answeredQuestions[existingIndex],
                    isCorrect,
                    answeredDigit: Number(answerDigit),
                    points: isCorrect ? question.pointsForCorrect : -question.pointsForIncorrect,
                    answeredAt: new Date(),
                    status: "answered"
                };
            } else {
                // ➕ הוספה חדשה
                registrant.answeredQuestions.push({
                    questionId,
                    isCorrect,
                    answeredDigit: Number(answerDigit),
                    points: isCorrect ? question.pointsForCorrect : -question.pointsForIncorrect,
                });
            }

            await registrant.save();


            const pointsChange = isCorrect
                ? question.pointsForCorrect
                : -question.pointsForIncorrect;

            console.log("pointsChange: " + pointsChange);


            const updatedpoints = await Subscriber.findOneAndUpdate(
                subscriberQuery,
                { $inc: { points: Number(pointsChange) } },
                { new: true, upsert: false }
            );


            res.json({
                status: 0,
                success: true,
                points: registrant.points,
                answeredQuestions: registrant.answeredQuestions.length,
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: 500, message: "internal server error" });
        }
    };


    static async remainingQuestions(req, res) {

        const { role, userId } = req;

        try {
            console.log("remainingQuestions", req.query);

            const { code, phone, testId, level } = req.query;

            if (!code && !phone) {
                return res.status(400).json({ status: 1, error: "code or phone is required" });
            }

            const result = await formatSubscriberQuery(code, phone, testId, userId);
            if (!result.result) {
                return res.status(400).json({ status: result.status, error: result.message });
            }
            const { subscriberQuery, test } = result;

            const subscriber = await Subscriber.findOne(subscriberQuery);
            if (!subscriber) {
                return res.status(404).json({ status: 2, error: "לא נמצא נרשם למבחן" })
            }

            // check if subscriber allow this test
            if (test?.restrictedAccess) {
                if (!test?.allowedSubscribers.includes(subscriber._id)) {
                    return res.status(404).json({ status: 3, error: "איש הקשר לא מורשה להשתתף במבחן" })
                }
            }

            let registrant = await Registrant.findOne({ user_id: userId, testId, subscribeId: subscriber._id }).populate('subscribeId')

            if (!registrant) {
                registrant = new Registrant({
                    testId: test._id,
                    subscribeId: subscriber._id,
                    user_id: userId
                })
                await registrant.save()
            }

            // Filter only active questions
            let activeQuestions = test.questions.filter(q => q.active);
            if (level) {
                // Filter only questions in choosed level
                activeQuestions = test.questions.filter(q => q.active && q.level === level);
            }

            // Get all question IDs
            const allQuestionIds = activeQuestions.map((q) => q._id.toString())

            // 3. מזהי שאלות שנענו בפועל בלבד
            const answeredQuestionIds = registrant.answeredQuestions
                .filter(q => q.status === 'answered') // ✅ רק שאלות שנענו
                .map(q => q.questionId.toString());

            // 4. שאלות שעדיין לא נענו בפועל (או שנשמעו אך לא נענו)
            const unansweredQuestionIds = allQuestionIds.filter(id => !answeredQuestionIds.includes(id));


            // logic for random question
            const randomQuestion = test.settings?.random;
            let nextQuestion = null;
            let hasRemaining = false;
            let totalQuestions = allQuestionIds.length;
            let remainingQuestions = unansweredQuestionIds.length;

            if (unansweredQuestionIds.length > 0) {
                let nextId = null;
                if (randomQuestion) {
                    if (activeQuestions.length < test.settings.limitRandom) {
                        // its mean there is no question limit, then get one question random
                        nextId = unansweredQuestionIds[Math.floor(Math.random() * unansweredQuestionIds.length)]
                        hasRemaining = true;
                    } else {
                        totalQuestions = test.settings.limitRandom;
                        // there is random limit question, then check if not pass the limit
                        if (answeredQuestionIds.length >= test.settings.limitRandom) {
                            // no question left
                            remainingQuestions = 0;
                        } else {
                            nextId = unansweredQuestionIds[Math.floor(Math.random() * unansweredQuestionIds.length)];
                            hasRemaining = true;
                            remainingQuestions = test.settings.limitRandom - answeredQuestionIds.length;
                        }
                    }
                } else {
                    // its mean there is no limit and no random
                    nextId = unansweredQuestionIds[0];
                    hasRemaining = true;

                }

                nextQuestion = activeQuestions.find(q => q._id.toString() === nextId);
            }

            res.json({
                status: 0,
                hasRemaining: hasRemaining,
                totalQuestions: totalQuestions,
                answeredQuestions: answeredQuestionIds.length,
                remainingQuestions: remainingQuestions,
                points_owned: registrant.points,
                nextQuestion
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: 500, message: "internal server error" });
        }
    };



}

export default IVRController;



async function formatSubscriberQuery(code, phone, testId, userId) {
    const test = await NewTest.findOne({ _id: testId, user_id: userId, active: true });

    if (!test) {
        return { result: false, status: 10, message: "Test not found" };
    }

    // בניית query דינמי
    const subscriberQuery = { user_id: userId };
    const phoneCondition = [{ phone1: phone }, { phone2: phone }];

    if (test.settings?.matchByCode) {
        if (!code) {
            return { result: false, status: 11, message: "Error: code is required" };
        }
        subscriberQuery.code = code;
    }

    if (test.settings?.matchByPhone) {
        if (!phone) {
            return { result: false, status: 12, message: "Error: phone is required" };
        }
        if (test.settings?.matchByCode) {
            // אם גם קוד וגם טלפון - תוסיף $or
            subscriberQuery.$or = phoneCondition;
        } else {
            // רק לפי טלפון
            Object.assign(subscriberQuery, { $or: phoneCondition });
        }
    }

    return { result: true, subscriberQuery, test };
}
