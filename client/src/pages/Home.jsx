import React, { useState, useMemo, useRef, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import JoditEditor from "jodit-react";
import {
  FileUploader,
  FileInput,
  FileUploaderContent,
  FileUploaderItem,
} from "../utils/file-upload";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ArrowDownNarrowWide } from "lucide-react";

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
    "application/*": [".pdf"],
  },
  multiple: true,
  maxFiles: 4,
  maxSize: 15 * 1024 * 1024,
};

const modules = {
  toolbar: [
    [{ size: [] }], // Font size
    [{ font: [] }],
    ["strike", "blockquote"],
    ["link"], // Link
    ["bold", "italic", "underline"], // Text styling
    [{ align: [] }], // Text alignment
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
  ],
};

// Allowed formats: Include font size, underline, and link
const formats = [
  "size", // Font size
  "bold",
  "script",
  "indent",
  "blockquote",
  "code-block",
  "italic",
  "underline", // Text styling
  "link", // Link
  "font",
  "list",
  "bullet", // Bullet lists
  "align", // Text alignment
];

const Home = () => {
  const editor = useRef(null);
  const [showemails, setShowEmails] = useState([]);
  const [allcompanyemails, setAllCompanyEmails] = useState([]);
  const [editorContent, setEditorContent] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [searchfilter, setSearchFilter] = useState("");
  const [processing, setProcessing] = useState(false);
  const [mails, setMails] = useState(null);
  const [files, setFiles] = useState(null);
  const [subject, setSubject] = useState("");

  useEffect(() => {
    const getMailsFromServer = async () => {
      const mailsRes = await axios.get("http://localhost:4123/mails");
      console.log("res", mailsRes);
      setMails(mailsRes.data);
    };
    getMailsFromServer();
  }, []);

  const onFileChange = (event) => {
    // Update the state
    setFiles(event.target.files[0]);
  };

  // const config = {
  //   readonly: false, // all options from https://xdsoft.net/jodit/docs/,
  //   placeholder: "Start typings...",
  // };

  const handleChange = (value) => {
    setEditorContent(value); // Update the content state
  };

  const handlesend = async (e) => {
    try {
      if (recipients.length == 0) {
        toast.error("No Email Selected");
      }
      setProcessing(true);

      const formData = new FormData();

      recipients.forEach((recipient) => {
        formData.append("recipients[]", recipient);
      });

      formData.append("mailContent", editorContent); // Add mailContent field

      formData.append("attachment", files, files.name);

      formData.append("subject", subject);

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

  const filteredEmails =
    mails &&
    mails.filter((row) =>
      row.company_name.toLowerCase().includes(searchfilter.toLowerCase())
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

      <div className="flex flex-col md:flex-row p-5 md:justify-between w-[100%]">
        <Toaster richColors position="top-center" />
        {/* Email Draft Section */}
        <div className="relative p-5 shadow-lg border-2 border-gray-200 rounded-lg top-[10vh] h-fit max-h-auto w-[100%] md:w-[60%]">
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
          <div className="mt-4">
            <input type="file" onChange={onFileChange} />
          </div>
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
        <div className="relative h-fit max-h-[85vh] overflow-y-scroll shadow-lg border-2 border-gray-200 rounded-lg p-5 top-[10vh] m-5 w-[100%] md:w-[35%]">
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
                  <th className="px-4 py-2 text-right">Company</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails &&
                  filteredEmails.map((row, index) => (
                    <React.Fragment key={index}>
                      <tr className={` border-b`}>
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            disabled={processing == true}
                            checked={allcompanyemails.includes(
                              row.company_name
                            )}
                            onChange={(e) => {
                              setAllCompanyEmails((prev) =>
                                prev.includes(row.company_name)
                                  ? prev.filter((p) => p != row.company_name)
                                  : [...prev, row.company_name]
                              );

                              setRecipients((prev) => {
                                if (e.target.checked) {
                                  // Add all subjects of the row
                                  return [
                                    ...prev,
                                    ...row.email_ids
                                      .filter(
                                        (email) =>
                                          !prev.includes(email.company_email)
                                      )
                                      .map((item) => item.company_email),
                                  ];
                                } else {
                                  return prev.filter(
                                    (email) =>
                                      !row.email_ids
                                        .map((item) => item.company_email)
                                        .includes(email)
                                  );
                                }
                              });
                            }}
                            className="disabled:cursor-not-allowed h-4 w-4"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right">
                          {row.company_name}
                        </td>
                        <td>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowEmails((prev) =>
                                prev.includes(row.company_name)
                                  ? prev.filter((p) => p !== row.company_name)
                                  : [...prev, row.company_name]
                              );
                            }}
                          >
                            {" "}
                            <ArrowDownNarrowWide />
                          </button>
                        </td>
                      </tr>
                      {showemails.includes(row.company_name) &&
                        row.email_ids.map((ids, i) => (
                          <tr key={i} className={` border-b`}>
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                disabled={processing == true}
                                checked={recipients.includes(ids.company_email)}
                                onChange={() =>
                                  setRecipients((prev) =>
                                    prev.includes(ids.company_email)
                                      ? prev.filter(
                                          (p) => p != ids.company_email
                                        )
                                      : [...prev, ids.company_email]
                                  )
                                }
                                className="disabled:cursor-not-allowed h-4 w-4 ml-[1rem]"
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-right text-xs">
                              {ids.company_email}
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
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
