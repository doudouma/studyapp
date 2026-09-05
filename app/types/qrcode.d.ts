declare module "qrcode" {
  interface QRCodeOptions {
    width?: number;
    margin?: number;
    color?: { dark?: string; light?: string };
    errorCorrectionLevel?: string;
    type?: string;
  }
  function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: QRCodeOptions
  ): Promise<void>;
  function toDataURL(text: string, options?: QRCodeOptions): Promise<string>;
  function toBlob(text: string, options?: QRCodeOptions): Promise<Blob>;
  function toString(text: string, options?: QRCodeOptions): Promise<string>;
  export { toCanvas, toDataURL, toBlob, toString };
  const QRCode: { toCanvas: typeof toCanvas; toDataURL: typeof toDataURL; toBlob: typeof toBlob; toString: typeof toString };
  export default QRCode;
}

declare module "qrcode/lib/browser.js" {
  import QRCode from "qrcode";
  export = QRCode;
}
