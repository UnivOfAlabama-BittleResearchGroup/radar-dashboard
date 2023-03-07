// create a shared object for queries
import DateTime from "luxon";

class ParamHandler {
  /**
     * @param {number} deviceID
     * @param {DateTime} startTime
     */
  constructor(startTime,) {
    // this.deviceID = deviceID;
    this.startTime = startTime;
    // @ts-ignore
    // set the end time as midnight of the same day
    this.endTime = startTime.plus({ minutes: 2 });
  }

  //  method to get the query as a json object
  getQuery() {
    return {
      // "deviceID": this.deviceID,
      // @ts-ignore
      "startTime": this.startTime.toISO(),
      "endTime": this.endTime.toISO()
    }
  }

  // method to change the start and end time
  /**
   * @param {DateTime} startTime
   * @param {DateTime} endTime
   */
  changeTime(startTime, endTime) {
    this.startTime = startTime
    this.endTime = endTime
  }

}


export default ParamHandler