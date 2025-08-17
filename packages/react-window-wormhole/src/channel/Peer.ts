import { EventHub } from "../utils/EventHub.js";
import { MessageChannel } from "./MessageChannel.js";
import {
  DataMessage,
  FuncCallMessage,
  FuncReturnMessage,
  QuitMessage,
} from "./TransferableMessage.js";

/**
 * {@link Peer} does not verify message source.
 */
export class Peer {
  constructor(
    readonly id: string,
    readonly clientId: string,
    private channel: MessageChannel,
  ) {}

  public readonly dataHub = new EventHub<DataMessage>();
  postData = ({ ref, data }: Omit<DataMessage, "type" | "from" | "to">) =>
    this.channel.postData({ ref, from: this.clientId, to: this.id, data });
  onData = (handler: (data: DataMessage) => void) =>
    this.dataHub.addListener(handler);

  public readonly funcCallHub = new EventHub<FuncCallMessage>();
  postFuncCall = <T = unknown>({
    data,
    ref,
    thread,
  }: Omit<FuncCallMessage, "type" | "from" | "to">) =>
    this.channel.postFuncCall({
      from: this.clientId,
      to: this.id,
      ref,
      data,
      thread,
    });

  onFuncCall = (handler: (message: FuncCallMessage) => void) =>
    this.funcCallHub.addListener(handler);

  public readonly funcReturnHub = new EventHub<FuncReturnMessage>();
  postFuncReturn = ({
    thread,
    ref,
    data,
  }: Omit<FuncReturnMessage, "type" | "from" | "to">) =>
    this.channel.postFuncReturn({
      from: this.clientId,
      to: this.id,
      thread,
      ref,
      data,
    });

  onFuncReturn = (handler: (message: FuncReturnMessage) => void) =>
    this.funcReturnHub.addListener(handler);

  public readonly quitHub = new EventHub<QuitMessage>();
  postQuit = () => this.channel.postQuit({ from: this.clientId });
  onQuit = (handler: (message: QuitMessage) => void) =>
    this.quitHub.addListener(handler);
}
