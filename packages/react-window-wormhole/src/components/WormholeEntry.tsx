import * as React from "react";
import { Message, MessageFlags } from "../Messager.js";
import { TransferableObject } from "../model/Transferable.js";
import { sendData } from "../sendData.js";
import { createSubscription } from "../utils.js";

// TP is in short of `TransferProps`
type Props<TP extends TransferableObject> = {
  path: string;
  featureString?: string;
  open: boolean;
  onClose: () => void; // close, on both initiative and passive
  supportReload?: boolean;
  reloadDuration?: number; // duration between beforeunload and load event
  props?: TP;
};

export class WormholeEntry<TransferProps extends TransferableObject> extends React.Component<Props<TransferProps>> {
  private openedWindow: Window | null = null;
  private onWillUnmount: (() => void) | null = null;

  componentDidMount() {
    if (this.props.open) this.openWindow();
  }

  componentDidUpdate(prevProps: Props<TransferProps>) {
    if (this.props.open && !prevProps.open) {
      this.openWindow();
    } else if (!this.props.open && prevProps.open) {
      this.closeWindow();
    }
    if (this.openedWindow) {
      // send when render to update latest props naturally
      const { props: toTransfer, open: opened } = this.props;
      if (opened) sendData(this.openedWindow, toTransfer);
    }
  }

  componentWillUnmount() {
    if (this.onWillUnmount) this.onWillUnmount();
  }

  private openWindow() {
    const { path, featureString = "chrome=1" } = this.props;
    const target = path;
    const openedWindow = window.open(path, target, featureString);
    this.openedWindow = openedWindow;
    if (openedWindow) {
      this.registerOpenedWindow(openedWindow);
    } else {
      console.error("failed opening window");
    }
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

  private registerOpenedWindow = createSubscription((openedWindow: Window) => {
    const handleMessage = (() => {
      return (e: MessageEvent) => {
        if (e.source === openedWindow) {
          // process messages from opened window
          const rawMessage: Message = e.data;
          switch (rawMessage.type) {
            case MessageFlags.SYNC_INIT: {
              this.handleSyncInit(openedWindow);
              break;
            }
            // case MessageFlags.FUNC_CALL: {
            //   const [name, ...args] = rawMessage.data;
            //   const method = this.props.toTransfer[name];
            //   if (typeof method === "function") {
            //     method(...args);
            //   }
            //   break;
            // }
          }
        }
      };
    })();
    const unsubscribe = () => {
      window.removeEventListener("message", handleMessage);
      this.onWillUnmount = null;
    };
    window.addEventListener("message", handleMessage);
    this.onWillUnmount = unsubscribe;
    return unsubscribe;
  });

  private handleSyncInit = (() => {
    let isClosing = false; // used with timer to distinguish close and reload of opened window
    return (openedWindow: Window) => {
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
      sendData(openedWindow, this.props.props);
    };
  })();

  render() {
    return null;
  }
}
