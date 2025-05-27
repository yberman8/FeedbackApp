import Subscriber from "../../config/models/subscribers.js";


class IVRModel {
  constructor() { }

  static async addSubscribe(subscribe, userId) {
    let newObj = {
      code: subscribe.code,
      name: subscribe.name,
      phone1: subscribe.phone1,
      phone2: subscribe.phone2,
      city: subscribe.city,
      linkName: subscribe.linkName,
      user_id: userId
    }
    const newSubscribe = await Subscriber.create(newObj);
    return newSubscribe;
  }


  static async getSubscribers(phone, code, userId, all) {

    // בניית query דינמי
    const subscriberQuery = { user_id: userId };
    const phoneCondition = [{ phone1: phone }, { phone2: phone }];

    // if code set code condition
    if (code) {
      subscriberQuery.code = code;
    }
    // if phone set or conditions phone1 or phone2
    if (phone) {
      subscriberQuery.$or = phoneCondition;
    }
   
    return all ? await Subscriber.find(subscriberQuery) : await Subscriber.findOne(subscriberQuery);
  }



  static async updatePoints(obj, userId) {

    // Increment the main points field by the nekudot value
    const updatedPoints = await Subscriber.findOneAndUpdate(
      { code: obj.code, user_id: userId },             // Query for finding the document
      { $inc: { points: obj?.points || 1 } },  // Increment operation
      { new: true, upsert: false }      // Options: return the updated document, don't create a new one if not found
    );

    return updatedPoints;
  }





}


export default IVRModel;

