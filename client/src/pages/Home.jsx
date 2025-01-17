import React, { useState, useMemo, useRef, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import {
  FileUploader,
  FileInput,
  FileUploaderContent,
  FileUploaderItem,
} from "../utils/file-upload";
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Filter,
  Pen,
  Trash2,
} from "lucide-react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";

Quill.register("modules/imageResize", ImageResize);

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
      <p className="text-xs text-primary">SVG, PNG, JPG , GIF or PDF</p>
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

const Home = () => {
  const editor = useRef(null);
  const [showemails, setShowEmails] = useState([]);
  const [addcompany, setAddCompany] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [email_compny, setEmailCompny] = useState("");
  const [email_compny_label, setEmailCompnyLabel] = useState("");
  const [email_compny_label_error, setEmailCompnyLabelError] = useState(false);
  const [email_to_delte, setEmailToDelete] = useState(null);
  const [company_to_delte, setCompanyToDelete] = useState(null);
  const [company_name, setCompanyName] = useState("");
  const [addemail, setAddEmail] = useState(false);
  const [company_email, setCompanyEmail] = useState(null);
  const [deletecompany, setDeleteCompany] = useState(false);
  const [deleteemail, setDeleteEmail] = useState(false);
  const [allcompanyemails, setAllCompanyEmails] = useState([]);
  const [editorContent, setEditorContent] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [searchfilter, setSearchFilter] = useState("");
  const [processing, setProcessing] = useState(false);
  const [mails, setMails] = useState(null);
  const [files, setFiles] = useState(null);
  const [subject, setSubject] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [filter_email, setFilterEmail] = useState("");
  const [show_filter_email, setShowFilterEmail] = useState(false);
  const [edit_company, setEditCompany] = useState(null);
  const [show_edit_company, setShowEditCompany] = useState(false);
  const [select_all, setSelectAll] = useState(false);

  useEffect(() => {
    const getMailsFromServer = async () => {
      const mailsRes = await axios.get("http://localhost:4123/mails");
      setMails(mailsRes.data);
    };
    const getCompaniesFromServer = async () => {
      const companiesRes = await axios.get("http://localhost:4123/company");
      setCompanies(companiesRes.data);
    };
    getCompaniesFromServer();
    getMailsFromServer();
  }, [refresh]);

  const modules = {
    toolbar: {
      container: [
        // Alignment options
        [{ align: [] }],

        // Font size and font family
        [{ size: ["small", false, "large", "huge"] }],
        [{ font: [] }],

        // Text formatting options
        ["bold", "italic", "underline", "strike"],

        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        // Blockquote
        ["blockquote"],

        // Lists and indentation
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],

        // Background and text colors
        [
          {
            color: [],
          },
          { background: [] },
        ],

        // Code block
        ["code-block"],

        // Checklist (tasks)
        // [{ list: "bullet" }, { list: "ordered" }, { list: "check" }],

        ["better-table"],
        // Additional options (optional)
        ["clean"], // Removes formatting
        ["image"],
      ],
    },
    history: {
      delay: 2000, // How long to delay before saving history
      maxStack: 500, // Max number of undo states
    },
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
    imageResize: {
      parchment: Quill.import("parchment"),
      modules: ["Resize", "DisplaySize"],
    },
  };

  // Allowed formats: Include font size, underline, and link
  const formats = [
    // Alignment
    "align",

    //headers
    "headers",

    // Font size and font family
    "size",
    "font",

    // Text formatting
    "bold",
    "italic",
    "underline",
    "strike",

    // Blockquote
    "blockquote",

    // Lists and indentation
    "list",
    "bullet",
    "check",
    "indent",

    // Background and text colors
    "color",
    "background",

    // Code block
    "code-block",
    "image",
  ];

  const handleChange = (value) => {
    setEditorContent(value); // Update the content state
  };

  const handlesend = async (e) => {
    try {
      if (recipients.length == 0) {
        toast.error("No Email Selected");
        return;
      }
      if (subject.length == 0) {
        toast.error("No Subject ");
        return;
      }
      if (editorContent.length == 0) {
        toast.error("No Email Content provided");
        return;
      }
      setProcessing(true);

      const formData = new FormData();

      recipients.forEach((recipient) => {
        formData.append("recipients[]", JSON.stringify(recipient));
      });

      formData.append("mailContent", editorContent); // Add mailContent field

      if (files !== null) {
        for (let file of files) {
          formData.append("attachment", file, file.name);
        }
      }

      formData.append("subject", subject);

      const res = await axios.post("http://localhost:4123/send", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Ensure the content type is set
        },
      });
      setProcessing(false);
      toast.success(res.data.message);
    } catch (error) {
      setProcessing(false);
      if (error.code == 400) {
        toast.error("No Email Chosen");
      }
      console.log("error", error);
      toast.error("Something went wrong. Please try again");
    }
  };

  const handleAddCompany = async (e) => {
    try {
      e.preventDefault();
      if (!company_name) {
        toast.error("No Company name provided");
        return;
      }

      const res = await axios.post("http://localhost:4123/company", {
        ["company_name"]: company_name,
      });
      toast.success("Successfully added new company");
      setCompanyName("");
      setAddCompany(false);
      setRefresh((prev) => !prev);
    } catch (error) {
      toast.error("Something went wrong. please try again laster");
      console.log(error);
    }
  };

  const handleAddEmail = async (e) => {
    try {
      e.preventDefault();
      if (!email_compny) {
        setEmailCompnyLabelError(true);
      }
      if (email_compny_label_error) {
        toast.error("Enter valid company name");
        return;
      }
      if (!company_email) {
        toast.error("No email provided");
        return;
      }
      setEmailCompnyLabelError(files);
      const res = await axios.post("http://localhost:4123/email", {
        ["company_id"]: Number(email_compny),
        ["company_email"]: company_email,
      });

      toast.success(
        `Successfully added new email for${
          companies.find((c) => c.id == email_compny).company_name
        }`
      );
      setCompanyEmail("");
      setAddEmail(false);
      setRefresh((prev) => !prev);
    } catch (error) {
      toast.error("Something went wrong. please try again laster");
      console.log(error);
    }
  };

  const handleDeleteEmail = async (e) => {
    e.preventDefault();
    try {
      console.log(email_to_delte.id);
      const res = await axios.delete("http://localhost:4123/email", {
        data: { id: Number(email_to_delte.id) },
      });
      // console.log("res", res);
      toast.success("Successfully deleted email");
      setEmailToDelete(null);
      setDeleteEmail(false);
      setRefresh((prev) => !prev);
    } catch (error) {
      toast.error("Something went wrong. please try again laster");
      console.log(error);
    }
  };

  const handleDeleteCompany = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.delete("http://localhost:4123/company", {
        data: { companyID: Number(company_to_delte.companyID) },
      });
      console.log("res", res);
      toast.success("Successfully deleted company");
      setCompanyToDelete(null);
      setDeleteCompany(false);
      setRefresh((prev) => !prev);
    } catch (error) {
      toast.error("Something went wrong. please try again laster");
      console.log(error);
    }
  };

  const handleEditCompany = async (e) => {
    try {
      e.preventDefault();
      if (companies.find((c) => c.company_name == edit_company.company_name)) {
        toast.error("change company name");
        return;
      }
      const res = await axios.put("http://localhost:4123/company", {
        companyID: Number(edit_company.companyID),
        company_name: edit_company.company_name,
      });
      console.log("res", res);
      toast.success("Successfully Edited company name");
      setEditCompany(null);
      setShowEditCompany(false);
      setRefresh((prev) => !prev);
    } catch (error) {
      toast.error("Something went wrong. please try again laster");
      console.log(error);
    }
  };

  const filteredCompanies = useMemo(() => {
    if (!mails) return [];
    return mails.filter((row) =>
      row.company_name.toLowerCase().includes(searchfilter.toLowerCase())
    );
  }, [mails, searchfilter]);

  let em = mails && mails.map((em) => em.email_ids).flat();

  let filteredEmails = useMemo(() => {
    if (!em) return [];
    return em.filter((row) =>
      row.company_email.toLowerCase().includes(filter_email.toLowerCase())
    );
  }, [em, filter_email]);

  // console.log("em", em);
  // console.log("recipients", recipients);
  // console.log("filteredCompanies", filteredCompanies);
  // console.log("mails", mails);

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
      <nav className="flex h-[10vh] justify-center items-center p-4">
        <button
          onClick={() => setAddCompany((prev) => !prev)}
          className="px-4 py-2 border-b-2 border-black"
        >
          Add Company
        </button>
        <button
          onClick={() => setAddEmail((prev) => !prev)}
          className="px-4 py-2 border-b-2 border-black"
        >
          Add Email
        </button>
      </nav>

      {addcompany && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setAddCompany(false);
          }}
          className="absolute inset-0 z-10 bg-[rgba(255,255,255,0.7)] flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="z-20 w-[80%] md:w-[100%] max-w-lg border-2 bg-white opacity-100 h-fit rounded-lg shadow-md p-5"
          >
            <h1 className=" font-medium text-[1rem] md:text-[2rem]">
              Add Company
            </h1>
            <p>Add a new company</p>
            <form className="flex flex-col mt-[1rem] md:mt-[2rem] gap-5">
              <div className="flex flex-col gap-1 w-[100%]">
                <label htmlFor="company_name" className="font-medium">
                  Enter Company Name
                </label>
                <input
                  id="company_name"
                  type="text"
                  placeholder="Enter Company name"
                  value={company_name}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="rounded-lg px-4 py-2 border-2"
                  required
                />
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setAddCompany(false)}
                  className="px-3 py-2 rounded-lg bg-red-800 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => handleAddCompany(e)}
                  className="px-3 py-2 rounded-lg bg-green-800 text-white"
                >
                  Add Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {show_edit_company && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setShowEditCompany(false);
          }}
          className="absolute inset-0 z-10 bg-[rgba(255,255,255,0.7)] flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="z-20 w-[80%] md:w-[100%] max-w-lg border-2 bg-white opacity-100 h-fit rounded-lg shadow-md p-5"
          >
            <h1 className=" font-medium text-[1rem] md:text-[2rem]">
              Change
              {
                companies.find((c) => c.id == edit_company.companyID)
                  .company_name
              }
              name
            </h1>
            <p>Edit the company name</p>
            <form className="flex flex-col mt-[1rem] md:mt-[2rem] gap-5">
              <div className="flex flex-col gap-1 w-[100%]">
                <label htmlFor="company_name" className="font-medium">
                  Enter New Company Name
                </label>
                <input
                  id="company_name"
                  type="text"
                  placeholder="Enter Company name"
                  value={edit_company.company_name}
                  onChange={(e) =>
                    setEditCompany((prev) => ({
                      ...prev,
                      company_name: e.target.value,
                    }))
                  }
                  className="rounded-lg px-4 py-2 border-2"
                  required
                />
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowEditCompany(false)}
                  className="px-3 py-2 rounded-lg bg-red-800 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => handleEditCompany(e)}
                  className="px-3 py-2 rounded-lg bg-green-800 text-white"
                >
                  Edit Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {show_filter_email && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setShowFilterEmail(false);
          }}
          className="absolute inset-0 z-10 bg-[rgba(255,255,255,0.7)] flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`z-20 w-[80%] md:w-[40%] border-2 ml-auto bg-white opacity-100 h-[100vh] rounded-lg shadow-md p-5 transform transition-transform duration-1000 ease-in-out ${
              show_filter_email ? "block translate-x-0" : "hidden translate-x-2"
            }`}
          >
            <h1 className=" mt-[10vh] font-medium text-[1.5rem] md:text-[2rem]">
              Search Email
            </h1>
            <p>Search for alls email</p>
            <div className="flex items-center px-2 gap-1 border-2 w-full">
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
                value={filter_email}
                onChange={(e) => setFilterEmail(e.target.value)}
                placeholder="Search for emails here"
                className="my-1 w-full px-3 py-2 rounded-lg"
                autoComplete="new-password"
                spellCheck="false"
                autoCorrect="off"
                autoFocus
              />
            </div>
            <table className="mt-5 shadow-md sm:rounded-lg p-4 min-w-full table-auto">
              <thead className=" font-semibold text-md">
                <tr>
                  <th className="px-4 py-2 text-left">select</th>
                  <th className="px-4 py-2 text-left">id</th>
                  <th className="px-4 py-2 text-left">Emails</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails &&
                  filteredEmails.map((em, i) => (
                    <tr
                      key={i}
                      className={`${
                        recipients
                          .map((r) => r.address)
                          .includes(em.company_email)
                          ? "bg-slate-200"
                          : "bg-white"
                      } border-b`}
                    >
                      <td className="px-4 py-2">
                        <input
                          id={i}
                          type="checkbox"
                          disabled={processing == true}
                          checked={recipients
                            .map((r) => r.address)
                            .includes(em.company_email)}
                          onChange={() =>
                            setRecipients((prev) =>
                              prev.some((p) => p.address == em.company_email)
                                ? prev.filter(
                                    (p) => p.address != em.company_email
                                  )
                                : [
                                    ...prev,
                                    {
                                      ["address"]: em.company_email,
                                      ["name"]:
                                        mails &&
                                        mails.find((m) =>
                                          m.email_ids.find(
                                            (ems) =>
                                              ems.company_email ==
                                              em.company_email
                                          )
                                        ).company_name,
                                    },
                                  ]
                            )
                          }
                          className="disabled:cursor-not-allowed h-4 w-4 ml-[1.5rem]"
                        />
                      </td>
                      <td className="px-4 py-2">{em.id}</td>
                      <td className="px-4 py-2">{em.company_email}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {addemail && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setAddEmail(false);
          }}
          className="absolute inset-0 z-10 bg-[rgba(255,255,255,0.7)] flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="z-20 w-[80%] md:w-[100%]  max-w-lg border-2 bg-white opacity-100 h-fit rounded-lg shadow-md p-5"
          >
            <h1 className=" font-medium text-[1.5rem] md:text-[2rem]">
              Add Email
            </h1>
            <p>Add a new email</p>
            <form className="flex flex-col mt-[1rem] md:mt-[2rem] gap-5">
              {/* <div className="flex flex-col gap-1 w-[100%]">
                <label htmlFor="c" className="font-medium">
                  Select Company
                </label>
                <select
                  value={email_compny}
                  onChange={(e) => setEmailCompny(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2"
                >
                  <option value="" disabled>
                    Select a Company
                  </option>
                  {companies &&
                    companies.map((c) =>
                      email_compny === c.id ? (
                        <option key={c.id} value={c.id} selected>
                          {c.company_name}
                        </option>
                      ) : (
                        <option key={c.id} value={c.id}>
                          {c.company_name}
                        </option>
                      )
                    )}
                </select>
              </div> */}
              <div className="relative w-full">
                <label
                  htmlFor="searchable-select"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Select an Option
                </label>
                <input
                  id="searchable-select"
                  list="options-list"
                  value={email_compny_label}
                  onChange={(e) => {
                    setEmailCompnyLabel(e.target.value);
                    let email_id = companies.find(
                      (c) => c.company_name == e.target.value
                    )?.id;
                    setEmailCompny(email_id);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Company name"
                />
                <datalist
                  className="absolute top-full left-0 z-10 w-full bg-white border border-gray-300 rounded-lg mt-1"
                  id="options-list"
                >
                  {companies &&
                    companies.map((c) =>
                      email_compny === c.id ? (
                        <option
                          className="px-4 py-2 hover:bg-gray-100"
                          key={c.id}
                          value={c.company_name}
                        >
                          {c.company_name}
                        </option>
                      ) : (
                        <option
                          className="px-4 py-2 hover:bg-gray-100"
                          key={c.id}
                          value={c.company_name}
                        >
                          {c.company_name}
                        </option>
                      )
                    )}
                </datalist>
                {email_compny_label_error && (
                  <p className="text-red-400">
                    No company named {email_compny_label}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1 w-[100%]">
                <label htmlFor="email" className="font-medium">
                  Enter Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={company_email}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="rounded-lg px-4 py-2 border-2"
                  disabled={email_compny == false}
                  required
                />
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setAddEmail(false)}
                  className="px-3 py-2 rounded-lg bg-red-800 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => handleAddEmail(e)}
                  className="px-3 py-2 rounded-lg bg-green-800 text-white"
                >
                  Add Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteemail && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setDeleteEmail(false);
          }}
          className="absolute inset-0 z-10 bg-[rgba(255,255,255,0.7)] flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="z-20 w-[80%] md:w-[100%] max-w-lg border-2 bg-white opacity-100 h-fit rounded-lg shadow-md p-5"
          >
            <h1 className=" leading-none my-2 font-medium text-[1rem] md:text-[1.5rem]">
              Are you sure you want to delete {email_to_delte?.company_email}
            </h1>
            <p>It would delete the email permantly</p>
            <div className="flex gap-4 mt-[2rem] justify-end">
              <button
                onClick={() => setDeleteEmail(false)}
                className="px-3 py-2 rounded-lg bg-black text-white"
              >
                Cancel
              </button>
              <button
                onClick={(e) => handleDeleteEmail(e)}
                className="px-3 py-2 rounded-lg bg-red-800 text-white"
              >
                Delete email
              </button>
            </div>
          </div>
        </div>
      )}

      {deletecompany && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setDeleteCompany(false);
          }}
          className="absolute inset-0 z-10 bg-[rgba(255,255,255,0.7)] flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="z-20 w-[80%] md:w-[100%] max-w-lg border-2 bg-white opacity-100 h-fit rounded-lg shadow-md p-5"
          >
            <h1 className=" leading-none my-2 font-medium text-[1rem] md:text-[1.5rem]">
              Are you sure you want to delete {company_to_delte?.name}
            </h1>
            <p>It would delete the company permantly</p>
            <div className="flex gap-4 mt-[2rem] justify-end">
              <button
                onClick={() => setDeleteCompany(false)}
                className="px-3 py-2 rounded-lg bg-black text-white"
              >
                Cancel
              </button>
              <button
                onClick={(e) => handleDeleteCompany(e)}
                className="px-3 py-2 rounded-lg bg-red-800 text-white"
              >
                Delete company
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row p-5 md:justify-between w-[100%]">
        <Toaster richColors position="top-center" />

        {/* Email Draft Section */}
        <div className="relative p-5 shadow-lg border-2 border-gray-200 rounded-lg h-fit max-h-auto w-[100%] md:w-[57%]">
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

          <div className="md:p-2">
            <h2 className="text-xl font-medium mb-4">Enter Content </h2>
            <ReactQuill
              ref={editor}
              theme="snow"
              value={editorContent}
              onChange={handleChange}
              placeholder="Start typing..."
              className="bg-white w-[100%]"
              formats={formats}
              modules={modules}
            />
          </div>
          {/* <div className="mt-4">
            <input type="file" onChange={onFileChange} />
          </div> */}
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
        <div className="relative h-fit max-h-[85vh] overflow-y-scroll shadow-lg border-2 border-gray-200 rounded-lg p-5 w-[100%] md:w-[40%]">
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
          <button
            onClick={() => setShowFilterEmail((prev) => !prev)}
            className="px-4 py-2 my-3 rounded-xl w-fit mt-5 ml-auto flex gap-1 bg-black text-white whitespace-nowrap"
          >
            <Filter />
            search Emails
          </button>
          <div className="flex items-center px-2 gap-1 border-2 w-full">
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
              placeholder="Search for companies here"
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
                  <th className="px-4 py-2 text-left">
                    <input
                      type="checkbox"
                      disabled={processing == true}
                      checked={select_all}
                      onChange={(e) => {
                        setSelectAll((prev) => !prev);
                        if (e.target.checked) {
                          let all = mails.map((m) => m.company_name);
                          let mall = mails
                            .map((m) =>
                              m.email_ids.map((em) => ({
                                ["address"]: em.company_email,
                                ["name"]: m.company_name,
                              }))
                            )
                            .flat();
                          setAllCompanyEmails(all);
                          setRecipients(mall);
                        } else {
                          setAllCompanyEmails([]);
                          setRecipients([]);
                        }
                      }}
                      className="disabled:cursor-not-allowed h-4 w-4"
                    />
                  </th>
                  <th className="px-4 py-2 text-left">Company</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies &&
                  filteredCompanies.map((row, index) => (
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
                                      .map((it) => ({
                                        ["address"]: it.company_email,
                                        ["name"]: row.company_name,
                                      })),
                                  ];
                                } else {
                                  return prev.filter(
                                    (email) =>
                                      !row.email_ids
                                        .map((item) => item.company_email)
                                        .includes(email.address)
                                  );
                                }
                              });
                            }}
                            className="disabled:cursor-not-allowed h-4 w-4"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-left">
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
                            <label htmlFor="cname">{row.company_name}</label>
                          </button>
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
                            {showemails.includes(row.company_name) ? (
                              <ArrowUpNarrowWide />
                            ) : (
                              <ArrowDownNarrowWide />
                            )}
                          </button>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setEditCompany({
                                ["company_name"]: row.company_name,
                                ["companyID"]: row.id,
                              });
                              setShowEditCompany((prev) => !prev);
                            }}
                          >
                            <Pen />
                          </button>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setCompanyToDelete({
                                ["name"]: row.company_name,
                                ["companyID"]: row.id,
                              });
                              setDeleteCompany(true);
                            }}
                          >
                            <Trash2 />
                          </button>
                        </td>
                      </tr>
                      {showemails.includes(row.company_name) &&
                        row.email_ids.map((ids, i) => (
                          <tr
                            key={i}
                            className={`${
                              recipients
                                .map((r) => r.address)
                                .includes(ids.company_email)
                                ? "bg-slate-200"
                                : "bg-white"
                            } border-b`}
                          >
                            <td className="px-4 py-2">
                              <input
                                id={i}
                                type="checkbox"
                                disabled={processing == true}
                                checked={recipients
                                  .map((r) => r.address)
                                  .includes(ids.company_email)}
                                onChange={() =>
                                  setRecipients((prev) =>
                                    prev.some(
                                      (p) => p.address == ids.company_email
                                    )
                                      ? prev.filter(
                                          (p) => p.address != ids.company_email
                                        )
                                      : [
                                          ...prev,
                                          {
                                            ["address"]: ids.company_email,
                                            ["name"]: row.company_name,
                                          },
                                        ]
                                  )
                                }
                                className="disabled:cursor-not-allowed h-4 w-4 ml-[1.5rem]"
                              />
                            </td>
                            <td className=" px-4 py-2 whitespace-nowrap text-left text-xs">
                              <label htmlFor={i}>{ids.company_email}</label>
                            </td>
                            <td className=" py-2 whitespace-nowrap text-left">
                              <button
                                onClick={() => {
                                  setEmailToDelete({
                                    ["id"]: ids.id,
                                    ["company_email"]: ids.company_email,
                                  });
                                  setDeleteEmail(true);
                                }}
                              >
                                <Trash2 />
                              </button>
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
