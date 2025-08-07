import { MessageFlags, sendMessage } from "./Messager.js";
import { transformToTransferable } from "./model/Transferable.js";

export const sendData = (window: Window, message: unknown) =>
  sendMessage(window, {
    type: MessageFlags.SEND_DATA,
    data: transformToTransferable(message),
  });
