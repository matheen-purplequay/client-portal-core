import * as CryptoJS from 'crypto-js';

const encryptSecretKey: string = 'appScKyCarisPur@987';

export function decryptData(data: any) {
	try {
		const bytes = CryptoJS.AES.decrypt(data, encryptSecretKey);
		if (bytes.toString()) {
			return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
		}
		return data
	} catch (e) {
		return null;
	}
}

export function encryptData(data: any) {
	try {
		return CryptoJS.AES.encrypt(JSON.stringify(data), encryptSecretKey).toString();
	} catch (e) {
		return null;
	}
}