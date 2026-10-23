import { signIn } from '@/lib/actions/auth';
export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-lg shadow-sm border border-gray-100">
      <h1 className="text-2xl font-serif text-center mb-6">Seller Login</h1>
      <form action={signIn} className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Email</label><input name="email" type="email" required className="input-field" /></div>
        <div><label className="block text-sm font-medium mb-1">Password</label><input name="password" type="password" required className="input-field" /></div>
        <button type="submit" className="btn-primary w-full">Sign In</button>
      </form>
      <p className="text-center text-sm mt-4 text-gray-600">No account? <a href="/register" className="text-[var(--primary)] underline">Register here</a></p>
    </div>
  );
}
