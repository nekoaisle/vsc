import {Util} from './Util';

/**
 * 日時情報クラス
 */
export class DateInfo {
	public year  : string;     // 年 "YYYY"
	public month : string;     // 月 "MM"
	public date  : string;     // 日 "DD"
	public hour  : string;     // 時 "HH"
	public min   : string;     // 分 "II"
	public sec   : string;     // 秒 "SS"
	public ymd   : string;     // 日付 "YYYY-MM-DD"
	public his   : string;     // 時刻 "HH:II:SS"
	public ymdhis: string;     // 日時 "YYYY-MM-DD HH:II:SS"

	public constructor (date?: any) {
		switch (Util.getClassName(date)) {
			case 'Date': {
				break;
			}
			case 'Number': {
				date = new Date(date);
				break;
			}
			case 'String': {
				// ISO-8601 は - のはずなんだけどなぁ…
				date = date.replace( /-/g, '/');
				date = new Date(date);
				break;
			}
			// 上記以外は全て現在時刻	
			case 'Null':
			case 'Undefined':
			default: {
				date = new Date();
				break;
			}
		}
		
		this.year  = Util.padNum(date.getFullYear(), 4);
		this.month = Util.padNum(date.getMonth()   , 2);
		this.date  = Util.padNum(date.getDate()    , 2);
		this.hour  = Util.padNum(date.getHours()   , 2);
		this.min   = Util.padNum(date.getMinutes() , 2);
		this.sec   = Util.padNum(date.getSeconds() , 2);

		this.ymd    = `${this.year}-${this.month}-${this.date}`;
		this.his    = `${this.hour}-${this.min}-${this.sec}`;
		this.ymdhis = `${this.ymd} ${this.his}`;
	}
};
