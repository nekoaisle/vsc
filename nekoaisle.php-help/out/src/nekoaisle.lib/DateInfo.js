"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("./Util");
/**
 * 日時情報クラス
 */
class DateInfo {
    constructor(date) {
        if (!date) {
            date = new Date;
        }
        this.year = Util_1.Util.padNum(date.getFullYear(), 4);
        this.month = Util_1.Util.padNum(date.getMonth(), 2);
        this.date = Util_1.Util.padNum(date.getDate(), 2);
        this.hour = Util_1.Util.padNum(date.getHours(), 2);
        this.min = Util_1.Util.padNum(date.getMinutes(), 2);
        this.sec = Util_1.Util.padNum(date.getSeconds(), 2);
        this.ymd = `${this.year}-${this.month}-${this.date}`;
        this.his = `${this.hour}-${this.min}-${this.sec}`;
        this.ymdhis = `${this.ymd} ${this.his}`;
    }
}
exports.DateInfo = DateInfo;
;
//# sourceMappingURL=DateInfo.js.map