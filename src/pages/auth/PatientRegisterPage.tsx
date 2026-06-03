import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Lock, Mail, Calendar, ShieldCheck, UserRound, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { inviteService } from "@/services/inviteService";
import { patientService } from "@/services/patientService";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

type InviteState =
  | { status: "loading" }
  | { status: "invalid"; reason: string }
  | { status: "ready"; patientName: string; createdByName: string };

export default function PatientRegisterPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { registerPatient } = useAuth();

  const [invite, setInvite] = useState<InviteState>({ status: "loading" });
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!token) {
        setInvite({ status: "invalid", reason: "Kein Einladungs-Token vorhanden." });
        return;
      }
      const found = await inviteService.getByToken(token);
      if (!active) return;
      if (!found) {
        setInvite({ status: "invalid", reason: "Diese Einladung ist ungültig." });
        return;
      }
      if (found.status === "expired") {
        setInvite({ status: "invalid", reason: "Diese Einladung ist abgelaufen." });
        return;
      }
      if (found.status === "accepted") {
        setInvite({
          status: "invalid",
          reason: "Diese Einladung wurde bereits verwendet. Bitte melden Sie sich an.",
        });
        return;
      }
      const patient = await patientService.get(found.patientId);
      if (!active) return;
      setInvite({
        status: "ready",
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Patient:in",
        createdByName: found.createdByName,
      });
    })();
    return () => {
      active = false;
    };
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!dob || !email || !password) {
      setError("Bitte füllen Sie alle Felder aus.");
      return;
    }
    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    setSubmitting(true);
    try {
      await registerPatient(token!, { email, password, dobConfirm: dob });
      navigate("/portal", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrierung fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-violet-700 via-violet-600 to-violet-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-32 -right-20 w-[460px] h-[460px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-[360px] h-[360px] rounded-full bg-white/10 blur-3xl" />
        </div>
        <Logo withText={false} className="text-white" />
        <div className="relative">
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            Ihr persönlicher Zugang zur Behandlung.
          </h1>
          <p className="mt-4 text-violet-100/90 max-w-md">
            Sehen Sie Ihren Behandlungsplan, verständliche Informationen zu Ihrer Erkrankung und
            laden Sie auf Wunsch Ihrer Ärztin oder Ihres Arztes zusätzliche Bilder hoch.
          </p>
          <div className="mt-10 flex items-center gap-2.5 text-sm text-violet-100/90">
            <ShieldCheck className="w-4 h-4" /> Ihre Daten werden DSGVO-konform in Deutschland gespeichert.
          </div>
        </div>
        <div className="relative text-xs text-violet-100/80">
          © {new Date().getFullYear()} Derma Consult · Patientenportal
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          {invite.status === "loading" && (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {invite.status === "invalid" && (
            <EmptyState
              icon={<AlertTriangle className="w-5 h-5" />}
              title="Registrierung nicht möglich"
              description={invite.reason}
              action={
                <Link to="/login">
                  <Button variant="outline">Zur Anmeldung</Button>
                </Link>
              }
            />
          )}

          {invite.status === "ready" && (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 text-sm text-violet-700 bg-violet-50 ring-1 ring-violet-200 rounded-full px-3 py-1 mb-4">
                  <UserRound className="w-4 h-4" /> {invite.patientName}
                </div>
                <h2 className="text-2xl font-semibold text-ink-900 tracking-tight">Konto einrichten</h2>
                <p className="text-sm text-ink-600 mt-1">
                  Eingeladen von {invite.createdByName}. Bitte bestätigen Sie Ihre Identität und
                  vergeben Sie ein Passwort.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Field label="Geburtsdatum (zur Bestätigung)" htmlFor="dob" required>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </Field>
                <Field label="E-Mail" htmlFor="email" required>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.de"
                      className="pl-9"
                      autoComplete="email"
                    />
                  </div>
                </Field>
                <Field label="Passwort" htmlFor="password" required hint="Mindestens 6 Zeichen">
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9"
                      autoComplete="new-password"
                    />
                  </div>
                </Field>

                {error && (
                  <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" loading={submitting}>
                  Konto erstellen
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
