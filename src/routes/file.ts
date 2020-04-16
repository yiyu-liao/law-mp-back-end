import FileController from "@src/controller/file";

const File = [
  {
    path: "/file/upload",
    method: "all",
    action: FileController.uploadFile
  }
];

export default File;
