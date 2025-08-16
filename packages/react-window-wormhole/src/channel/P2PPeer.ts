import { MessageChannel } from "./MessageChannel.js";
import {
  DataMessage,
  FuncCallMessage,
  FuncReturnMessage,
} from "./TransferableMessage.js";

export class P2PPeer {
  constructor(
    readonly id: string,
    readonly clientId: string,
    private channel: MessageChannel,
  ) {}

  postData(data: DataMessage["data"]) {
    this.channel.postData(this.clientId, this.id, data);
  }
  onData(handler: (data: DataMessage["data"]) => void) {
    this.channel.onDataMessage((message) => {
      if (message.from === this.id) {
        handler(message.data);
      }
    });
  }

  postFuncCall(func: FuncCallMessage["data"]) {
    this.channel.postFuncCall(this.clientId, this.id, func);
  }
  onFuncCall(handler: (func: FuncCallMessage["data"]) => void) {
    this.channel.onFuncCall((message) => {
      if (message.from === this.id) {
        handler(message.data);
      }
    });
  }

  postFuncReturn(returnValue: FuncReturnMessage["data"]) {
    this.channel.postFuncReturn(this.clientId, this.id, returnValue);
  }
  onFuncReturn(handler: (returnValue: FuncReturnMessage["data"]) => void) {
    this.channel.onFuncReturn((message) => {
      if (message.from === this.id) {
        handler(message.data);
      }
    });
  }

  postQuit() {
    this.channel.postQuit(this.clientId);
  }
  onQuit(handler: () => void) {
    this.channel.onQuit((message) => {
      if (message.from === this.id) {
        handler();
      }
    });
  }
}
