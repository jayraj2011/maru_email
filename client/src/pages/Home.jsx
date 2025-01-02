import { useState, useMemo, useRef } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import JoditEditor from "jodit-react";

const Home = () => {
  const editor = useRef(null);
  const [tab, setTab] = useState("draft");
  const [editorContent, setEditorContent] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [searchfilter, setSearchFilter] = useState("");
  const [processing, setProcessing] = useState(false);
  const [rows, setRows] = useState([
    {
      email: "john@example.com",
      company: "Example Corp",
    },
    {
      email: "kotakkashyap2803@gmail.com",
      company: " Quixilinx LLP",
    },
    { email: "jane@example.com", company: "Tech Ltd" },
    {
      email: "bob@example.com",
      company: "Design Inc",
    },
    {
      email: "alice@example.com",
      company: "Solutions LLC",
    },
    {
      email: "jayrajb95@gmail.com",
      company: "Quixilinx LLP",
    },
  ]);

  const config = {
    readonly: false, // all options from https://xdsoft.net/jodit/docs/,
    placeholder: "Start typings...",
  };

  const handlesend = async (e) => {
    try {
      if (recipients.length == 0) {
        toast.error("No Email Selected");
      }
      setProcessing(true);
      const res = await axios.post("http://localhost:4123/send", {
        ["recipients"]: recipients,
      });
      // console.log("res", res.data);
      setProcessing(false);
      toast.success(res.data.message);
    } catch (error) {
      console.log("error", error);
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

  const filteredEmails = rows.filter((row) =>
    row.email.toLowerCase().includes(searchfilter.toLowerCase())
  );

  console.log("recipients", Array.isArray(recipients));

  return (
    <>
      {processing && (
        <div className="absolute z-10 inset-0 bg-slate-300 opacity-50 flex flex-col items-center justify-center">
          <p className="text-xl">Please wait...</p>
          <div class="loader">
            <div class="loader__bar"></div>
            <div class="loader__bar"></div>
            <div class="loader__bar"></div>
            <div class="loader__bar"></div>
            <div class="loader__bar"></div>
            <div class="loader__ball"></div>
          </div>
        </div>
      )}

      <nav className="flex text-center gap-6" aria-label="Tabs">
        <button
          onClick={() => setTab("draft")}
          className={`shrink-0 rounded-lg p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 ${
            tab == "draft" && "border-b-2 border-blue-500"
          }`}
        >
          Draft
        </button>
        <button
          onClick={() => setTab("to")}
          className={`shrink-0 rounded-lg p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 ${
            tab == "to" && "border-b-2 border-blue-500"
          }`}
        >
          Senders
        </button>
      </nav>

      {tab == "draft" && (
        <div className="relative top-[10vh] min-h-screen max-w-[90%] md:max-w-[75%] w-full mx-auto">
          <header className="flex my-2 justify-between p-5">
            <h1 className=" font-medium text-xl md:text-3xl">Email Deaft</h1>
          </header>
          <JoditEditor
            ref={editor}
            value={editorContent}
            config={config}
            tabIndex={1} // tabIndex of textarea
            onChange={(newContent) => setEditorContent(newContent)} // preferred to use only this option to update the content for performance reasons
          />
          {/* <div className="email-editor-container">
            <div className="content-preview">
              <h3>Preview</h3>
              <div dangerouslySetInnerHTML={{ __html: editorContent }} />
            </div>
          </div> */}
        </div>
      )}

      {tab == "to" && (
        <div className="relative top-[10vh] min-h-screen max-w-[90%] md:max-w-[75%] w-full mx-auto">
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
                {filteredEmails.map((row, index) => (
                  <tr
                    key={index}
                    className={`${
                      recipients.includes(row.email)
                        ? "bg-slate-200"
                        : "bg-white"
                    } border-b`}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        disabled={processing == true}
                        checked={recipients.includes(row.email)}
                        onChange={() => toggleSelect(row.email)}
                        className="disabled:cursor-not-allowed h-4 w-4"
                      />
                    </td>
                    <td className="px-4 py-2 ">{row.email}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      {row.company}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
