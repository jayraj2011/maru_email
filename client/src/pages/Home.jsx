import { useState, useMemo, useRef, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import JoditEditor from "jodit-react";
import {
  FileUploader,
  FileInput,
  FileUploaderContent,
  FileUploaderItem,
} from "../utils/file-upload";

const FileSvgDraw = () => {
  return (
    <>
      <svg
        className="w-8 h-8 mb-3 text-primary"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        />
      </svg>
      <p className="mb-1 text-sm text-primary">
        <span className="font-semibold">Click to upload</span>
        &nbsp; or drag and drop
      </p>
      <p className="text-xs text-primary">SVG, PNG, JPG or GIF</p>
    </>
  );
};

const dropzone = {
  accept: {
    "image/*": [".jpg", ".jpeg", ".png", ".gif"],
  },
  multiple: true,
  maxFiles: 4,
  maxSize: 1 * 1024 * 1024,
};

const Home = () => {
  const editor = useRef(null);
  const [editorContent, setEditorContent] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [searchfilter, setSearchFilter] = useState("");
  const [processing, setProcessing] = useState(false);
  const [rows, setRows] = useState([]);
  const [mails, setMails] = useState(null);
  const [subject, setSubject] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const getMailsFromServer = async () => {
      const mailsRes = await axios.get("http://localhost:4123/getMails");
      setMails(mailsRes.data);
    };
    getMailsFromServer();
  }, []);

  const handleFileChange = (event) => {
    // var file_array = files;
    // file_array.push(event.target.files);
    setFiles(event.target.files);
  };

  // const config = {
  //   readonly: false, // all options from https://xdsoft.net/jodit/docs/,
  //   placeholder: "Start typings...",
  // };

  const handlesend = async (e) => {
    try {
      if (recipients.length == 0) {
        toast.error("No Email Selected");
      }
      setProcessing(true);

      const formData = new FormData();

      console.log(recipients);

      recipients.forEach((recipient) => {
        formData.append("recipients[]", recipient);
      });
      formData.append("mailContent", editorContent); // Add mailContent field

      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]); // Append each file with the same key "files"
      }

      console.log(files);

      const res = await axios.post("http://localhost:4123/send", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Ensure the content type is set
        },
      });
      // console.log("res", res.data);
      setProcessing(false);
      toast.success(res.data.message);
    } catch (error) {
      setProcessing(false);
      if (error.code == 400) {
        toast.error("No Email Chosen");
      }
      toast.error("Something went wrong. Please try again");
    }
  };

  const toggleSelect = (mail) => {
    setRecipients((prevSelected) =>
      prevSelected.includes(mail)
        ? prevSelected.filter((rowmail) => rowmail !== mail)
        : [...prevSelected, mail]
    );
  };

  const filteredEmails =
    mails &&
    mails.filter((row) =>
      row.company_email_prim.toLowerCase().includes(searchfilter.toLowerCase())
    );

  return (
    <>
      {processing && (
        <div className="absolute z-10 inset-0 bg-slate-300 opacity-50 flex flex-col items-center justify-center">
          <p className="text-xl">Please wait...</p>
          <div className="loader">
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__ball"></div>
          </div>
        </div>
      )}
      <div className="flex p-5 justify-between w-[100%]">
        {/* Email Draft Section */}
        <div className="relative p-5 shadow-lg border-2 border-gray-200 rounded-lg top-[10vh] h-fit max-h-auto w-[60%]">
          <header className="flex my-2 justify-between p-5">
            <h1 className=" font-medium text-xl md:text-3xl">Email Draft</h1>
          </header>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="Enter the Subject"
            className="border-2 border-gray-200 rounded-lg px-4 py-2 w-full my-4"
          />
          <JoditEditor
            ref={editor}
            value={editorContent}
            // config={config}
            tabIndex={1} // tabIndex of textarea
            onChange={(newContent) => setEditorContent(newContent)} // preferred to use only this option to update the content for performance reasons
          />
          {/* <form onSubmit={handleFileChange}> */}
          <input type="file" multiple onChange={handleFileChange} />
          {/* <button type="submit">Upload</button> */}
          {/* </form> */}
          {/* <div className="email-editor-container">
            <div className="content-preview">
              <h3>Preview</h3>
              <div dangerouslySetInnerHTML={{ __html: editorContent }} />
            </div>
          </div> */}
          <FileUploader
            value={files}
            orientation="vertical"
            onValueChange={setFiles}
            dropzoneOptions={dropzone}
            className="relative rounded-lg p-2 w-full mx-auto"
          >
            <FileInput className="outline-dashed bg-background outline-2 outline-primary/40">
              <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full ">
                <FileSvgDraw />
              </div>
            </FileInput>
            <FileUploaderContent className="flex items-center flex-row gap-2">
              {files?.map((file, i) => (
                <FileUploaderItem
                  key={i}
                  index={i}
                  className="size-20 p-0 rounded-md overflow-hidden border"
                  aria-roledescription={`file ${i + 1} containing ${file.name}`}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    height={80}
                    width={80}
                    className="size-20 rounded-md object-cover bg-primary"
                  />
                </FileUploaderItem>
              ))}
            </FileUploaderContent>
          </FileUploader>
        </div>

        {/* Sender email section */}
        <div className="relative h-fit max-h-[85vh] overflow-y-scroll shadow-lg border-2 border-gray-200 rounded-lg p-5 top-[10vh] m-5 w-[35%]">
          <Toaster richColors position="top-center" />
          <header className="flex my-2 justify-between p-5">
            <h1 className=" font-medium text-xl md:text-3xl">List of Emails</h1>
            <button
              disabled={processing == true}
              onClick={(e) => handlesend(e)}
              className="flex disabled:cursor-not-allowed gap-1 items-center px-5 py-2 rounded-lg bg-black text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-send"
              >
                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                <path d="m21.854 2.147-10.94 10.939" />
              </svg>
              Send
            </button>
          </header>
          <div className="flex items-center px-2 gap-1 border-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-search"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={searchfilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search for emails here"
              className="my-1 w-full px-3 py-2 rounded-lg"
              autoComplete="new-password"
              spellCheck="false"
              autoCorrect="off"
            />
          </div>
          <div className="overflow-x-auto w-[100%]">
            <table className=" shadow-md sm:rounded-lg p-4 min-w-full table-auto">
              <thead className=" font-semibold text-md">
                <tr>
                  <th className="px-4 py-2 text-left">Select</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-right">Company</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails &&
                  filteredEmails.map((row, index) => (
                    <tr
                      key={index}
                      className={`${
                        recipients.includes(row.company_email_prim)
                          ? "bg-slate-200"
                          : "bg-white"
                      } border-b`}
                    >
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          disabled={processing == true}
                          checked={recipients.includes(row.company_email_prim)}
                          onChange={() => toggleSelect(row.company_email_prim)}
                          className="disabled:cursor-not-allowed h-4 w-4"
                        />
                      </td>
                      <td className="px-4 py-2 ">{row.company_email_prim}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        {row.company_name}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
