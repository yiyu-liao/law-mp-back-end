import FileController from "@src/controller/file";

const File = [
  {
    path: "/files/upload",
    method: "all",
    action: FileController.uploadFile
  }
];

export default File;
