"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api/client";

type ApplicationEvent = {
  id: string;
  eventType: string;
  fromStatus: string | null;
  toStatus: string | null;
  createdAt: string;
};

type ApplicationNote = {
  id: string;
  note: string;
  createdAt: string;
};

type ApplicationAnswer = {
  id: string;
  roleQuestionId: string;
  answer: string;
};

type ApplicationDetail = {
  id: string;
  roleId: string;
  status: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  events: ApplicationEvent[];
  notes: ApplicationNote[];
  answers: ApplicationAnswer[];
};

type RoleDetail = {
  questions: Array<{ id: string; question: string }>;
};

type ApiResponse<T> = {
  data: T;
};

export default function ApplicationDetailPage() {
  const params = useParams<{ applicationId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [questionTextById, setQuestionTextById] = useState<Record<string, string>>({});

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/applications/${params.applicationId}`, {
          credentials: "include",
        });
        if (!response.ok) {
          setError("Unable to load this application.");
          return;
        }

        const json = (await response.json()) as ApiResponse<ApplicationDetail | null>;
        const detail = json.data;
        setApplication(detail);

        if (!detail?.roleId) {
          return;
        }

        const roleResponse = await fetch(`${API_BASE_URL}/roles/${detail.roleId}`, {
          credentials: "include",
        });
        if (!roleResponse.ok) {
          return;
        }

        const roleJson = (await roleResponse.json()) as ApiResponse<RoleDetail | null>;
        const questions = roleJson.data?.questions ?? [];
        setQuestionTextById(
          Object.fromEntries(questions.map((question) => [question.id, question.question])),
        );
      } catch {
        setError("Could not connect to the server.");
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, [params.applicationId]);

  if (isLoading) {
    return <div>Loading application...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!application) {
    return <div>Application not found.</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">Application {application.id}</h1>
        <p className="mt-2 text-sm text-zinc-600">Status: {application.status}</p>
        <p className="mt-1 text-xs text-zinc-500">
          Last updated: {new Date(application.updatedAt).toLocaleString()}
        </p>
        {application.submittedAt ? (
          <p className="mt-1 text-xs text-zinc-500">
            Submitted: {new Date(application.submittedAt).toLocaleString()}
          </p>
        ) : null}
        <p className="mt-5 text-zinc-700">{application.note ?? "No note provided."}</p>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Your Answers</h2>
          {(application.answers ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600">No role question answers were included.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {(application.answers ?? []).map((answer) => (
                <li key={answer.id} className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-zinc-800">
                    {questionTextById[answer.roleQuestionId] ?? `Question ${answer.roleQuestionId}`}
                  </p>
                  <p className="mt-1 text-sm text-zinc-700">{answer.answer}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Event Timeline</h2>
        <ul className="mt-4 space-y-3 text-sm text-zinc-700">
          {(application.events ?? []).map((event) => (
            <li key={event.id} className="rounded-lg bg-muted p-3">
              <p>
                {event.eventType} {event.fromStatus ? `${event.fromStatus} -> ${event.toStatus}` : ""}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{new Date(event.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-lg font-semibold">Casting Notes</h2>
        {(application.notes ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">No notes have been added yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {(application.notes ?? []).map((note) => (
              <li key={note.id} className="rounded-lg bg-muted p-3">
                <p className="text-sm text-zinc-700">{note.note}</p>
                <p className="mt-1 text-xs text-zinc-500">{new Date(note.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
