"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api/client";

type RoleQuestionInputType = "text" | "textarea" | "url" | "number";

type RoleQuestion = {
  id: string;
  question: string;
  isRequired: boolean;
  inputType: RoleQuestionInputType;
  sortOrder: number;
};

type RoleDetail = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  deadlineAt: string | null;
  questions: RoleQuestion[];
};

type ApplicationSummary = {
  id: string;
  roleId: string;
  status: string;
};

type ApplicationDetail = {
  id: string;
  status: string;
  note: string | null;
  answers: Array<{ roleQuestionId: string; answer: string }>;
};

type ApiResponse<T> = {
  data: T;
};

type MessageKind = "success" | "error" | "info";

export default function RoleDetailPage() {
  const params = useParams<{ roleId: string }>();
  const router = useRouter();
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [role, setRole] = useState<RoleDetail | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);

  const [note, setNote] = useState("");
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, string>>({});

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didAttemptSubmit, setDidAttemptSubmit] = useState(false);

  const [message, setMessage] = useState<{ kind: MessageKind; text: string } | null>(null);

  const orderedQuestions = useMemo(() => {
    if (!role?.questions) {
      return [];
    }

    return [...role.questions].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [role?.questions]);

  const requiredMissingQuestionIds = useMemo(() => {
    return orderedQuestions
      .filter((question) => question.isRequired)
      .map((question) => question.id)
      .filter((questionId) => !String(answersByQuestionId[questionId] ?? "").trim());
  }, [answersByQuestionId, orderedQuestions]);

  useEffect(() => {
    const run = async () => {
      setIsLoadingRole(true);
      setRoleError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/roles/${params.roleId}`, { credentials: "include" });
        if (!response.ok) {
          setRoleError("Unable to load this role right now.");
          setRole(null);
          return;
        }

        const json = (await response.json()) as ApiResponse<RoleDetail | null>;
        setRole(json.data ?? null);
      } catch {
        setRoleError("Could not connect to the server. Please try again.");
      } finally {
        setIsLoadingRole(false);
      }
    };

    void run();
  }, [params.roleId]);

  useEffect(() => {
    const run = async () => {
      setIsLoadingDraft(true);
      try {
        const mineResponse = await fetch(`${API_BASE_URL}/applications/mine`, { credentials: "include" });
        if (mineResponse.status === 401) {
          return;
        }

        if (!mineResponse.ok) {
          return;
        }

        const mineJson = (await mineResponse.json()) as ApiResponse<ApplicationSummary[]>;
        const existing = (mineJson.data ?? []).find((application) => application.roleId === params.roleId);
        if (!existing) {
          return;
        }

        setApplicationId(existing.id);
        setApplicationStatus(existing.status);

        const detailResponse = await fetch(`${API_BASE_URL}/applications/${existing.id}`, {
          credentials: "include",
        });
        if (!detailResponse.ok) {
          return;
        }

        const detailJson = (await detailResponse.json()) as ApiResponse<ApplicationDetail | null>;
        const detail = detailJson.data;
        if (!detail) {
          return;
        }

        setNote(detail.note ?? "");
        setAnswersByQuestionId(
          Object.fromEntries(
            (detail.answers ?? []).map((entry) => [entry.roleQuestionId, entry.answer]),
          ),
        );
      } finally {
        setIsLoadingDraft(false);
      }
    };

    void run();
  }, [params.roleId]);

  const readErrorMessage = async (response: Response) => {
    try {
      const errorBody = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(errorBody.message)) {
        return errorBody.message.join(", ");
      }

      if (typeof errorBody.message === "string" && errorBody.message.length > 0) {
        return errorBody.message;
      }
    } catch {
      return null;
    }

    return null;
  };

  const saveApplication = async (submit: boolean) => {
    setMessage(null);
    if (!role) {
      setMessage({ kind: "error", text: "Role data is not loaded yet." });
      return;
    }

    if (submit) {
      setDidAttemptSubmit(true);
      if (requiredMissingQuestionIds.length > 0) {
        setMessage({
          kind: "error",
          text: "Please answer all required questions before submitting.",
        });
        return;
      }
    }

    if (submit) {
      setIsSubmitting(true);
    } else {
      setIsSavingDraft(true);
    }

    const answers = orderedQuestions
      .map((question) => ({
        questionId: question.id,
        answer: String(answersByQuestionId[question.id] ?? "").trim(),
      }))
      .filter((answer) => answer.answer.length > 0);

    const payload = {
      roleId: params.roleId,
      note: note.trim() || undefined,
      answers,
      submit,
    };

    try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      router.push(`/sign-in?next=/roles/${params.roleId}`);
      return;
    }

    if (!response.ok) {
      const errorMessage = await readErrorMessage(response);
      setMessage({
        kind: "error",
        text: errorMessage ?? "Unable to save your application right now.",
      });
      return;
    }

      const json = (await response.json()) as ApiResponse<{ application: { id: string; status: string } }>;
      setApplicationId(json.data.application.id);
      setApplicationStatus(json.data.application.status);
      setMessage({
        kind: "success",
        text: submit ? "Application submitted successfully." : "Draft saved.",
      });
    } catch {
      setMessage({
        kind: "error",
        text: "Network error while saving application. Please try again.",
      });
    } finally {
      if (submit) {
        setIsSubmitting(false);
      } else {
        setIsSavingDraft(false);
      }
    }
  };

  const renderQuestionInput = (question: RoleQuestion) => {
    const value = answersByQuestionId[question.id] ?? "";

    if (question.inputType === "textarea") {
      return (
        <textarea
          value={value}
          onChange={(event) =>
            setAnswersByQuestionId((current) => ({ ...current, [question.id]: event.target.value }))
          }
          className="mt-2 min-h-28 w-full rounded-md border border-border px-3 py-2"
          placeholder="Type your answer"
        />
      );
    }

    return (
      <input
        type={question.inputType === "number" ? "number" : question.inputType === "url" ? "url" : "text"}
        value={value}
        onChange={(event) =>
          setAnswersByQuestionId((current) => ({ ...current, [question.id]: event.target.value }))
        }
        className="mt-2 w-full rounded-md border border-border px-3 py-2"
        placeholder="Type your answer"
      />
    );
  };

  if (isLoadingRole) {
    return <div className="mx-auto max-w-3xl px-6 py-14">Loading role...</div>;
  }

  if (roleError) {
    return <div className="mx-auto max-w-3xl px-6 py-14">{roleError}</div>;
  }

  if (!role) {
    return <div className="mx-auto max-w-3xl px-6 py-14">Role not found.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-4xl font-semibold">{role.title}</h1>
      <p className="mt-4 text-zinc-700">{role.description ?? "No description yet."}</p>
      <p className="mt-2 text-sm text-zinc-500">Role status: {role.status}</p>
      {role.deadlineAt ? <p className="mt-1 text-sm text-zinc-500">Deadline: {new Date(role.deadlineAt).toLocaleString()}</p> : null}

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold">Application Builder</h2>
          {applicationStatus ? (
            <span className="rounded-full bg-muted px-3 py-1 text-xs uppercase tracking-wide text-zinc-700">
              Current status: {applicationStatus.replaceAll("_", " ")}
            </span>
          ) : null}
        </div>
        {isLoadingDraft ? <p className="mt-2 text-sm text-zinc-500">Checking for existing draft...</p> : null}
        <label className="mt-4 block text-sm font-medium">Application Note</label>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="mt-2 min-h-28 w-full rounded-md border border-border px-3 py-2"
          placeholder="Tell the team why this role fits you"
        />

        {orderedQuestions.length > 0 ? (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Role Questions</h3>
            {orderedQuestions.map((question) => {
              const hasError =
                didAttemptSubmit &&
                question.isRequired &&
                String(answersByQuestionId[question.id] ?? "").trim().length === 0;

              return (
                <div key={question.id}>
                  <label className="text-sm font-medium">
                    {question.question} {question.isRequired ? <span className="text-red-600">*</span> : null}
                  </label>
                  {renderQuestionInput(question)}
                  {hasError ? <p className="mt-1 text-xs text-red-600">This question is required.</p> : null}
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => void saveApplication(false)}
            disabled={isSavingDraft || isSubmitting}
            className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-60"
          >
            {isSavingDraft ? "Saving..." : applicationId ? "Update Draft" : "Save Draft"}
          </button>
          <button
            onClick={() => void saveApplication(true)}
            disabled={isSavingDraft || isSubmitting}
            className="rounded-md bg-accent px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </div>

        {message ? (
          <p className={`mt-3 text-sm ${message.kind === "error" ? "text-red-600" : "text-zinc-700"}`}>
            {message.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}
