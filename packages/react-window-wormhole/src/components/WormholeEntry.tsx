import * as React from "react";
import {
  createMessageChannel,
  MessageChannel,
} from "../channel/MessageChannel.js";
import { createWindowChannel } from "../channel/WindowChannel.js";
import { MessageTypes } from "../message/Message.js";
import { transformTransferableInput } from "../transferable/transformInput.js";

type Props<TP extends Record<string, any>> = {
  path: string;
  features?: string;
  open: boolean;
  onClose: () => void; // close, on both initiative and passive
  supportReload?: boolean;
  reloadDuration?: number; // duration between beforeunload and load event
  props?: TP;
};

export class WormholeEntry<
  TP extends Record<string, any>,
> extends React.Component<Props<TP>> {
  static defaultProps = {
    features: "chrome=1",
  };

  private openedWindow: Window | null = null;
  private windowMessageChannel: MessageChannel | null = null;
  private onWillUnmount: (() => void) | null = null;

  componentDidMount() {
    if (this.props.open) this.openWindow();
  }

  componentDidUpdate(prevProps: Props<TP>) {
    if (this.props.open && !prevProps.open) {
      this.openWindow();
    } else if (!this.props.open && prevProps.open) {
      this.closeWindow();
    }
  }

  componentWillUnmount() {
    this.onWillUnmount?.();
  }

  private openWindow() {
    this.closeWindow();

    const { path, features } = this.props;
    const openedWindow = window.open(path, path, features);
    if (!openedWindow) {
      console.error("failed opening window");
      return;
    }

    this.openedWindow = openedWindow;
    this.registerOpenedWindow(openedWindow);
  }

  private closeWindow() {
    if (this.openedWindow && !this.openedWindow.closed) {
      /**
       * do NOT use `props.onClose` here, bc `props.opened` can only be controlled by parent component
       * And `props.onClose` should set `props.opened` to false.
       * When `closeWindow` is called, `props.opened` is already false(see `componentDidUpdate` for why),
       * calling `props.onClose` to set it to false again is a waste.
       * */
      this.openedWindow.close();
      this.openedWindow = null;
    }
  }

  private registerOpenedWindow = (openedWindow: Window) => {
    this.windowMessageChannel ??= createMessageChannel(
      createWindowChannel(openedWindow),
    );

    this.windowMessageChannel.onInitMessage(this.handleSyncInit);
    // this.windowMessageChannel.onDataMessage();
    this.windowMessageChannel.onFuncMessage((message) => {
      const [name, args] = message.data;
      const method = this.props.props?.[name];
      if (typeof method === "function") {
        method(...args);
      }
    });

    this.onWillUnmount = () => {
      this.windowMessageChannel?.close();
      this.onWillUnmount = null;
    };
  };

  private handleSyncInit = (() => {
    let isClosing = false; // used with timer to distinguish close and reload of opened window
    return () => {
      const openedWindow = this.openedWindow;
      if (!openedWindow) return;

      isClosing = false;
      const { onClose, reloadDuration = 1000, supportReload } = this.props;
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        openedWindow.removeEventListener("beforeunload", handleBeforeUnload);
        isClosing = true;
        if (supportReload) {
          setTimeout(() => {
            if (openedWindow.closed && isClosing) onClose();
            isClosing = false;
          }, reloadDuration);
        }
      };
      if (!supportReload) {
        openedWindow.addEventListener("unload", () => onClose(), false);
      }
      openedWindow.addEventListener("beforeunload", handleBeforeUnload);
      this.sendData(this.props.props);
    };
  })();

  sendData = (data: any) => {
    if (!this.openedWindow) {
      console.warn("No opened window to send data to.");
      return;
    }

    this.windowMessageChannel ??= createMessageChannel(
      createWindowChannel(this.openedWindow),
    );
    this.windowMessageChannel.postMessage({
      type: MessageTypes.SEND_DATA,
      data: transformTransferableInput(data),
    });
  };

  render() {
    return null;
  }
}
