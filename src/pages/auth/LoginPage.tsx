import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, ScanEye, Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import type { UserRole } from "@/types/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginAs, loginWithCredentials } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"creds" | UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Bitte E-Mail und Passwort eingeben.");
      return;
    }
    setLoading("creds");
    try {
      const user = await loginWithCredentials(email, password);
      navigate(user.role === "hausarzt" ? "/dashboard" : "/expert/dashboard");
    } catch {
      setError("Anmeldung fehlgeschlagen.");
    } finally {
      setLoading(null);
    }
  }

  async function demoLogin(role: UserRole) {
    setLoading(role);
    const user = await loginAs(role);
    navigate(user.role === "hausarzt" ? "/dashboard" : "/expert/dashboard");
    setLoading(null);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-32 -right-20 w-[460px] h-[460px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-[360px] h-[360px] rounded-full bg-white/10 blur-3xl" />
        </div>
        <Logo withText={false} className="text-white" />
        <div className="relative">
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            Digitale dermatologische Konsile für die hausärztliche Versorgung.
          </h1>
          <p className="mt-4 text-brand-100/90 max-w-md">
            Sichere Befund-Anfragen, strukturierte Bilddokumentation und schnelle
            Expert:innen-Einschätzungen — in einer Plattform.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
            <Feature icon={<ShieldCheck className="w-4 h-4" />} title="DSGVO-konform" desc="Daten in Deutschland." />
            <Feature icon={<Stethoscope className="w-4 h-4" />} title="Strukturierte Anamnese" desc="Mit Bilddokumentation." />
            <Feature icon={<ScanEye className="w-4 h-4" />} title="Expert:innen-Befund" desc="Innerhalb von 24h." />
            <Feature icon={<Mail className="w-4 h-4" />} title="Sichere Kommunikation" desc="Direkter Rückfragen-Thread." />
          </div>
        </div>
        <div className="relative text-xs text-brand-100/80">
          © {new Date().getFullYear()} Derma Consult · Demo-Umgebung
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-ink-900 tracking-tight">Anmelden</h2>
            <p className="text-sm text-ink-600 mt-1">
              Willkommen zurück. Bitte melden Sie sich an, um fortzufahren.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Field label="E-Mail" htmlFor="email" required>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@praxis.de"
                  className="pl-9"
                  autoComplete="email"
                />
              </div>
            </Field>
            <Field label="Passwort" htmlFor="password" required>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  autoComplete="current-password"
                />
              </div>
            </Field>

            {error && (
              <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading === "creds"}>
              Anmelden
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-ink-500">
            <div className="flex-1 h-px bg-ink-200" />
            Demo-Zugang
            <div className="flex-1 h-px bg-ink-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => demoLogin("hausarzt")}
              loading={loading === "hausarzt"}
            >
              <Stethoscope className="w-4 h-4" /> Als Hausarzt:in
            </Button>
            <Button
              variant="outline"
              onClick={() => demoLogin("dermatologist")}
              loading={loading === "dermatologist"}
            >
              <ScanEye className="w-4 h-4" /> Als Dermatolog:in
            </Button>
          </div>

          <div className="mt-8 text-center text-sm text-ink-600">
            Noch keinen Zugang?{" "}
            <a className="text-brand-700 hover:underline" href="#register">
              Praxis registrieren
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-md bg-white/10 grid place-items-center">{icon}</div>
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-brand-100/80">{desc}</div>
      </div>
    </div>
  );
}
