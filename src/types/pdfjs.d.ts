// declare module 'pdfjs-dist' {
//   export const GlobalWorkerOptions: {
//     workerSrc: string;
//   };

//   interface TextItem {
//     str: string;
//     dir: string;
//     transform: number[];
//     width: number;
//     height: number;
//     fontName: string;
//   }

//   interface TextMarkedContent {
//     type: string;
//   }

//   interface TextContent {
//     items: Array<TextItem | TextMarkedContent>;
//   }

//   interface PDFPageProxy {
//     getTextContent(): Promise<TextContent>;
//   }

//   interface PDFDocumentProxy {
//     numPages: number;
//     getPage(pageNumber: number): Promise<PDFPageProxy>;
//   }

//   interface PDFLoadingTask<T> {
//     promise: Promise<T>;
//   }

//   function getDocument(src: any): PDFLoadingTask<PDFDocumentProxy>;
// }
