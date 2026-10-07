import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles, RefreshCw, X } from 'lucide-react';

const SAMPLE_DEMO_JOB_DESCRIPTION = `Job Title: Software Developer
Location: Remote / Hybrid

We are looking for a versatile Software Developer to join our team.

Responsibilities:
- Build and maintain modern web applications with JavaScript and React.
- Develop scalable backend microservices and REST APIs using Node.js.
- Implement containerized deployments using Docker and manage cloud infrastructure on AWS.
- Collaborate on high-level System Design and database optimization.
- Work with Git version control in an agile sprint lifecycle.

Requirements & Core Skills:
- Strong proficiency in JavaScript and React frontend ecosystem.
- Solid experience in Node.js and REST API engineering.
- Familiarity with containerization using Docker.
- Experience or knowledge of cloud platforms, specifically AWS.
- Fundamental understanding of System Design, architecture patterns, and scalability principles.`;

const SAMPLE_DEMO_RESUME_TEXT = `ALEX RIVERA
Software Engineer | Full Stack Developer
alex.rivera@example.com | github.com/alexrivera

PROFESSIONAL SUMMARY
Enthusiastic Software Engineer with experience developing scalable web applications.
Proficient in modern JavaScript, React.js frontend development, and Node.js backend services.
Experienced in building RESTful APIs, handling MongoDB NoSQL databases, and managing code with Git.

TECHNICAL SKILLS
• Languages: JavaScript (ES6+), Python, HTML5, CSS3
• Frontend: React.js, Redux, Tailwind CSS
• Backend: Node.js, Express.js, REST API design
• Databases: MongoDB, MySQL
• Tools & Version Control: Git, GitHub, VS Code

PROJECTS & EXPERIENCE
E-Commerce Web Platform
• Developed responsive UI with React.js and Tailwind CSS.
• Implemented secure RESTful APIs using Node.js and Express.js.
• Integrated MongoDB for high-throughput product catalog queries.
• Maintained clean version control workflows using Git and GitHub.`;

export default function InputPage({ onAnalyze, isLoading, error, clearError }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'text'
  const [validationMsg, setValidationMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setValidationMsg('Please select a valid PDF file (.pdf).');
        setResumeFile(null);
        return;
      }
      setValidationMsg('');
      setResumeFile(file);
      setResumeText(''); // Clear direct text when file is loaded
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadDemoData = () => {
    setJobDescription(SAMPLE_DEMO_JOB_DESCRIPTION);
    setTargetRole('Software Developer');
    setInputMode('text');
    setResumeText(SAMPLE_DEMO_RESUME_TEXT);
    setResumeFile(null);
    setValidationMsg('');
    if (clearError) clearError();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationMsg('');
    if (clearError) clearError();

    // Check resume
    if (inputMode === 'file' && !resumeFile) {
      setValidationMsg('Please upload a PDF resume (or switch to text mode/load demo data).');
      return;
    }

    if (inputMode === 'text' && !resumeText.trim()) {
      setValidationMsg('Please provide resume text content.');
      return;
    }

    // Check job description
    if (!jobDescription.trim()) {
      setValidationMsg('Please enter or paste the target job description.');
      return;
    }

    onAnalyze({
      resumeFile: inputMode === 'file' ? resumeFile : null,
      resumeText: inputMode === 'text' ? resumeText : null,
      jobDescription,
      targetRole: targetRole || 'Software Developer',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Skill Gap Input</h2>
          <p className="text-xs text-slate-500">
            Provide a candidate resume and target job description to run the Explainable AI pipeline.
          </p>
        </div>

        {/* Demo Data Quick Load Button */}
        <button
          type="button"
          onClick={handleLoadDemoData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shadow-2xs self-start cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Load Demo Data (Viva Sample)</span>
        </button>
      </div>

      {/* Error or Validation Alert */}
      {(validationMsg || error) && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{validationMsg || error}</p>
            <p className="text-rose-600 text-[11px] mt-0.5">
              Make sure both candidate resume and job requirements are provided.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT SIDE: Resume Upload */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Candidate Resume</h3>
                    <p className="text-[11px] text-slate-500">PDF document or direct text</p>
                  </div>
                </div>

                {/* Input Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setInputMode('file')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      inputMode === 'file'
                        ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    PDF Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('text')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      inputMode === 'text'
                        ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Direct Text
                  </button>
                </div>
              </div>

              {/* Mode 1: PDF Upload */}
              {inputMode === 'file' ? (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                      resumeFile
                        ? 'border-emerald-300 bg-emerald-50/40'
                        : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {resumeFile ? (
                      <div className="flex flex-col items-center gap-2 text-emerald-800">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900 break-all">{resumeFile.name}</p>
                          <p className="text-xs text-slate-500">
                            {(resumeFile.size / 1024).toFixed(1)} KB • PDF Document Ready
                          </p>
                        </div>
                        <p className="text-[11px] text-blue-600 hover:underline mt-1">
                          Click to replace file
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2.5 text-slate-600">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">Upload PDF Resume</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Click to browse or drag & drop candidate PDF
                          </p>
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                          PyMuPDF Parser Ready
                        </span>
                      </div>
                    )}
                  </div>

                  {resumeFile && (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-mono text-slate-700 truncate">{resumeFile.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500">
                    <p className="font-medium text-slate-700 mb-0.5">Pre-built Sample PDF available:</p>
                    <a
                      href="/sample_resume.pdf"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-mono inline-flex items-center gap-1"
                    >
                      <span>Download sample_resume.pdf</span> &rarr;
                    </a>
                  </div>
                </div>
              ) : (
                /* Mode 2: Direct Text Input */
                <div className="space-y-2">
                  <textarea
                    rows={12}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste resume text directly (experience, technical skills, project details)..."
                    className="w-full text-xs font-mono p-3.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-y bg-slate-50/30"
                  />
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Direct text parsing fallback</span>
                    <span>{resumeText.length} characters</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Skills will be extracted, normalized, and converted into embeddings</span>
            </div>
          </div>

          {/* RIGHT SIDE: Job Description */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Job Description & Role</h3>
                  <p className="text-[11px] text-slate-500">Target role and required competencies</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Optional Target Job Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Job Role (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Software Developer"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                  />
                </div>

                {/* Job Description Textarea */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Description Requirements
                  </label>
                  <textarea
                    rows={9}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the Job Description here (e.g. responsibilities, required skills such as JavaScript, React, Node.js, Docker, AWS, System Design)..."
                    className="w-full text-xs font-mono p-3.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-y bg-slate-50/30"
                  />
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                    <span>Job requirements text input</span>
                    <span>{jobDescription.length} characters</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>Job competencies are extracted & compared against resume evidence</span>
            </div>
          </div>
        </div>

        {/* BOTTOM: Action Button */}
        <div className="flex flex-col items-center justify-center pt-2 gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-bold text-sm transition-all shadow-md active:scale-98 cursor-pointer min-w-[280px] ${
              isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing skills...</span>
              </>
            ) : (
              <>
                <span>Analyze Skill Gap</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {isLoading && (
            <div className="text-center space-y-1">
              <p className="text-xs font-semibold text-slate-700 animate-pulse">
                Running pipeline: Text Extraction → Normalization → SentenceTransformers → Gap Classification
              </p>
              <p className="text-[11px] text-slate-500">
                Calculating cosine similarities using all-MiniLM-L6-v2 embeddings...
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

