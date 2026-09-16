import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ArrowLeft, Eye, EyeOff, Lock, Mail, MailCheck, ShieldAlert } from 'lucide-react';
import { WcbtCrest } from '@/components/layout/WcbtCrest';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Input } from '@/components/ui/Field';
import { useAuth } from '@/context/AuthContext';
import { requestPasswordReset } from '@/api/auth';
import {
  forgotPasswordSchema,
  loginSchema,
  type ForgotPasswordValues,
  type LoginValues,
} from '@/validation/auth';

type PanelStep = 'login' | 'forgot' | 'sent';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<PanelStep>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [resetEmail, setResetEmail] = useState('');

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '', remember: true },
  });

  const forgotForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  if (isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? '/dashboard'} replace />;
  }

  const onSubmit = loginForm.handleSubmit(async (values) => {
    setError(null);
    try {
      await login(values);
      navigate('/dashboard', { replace: true });
    } catch (caught) {
      setAttempts((current) => current + 1);
      setError((caught as Error).message);
      loginForm.resetField('password');
    }
  });

  const onForgotSubmit = forgotForm.handleSubmit(async (values) => {
    await requestPasswordReset(values.email);
    setResetEmail(values.email);
    setStep('sent');
  });

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <section className="wcbt-circuit relative hidden flex-col items-center justify-center bg-wcbt-maroon px-10 text-center text-white lg:flex">
        <WcbtCrest className="h-24 w-24 text-white/95" />
        <h1 className="mt-6 max-w-sm text-2xl font-semibold tracking-tight">
          WhiteHouse College of Business &amp; Technology
        </h1>
        <p className="mt-3 text-lg font-medium text-white/90">Learn. Innovate. Lead.</p>
        <p className="mt-1 text-sm text-white/70">Birtamod Campus</p>
        <p className="absolute bottom-8 text-xs text-white/60">
          Affiliated to Kathmandu University · whitehouseeducation.edu.np
        </p>
      </section>

      <section className="flex items-center justify-center bg-wcbt-surface px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <WcbtCrest className="h-10 w-10 text-wcbt-maroon" />
            <div>
              <p className="font-semibold tracking-tight text-wcbt-ink">WCBT Admin Portal</p>
              <p className="text-xs text-wcbt-muted">Birtamod Campus</p>
            </div>
          </div>

          {step === 'login' && (
            <>
              <h2 className="text-2xl font-semibold tracking-tight text-wcbt-ink">Welcome back</h2>
              <p className="mt-1 text-sm text-wcbt-muted">Sign in to manage the campus portal.</p>

              {error && (
                <div className="mt-5 flex items-start gap-2 rounded-lg bg-wcbt-danger/10 p-3 text-sm text-wcbt-danger">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <p role="alert">{error}</p>
                </div>
              )}

              {attempts >= 3 && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-wcbt-warning/10 p-3 text-sm text-wcbt-warning">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <p>
                    Three failed attempts. After two more, this account will be locked for 15 minutes
                    under the campus password policy.
                  </p>
                </div>
              )}

              <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
                <Field
                  label="Email or username"
                  htmlFor="identifier"
                  required
                  error={loginForm.formState.errors.identifier?.message}
                >
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wcbt-muted"
                      aria-hidden="true"
                    />
                    <Input
                      id="identifier"
                      autoComplete="username"
                      placeholder="principal@wcbt.edu.np"
                      className="pl-9"
                      invalid={Boolean(loginForm.formState.errors.identifier)}
                      {...loginForm.register('identifier')}
                    />
                  </div>
                </Field>

                <Field
                  label="Password"
                  htmlFor="password"
                  required
                  error={loginForm.formState.errors.password?.message}
                  hint={
                    <button
                      type="button"
                      onClick={() => setStep('forgot')}
                      className="text-xs text-wcbt-maroon hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
                    >
                      Forgot password?
                    </button>
                  }
                >
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wcbt-muted"
                      aria-hidden="true"
                    />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="px-9"
                      invalid={Boolean(loginForm.formState.errors.password)}
                      {...loginForm.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-wcbt-muted transition-colors hover:text-wcbt-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                <Checkbox id="remember" label="Remember me" {...loginForm.register('remember')} />

                <Button
                  type="submit"
                  className="w-full justify-center"
                  loading={loginForm.formState.isSubmitting}
                >
                  {loginForm.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-6 rounded-lg bg-wcbt-cream p-3 text-xs text-wcbt-muted">
                <p className="font-medium text-wcbt-ink">Demo accounts</p>
                <p className="mt-1">principal@wcbt.edu.np — Super Admin</p>
                <p>admissions@wcbt.edu.np — Admin</p>
                <p>nabin@wcbt.edu.np — Staff</p>
                <p className="mt-1">Password for all: wcbt1234</p>
              </div>
            </>
          )}

          {step === 'forgot' && (
            <>
              <h2 className="text-2xl font-semibold tracking-tight text-wcbt-ink">Reset password</h2>
              <p className="mt-1 text-sm text-wcbt-muted">
                Enter the email linked to your portal account and we will send a reset link.
              </p>

              <form onSubmit={onForgotSubmit} className="mt-6 space-y-4" noValidate>
                <Field
                  label="Email"
                  htmlFor="reset-email"
                  required
                  error={forgotForm.formState.errors.email?.message}
                >
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wcbt-muted"
                      aria-hidden="true"
                    />
                    <Input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@wcbt.edu.np"
                      className="pl-9"
                      invalid={Boolean(forgotForm.formState.errors.email)}
                      {...forgotForm.register('email')}
                    />
                  </div>
                </Field>

                <Button
                  type="submit"
                  className="w-full justify-center"
                  loading={forgotForm.formState.isSubmitting}
                >
                  Send reset link
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-center"
                  onClick={() => setStep('login')}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to sign in
                </Button>
              </form>
            </>
          )}

          {step === 'sent' && (
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-wcbt-success/10">
                <MailCheck className="h-6 w-6 text-wcbt-success" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-wcbt-ink">
                Check your email
              </h2>
              <p className="mt-2 text-sm text-wcbt-muted">
                If an account exists for <span className="font-medium text-wcbt-ink">{resetEmail}</span>,
                a reset link is on its way. The link expires in 30 minutes.
              </p>
              <Button
                variant="outline"
                className="mt-6 w-full justify-center"
                onClick={() => {
                  forgotForm.reset();
                  setStep('login');
                }}
              >
                Back to sign in
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
