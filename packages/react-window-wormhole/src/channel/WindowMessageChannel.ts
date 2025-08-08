import { createMessageChannel, MessageChannel } from "./MessageChannel.js";
import { createWindowChannel } from "./WindowChannel.js";

export const createWindowMessageChannel = (
  targetWindow: Window,
  targetOrigin = "*",
): MessageChannel =>
  createMessageChannel(createWindowChannel(targetWindow, targetOrigin));
