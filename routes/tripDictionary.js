const moment = require('moment');

const updateStationData = (dict, stationID, data) => {
  if (!Object.prototype.hasOwnProperty.call(dict, stationID)) {
    dict[stationID] = [];
  }
  dict[stationID].push(data);
};

// Binary search by date
const findLowerBound = (list, target_moment) => {
  let l = -1,
    r = list.length;
  while (r - l > 1) {
    let mid = parseInt((l + r) / 2);
    if (list[mid].endDateMoment > target_moment) {
      r = mid - 1;
    } else {
      l = mid;
    }
  }
  return l;
};

class TripDictionary {
  constructor() {
    this.ageRangeData = {
      '0-20': {},
      '21-30': {},
      '31-40': {},
      '41-50': {},
      '51+': {},
      unknown: {},
    };
    this.stationTrips = {};
  }

  addTrip(tripData) {
    const endDateMoment = moment(tripData.endDate, 'YYYY-MM-DD hh:mm:ss');
    const riderBirthYear = parseInt(tripData.birthYear);
    if (isNaN(riderBirthYear)) {
      updateStationData(this.ageRangeData['unknown'], tripData.endStationID, {
        endDateMoment,
      });
    } else {
      const currentYear = new Date().getFullYear();
      const riderAge = parseInt(currentYear - riderBirthYear);
      let ageRange = '51+';
      if (riderAge <= 20) {
        ageRange = '0-20';
      } else if (riderAge <= 30) {
        ageRange = '21-30';
      } else if (riderAge <= 40) {
        ageRange = '31-40';
      } else if (riderAge <= 50) {
        ageRange = '41-50';
      }
      updateStationData(this.ageRangeData[ageRange], tripData.endStationID, {
        endDateMoment,
      });
    }

    updateStationData(this.stationTrips, tripData.endStationID, {
      endDateMoment,
      trip: tripData,
    });
  }

  finalize() {
    for (let ageRange in this.ageRangeData) {
      for (let stationID in this.ageRangeData[ageRange]) {
        this.ageRangeData[ageRange][stationID] = this.ageRangeData[ageRange][
          stationID
        ].sort((a, b) => a.endDateMoment.diff(b.endDateMoment));
      }
    }
    for (let stationID in this.stationTrips) {
      this.stationTrips[stationID] = this.stationTrips[stationID].sort((a, b) =>
        a.endDateMoment.diff(b.endDateMoment)
      );
    }
  }

  getStationLastTrips(stationID, targetDate) {
    if (!Object.prototype.hasOwnProperty.call(this.stationTrips, stationID))
      return [];
    let momentEnd = moment(targetDate, 'YYYY-MM-DD').endOf('day');
    let momentStart = moment(targetDate, 'YYYY-MM-DD')
      .endOf('day')
      .subtract(1, 'days');
    let l = findLowerBound(this.stationTrips[stationID], momentStart) + 1;
    let r = findLowerBound(this.stationTrips[stationID], momentEnd) + 1;
    l = Math.max(l, r - 20);
    return this.stationTrips[stationID].slice(l, r).reverse();
  }

  getAgeGroups(listStationIDs, targetDate) {
    let momentEnd = moment(targetDate, 'YYYY-MM-DD').endOf('day');
    let momentStart = moment(targetDate, 'YYYY-MM-DD')
      .endOf('day')
      .subtract(1, 'days');
    let result = {};
    for (let ageRange in this.ageRangeData) {
      for (let _ in listStationIDs) {
        let stationID = listStationIDs[_];
        if (
          !Object.prototype.hasOwnProperty.call(result, stationID) &&
          Object.prototype.hasOwnProperty.call(this.stationTrips, stationID)
        )
          result[stationID] = {};
        result[stationID][ageRange] = 0;
        if (
          Object.prototype.hasOwnProperty.call(
            this.ageRangeData[ageRange],
            stationID
          )
        ) {
          let count =
            findLowerBound(this.ageRangeData[ageRange][stationID], momentEnd) -
            findLowerBound(this.ageRangeData[ageRange][stationID], momentStart);
          result[stationID][ageRange] = count;
        }
      }
    }
    return result;
  }
}

var dictionary = new TripDictionary();
var dictionaryDriver = {
  addTrip: (trip) => dictionary.addTrip(trip),
  finalize: () => dictionary.finalize(),
  getStationLastTrips: (stationID, targetDate) =>
    dictionary.getStationLastTrips(stationID, targetDate),
  getAgeGroups: (listStationIDs, targetDate) =>
    dictionary.getAgeGroups(listStationIDs, targetDate),
};

module.exports = dictionaryDriver;
