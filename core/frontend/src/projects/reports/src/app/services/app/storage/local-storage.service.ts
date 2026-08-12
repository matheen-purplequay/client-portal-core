import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  encryptSecretKey: string = 'appScKyCarisPur@987';
  private storage: Storage;

  constructor() {
    this.storage = window.localStorage;
  }

  setItem(key: string, value: any): void {
    const encryptedData = this.encryptData(JSON.stringify(value));
    if (encryptedData) this.storage.setItem(key, encryptedData);
  }

  getItem(key: string): any {
    const item = this.storage.getItem(key);
    const decryptedData = this.decryptData(item);
    const parsedData = (this.isJSON(decryptedData)) ? JSON.parse(decryptedData) : decryptedData;

    return (this.isJSON(parsedData))? JSON.parse(parsedData) : parsedData;
  }

  isJSON(str: string) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  isItemExists(key: string) {
    return this.storage.getItem(key) ? true : false;
  }

  encryptData(data: any) {
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptSecretKey).toString();
    } catch (e) {
      return null;
    }
  }

  decryptData(data: any) {
    try {
      const bytes = CryptoJS.AES.decrypt(data, this.encryptSecretKey);
      if (bytes.toString()) {
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
      return data;
    } catch (e) {
      return null;
    }
  }
}
