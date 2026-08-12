import { Injectable } from '@angular/core';
import { environment as env } from 'projects/reports/src/environments/environment';
import * as PusherPushNotifications from "@pusher/push-notifications-web";

declare const Pusher: any;

const ACCOUNTS_API = env.api_production.hosts.broadcast_server;
const BROADCAST_AUTH = `${ACCOUNTS_API}/broadcasting/auth`;

@Injectable({
  providedIn: 'root'
})
export class PusherService {

  pusher: any;
  messagesChannel: any

  constructor() { 
    // this.pusher = new Pusher(env.pusher.key, {
    //   cluster: 'ap2',
    //   authEndpoint: BROADCAST_AUTH
    // });

    // this.messagesChannel = this.pusher.subscribe('private-messages');
    // this.messagesChannel.bind('my-event', (data: any) => {
    //   console.log('subscribed message ', data);
    //   alert(JSON.stringify(data));
    // });

    // const beamsClient = new PusherPushNotifications.Client({
    //   instanceId: 'a7e098d3-c579-4d17-9e66-969b0686c9bc',
    // });

    // beamsClient.start()
    // .then(() => beamsClient.addDeviceInterest('hello'))
    // .then(() => console.log('Successfully registered and subscribed!'))
    // .catch(console.error);
  }
}
